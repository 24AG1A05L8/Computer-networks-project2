package org.sahaayanet.app.mesh.routing

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import org.sahaayanet.app.data.local.SahaayaDatabase
import org.sahaayanet.app.data.local.entity.MessageEntity
import org.sahaayanet.app.data.local.entity.SosAlertEntity
import org.sahaayanet.app.mesh.crypto.BundleCrypto

/**
 * SahaayaNet Store-Carry-Forward Router (Android Client)
 * Manages Room-backed DTN bundle buffers, anti-flooding, hop counting, and prioritization.
 */
class StoreCarryForwardRouter(
    private val context: Context,
    private val myNodeId: String
) {
    companion object {
        private const val TAG = "StoreCarryForwardRouter"
        const val DEFAULT_MAX_HOPS = 7
        const val DEFAULT_TTL_SECONDS = 86400L // 24 hours
    }

    private val db = SahaayaDatabase.getDatabase(context)
    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    /**
     * Ingests a raw JSON packet received via BLE or Wi-Fi Direct.
     */
    suspend fun processIncomingBundleString(rawJson: String, bearer: String): Boolean {
        return try {
            val json = JSONObject(rawJson)
            val bundleId = json.getString("bundleId")
            val originNodeId = json.getString("originNodeId")
            val destinationNodeId = json.optString("destinationNodeId", "BROADCAST")
            val payloadType = json.getString("payloadType")
            val priority = json.optInt("priority", 5)
            val hopCount = json.getInt("hopCount")
            val maxHops = json.optInt("maxHops", DEFAULT_MAX_HOPS)
            val timeToLiveSeconds = json.optLong("timeToLiveSeconds", DEFAULT_TTL_SECONDS)
            val createdTimestamp = json.getLong("createdTimestamp")

            // 1. Check if already present in Room database
            val existing = db.messageDao().getMessageById(bundleId)
            if (existing != null) {
                Log.d(TAG, "Dropping duplicate bundle: $bundleId")
                return false
            }

            // 2. Hop count boundary check
            if (hopCount >= maxHops) {
                Log.w(TAG, "Dropping bundle $bundleId: max hops reached ($hopCount >= $maxHops)")
                return false
            }

            // 3. TTL expiration check
            val now = System.currentTimeMillis()
            if ((now - createdTimestamp) > (timeToLiveSeconds * 1000L)) {
                Log.w(TAG, "Dropping bundle $bundleId: TTL expired")
                return false
            }

            // 4. Cryptographic bundle integrity check
            val receivedChecksum = json.optString("checksum", "")
            if (receivedChecksum.isNotEmpty()) {
                val payloadString = json.optJSONObject("payload")?.toString() ?: ""
                val isValid = BundleCrypto.verifyChecksum(
                    bundleId, originNodeId, destinationNodeId, payloadType,
                    createdTimestamp, payloadString, receivedChecksum
                )
                if (!isValid) {
                    Log.w(TAG, "Dropping bundle $bundleId: Cryptographic checksum validation failed (tamper/spoof detected)")
                    return false
                }
            }

            // 4. Save to Room database with incremented hop count
            val incrementedHops = hopCount + 1
            val messageEntity = MessageEntity(
                bundleId = bundleId,
                originNodeId = originNodeId,
                destinationNodeId = destinationNodeId,
                payloadType = payloadType,
                payloadJson = rawJson,
                priority = priority,
                hopCount = incrementedHops,
                maxHops = maxHops,
                timeToLiveSeconds = timeToLiveSeconds,
                createdTimestamp = createdTimestamp,
                isDelivered = false,
                isSyncedToCloud = false,
                hopsHistoryJson = "[\"$myNodeId via $bearer\"]"
            )

            db.messageDao().insertMessage(messageEntity)

            // 5. If this is an SOS Alert, also save to SosAlertDao for immediate local triage
            if (payloadType == "SOS_ALERT") {
                val payloadObj = json.getJSONObject("payload")
                val alertEntity = SosAlertEntity(
                    alertId = payloadObj.getString("alertId"),
                    senderName = payloadObj.getString("senderName"),
                    emergencyType = payloadObj.getString("emergencyType"),
                    severity = payloadObj.getString("severity"),
                    status = "PENDING",
                    victimCount = payloadObj.optInt("victimCount", 1),
                    medicalNeeds = payloadObj.optString("medicalNeeds", ""),
                    notes = payloadObj.optString("notes", ""),
                    latitude = payloadObj.getJSONObject("location").getDouble("latitude"),
                    longitude = payloadObj.getJSONObject("location").getDouble("longitude"),
                    originNodeId = originNodeId,
                    hopCount = incrementedHops,
                    isSynced = false
                )
                db.sosAlertDao().insertAlert(alertEntity)
            }

            Log.i(TAG, "Bundle $bundleId successfully stored into Room queue. Priority: $priority, Hop: $incrementedHops")
            true
        } catch (e: Exception) {
            Log.e(TAG, "Failed parsing or storing incoming DTN bundle", e)
            false
        }
    }

    /**
     * Creates an outgoing SOS Emergency Bundle and queues it into Room.
     */
    fun createAndQueueSosAlert(alert: SosAlertEntity) {
        coroutineScope.launch {
            // First store the SOS alert locally
            db.sosAlertDao().insertAlert(alert)

            // Build DTN Packet JSON
            val bundleId = "BND-${myNodeId}-${System.currentTimeMillis()}"
            val payloadJson = JSONObject().apply {
                put("alertId", alert.alertId)
                put("senderName", alert.senderName)
                put("emergencyType", alert.emergencyType)
                put("severity", alert.severity)
                put("victimCount", alert.victimCount)
                put("medicalNeeds", alert.medicalNeeds)
                put("notes", alert.notes)
                put("location", JSONObject().apply {
                    put("latitude", alert.latitude)
                    put("longitude", alert.longitude)
                })
                put("timestamp", alert.timestamp)
            }

            val packetJson = JSONObject().apply {
                put("bundleId", bundleId)
                put("originNodeId", myNodeId)
                put("destinationNodeId", "BROADCAST_COMMAND")
                put("payloadType", "SOS_ALERT")
                put("priority", if (alert.severity == "CRITICAL") 1 else 2)
                put("hopCount", 0)
                put("maxHops", DEFAULT_MAX_HOPS)
                put("timeToLiveSeconds", DEFAULT_TTL_SECONDS)
                put("createdTimestamp", alert.timestamp)
                put("payload", payloadJson)
                val checksum = BundleCrypto.computeChecksum(
                    bundleId, myNodeId, "BROADCAST_COMMAND", "SOS_ALERT",
                    alert.timestamp, payloadJson.toString()
                )
                put("checksum", checksum)
            }

            val message = MessageEntity(
                bundleId = bundleId,
                originNodeId = myNodeId,
                destinationNodeId = "BROADCAST_COMMAND",
                payloadType = "SOS_ALERT",
                payloadJson = packetJson.toString(),
                priority = if (alert.severity == "CRITICAL") 1 else 2,
                hopCount = 0,
                maxHops = DEFAULT_MAX_HOPS,
                timeToLiveSeconds = DEFAULT_TTL_SECONDS,
                createdTimestamp = alert.timestamp,
                isDelivered = false,
                isSyncedToCloud = false,
                hopsHistoryJson = "[\"$myNodeId:ORIGIN\"]"
            )

            db.messageDao().insertMessage(message)
            Log.i(TAG, "Created SOS bundle $bundleId stored in offline queue")
        }
    }

    suspend fun getPendingForwardingBundles(): List<MessageEntity> {
        return db.messageDao().getUnsyncedMessages()
    }
}
