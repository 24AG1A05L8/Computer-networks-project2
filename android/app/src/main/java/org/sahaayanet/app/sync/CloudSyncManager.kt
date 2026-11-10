package org.sahaayanet.app.sync

import android.content.Context
import android.net.ConnectivityManager
import android.net.Network
import android.net.NetworkCapabilities
import android.net.NetworkRequest
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONArray
import org.json.JSONObject
import org.sahaayanet.app.data.local.SahaayaDatabase
import java.util.concurrent.TimeUnit

/**
 * SahaayaNet Online Synchronization Manager
 * Detects return of cellular or Wi-Fi internet connectivity and performs secure batch upload
 * of store-carry-forward bundles and local SOS alerts to the central command server.
 */
class CloudSyncManager(
    private val context: Context,
    private val myNodeId: String,
    private val serverBaseUrl: String = "https://ais-dev-dpnrnq3sfhswoqgm3ryfsy-489505497612.asia-southeast1.run.app"
) {
    companion object {
        private const val TAG = "CloudSyncManager"
        private val JSON_MEDIA_TYPE = "application/json; charset=utf-8".toMediaType()
    }

    private val db = SahaayaDatabase.getDatabase(context)
    private val coroutineScope = CoroutineScope(Dispatchers.IO)
    private val connectivityManager =
        context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(15, TimeUnit.SECONDS)
        .build()

    private val _isOnline = MutableStateFlow(false)
    val isOnline: StateFlow<Boolean> = _isOnline

    private val _lastSyncTimestamp = MutableStateFlow<Long?>(null)
    val lastSyncTimestamp: StateFlow<Long?> = _lastSyncTimestamp

    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            Log.i(TAG, "Internet network capability detected. Triggering online synchronization...")
            _isOnline.value = true
            triggerBatchSync()
        }

        override fun onLost(network: Network) {
            Log.i(TAG, "Network connection lost. Returning to fully offline mesh mode.")
            _isOnline.value = false
        }
    }

    fun startMonitoring() {
        val request = NetworkRequest.Builder()
            .addCapability(NetworkCapabilities.NET_CAPABILITY_INTERNET)
            .build()
        connectivityManager.registerNetworkCallback(request, networkCallback)
    }

    fun stopMonitoring() {
        try {
            connectivityManager.unregisterNetworkCallback(networkCallback)
        } catch (_: Exception) {}
    }

    fun triggerBatchSync() {
        coroutineScope.launch {
            try {
                val unsyncedMessages = db.messageDao().getUnsyncedMessages()
                val unsyncedAlerts = db.sosAlertDao().getUnsyncedAlerts()

                if (unsyncedMessages.isEmpty() && unsyncedAlerts.isEmpty()) {
                    Log.d(TAG, "No pending records to sync")
                    return@launch
                }

                Log.i(TAG, "Syncing ${unsyncedMessages.size} bundles and ${unsyncedAlerts.size} SOS alerts")

                val bundlesArray = JSONArray()
                for (msg in unsyncedMessages) {
                    val bundleJson = JSONObject(msg.payloadJson)
                    bundlesArray.put(bundleJson)
                }

                val syncPayload = JSONObject().apply {
                    put("gatewayNodeId", myNodeId)
                    put("syncTimestamp", System.currentTimeMillis())
                    put("bundles", bundlesArray)
                    put("observedPeers", JSONArray())
                }

                val requestBody = syncPayload.toString().toRequestBody(JSON_MEDIA_TYPE)
                val request = Request.Builder()
                    .url("$serverBaseUrl/api/sync/mesh-bundle")
                    .post(requestBody)
                    .build()

                val response = httpClient.newCall(request).execute()
                if (response.isSuccessful) {
                    val responseBody = response.body?.string() ?: ""
                    val jsonResponse = JSONObject(responseBody)
                    val ackedBundleIds = jsonResponse.getJSONArray("acknowledgedBundleIds")

                    val ackedList = mutableListOf<String>()
                    for (i in 0 until ackedBundleIds.length()) {
                        ackedList.add(ackedBundleIds.getString(i))
                    }

                    // Mark synced in local Room DB
                    db.messageDao().markAsSynced(ackedList)

                    val alertIds = unsyncedAlerts.map { it.alertId }
                    db.sosAlertDao().markAlertsSynced(alertIds, System.currentTimeMillis())

                    // Process downstream dispatches/orders from EOC to carry into offline mesh
                    if (jsonResponse.has("newDispatchesForMesh")) {
                        val dispatchesArray = jsonResponse.getJSONArray("newDispatchesForMesh")
                        for (i in 0 until dispatchesArray.length()) {
                            val downstreamBundle = dispatchesArray.getJSONObject(i)
                            val header = downstreamBundle.getJSONObject("header")
                            val payload = downstreamBundle.getJSONObject("payload")
                            val bId = header.getString("bundleId")

                            if (header.getString("payloadType") == "STATUS_UPDATE") {
                                val targetAlertId = payload.optString("alertId")
                                val newStatus = payload.optString("status")
                                if (targetAlertId.isNotEmpty() && newStatus.isNotEmpty()) {
                                    db.sosAlertDao().updateAlertStatus(targetAlertId, newStatus)
                                }
                            }

                            // Buffer downstream packet into Room so this node carries it forward
                            val downstreamMessage = org.sahaayanet.app.data.local.entity.MessageEntity(
                                bundleId = bId,
                                originNodeId = header.getString("originNodeId"),
                                destinationNodeId = header.optString("destinationNodeId", "BROADCAST"),
                                payloadType = header.getString("payloadType"),
                                payloadJson = downstreamBundle.toString(),
                                priority = header.optInt("priority", 1),
                                hopCount = 0,
                                maxHops = header.optInt("maxHops", 7),
                                timeToLiveSeconds = header.optLong("timeToLiveSeconds", 86400L),
                                createdTimestamp = header.getLong("createdTimestamp"),
                                isDelivered = false,
                                isSyncedToCloud = true,
                                hopsHistoryJson = "[\"GATEWAY_EOC:DOWNSTREAM\"]"
                            )
                            db.messageDao().insertMessage(downstreamMessage)
                        }
                    }

                    _lastSyncTimestamp.value = System.currentTimeMillis()
                    Log.i(TAG, "Sync completed successfully: ${ackedList.size} bundles acknowledged by central server")
                } else {
                    Log.e(TAG, "Sync request failed with status code: ${response.code}")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Online synchronization error", e)
            }
        }
    }
}
