package org.sahaayanet.app.mesh.wifidirect

import android.annotation.SuppressLint
import android.content.Context
import android.net.wifi.p2p.*
import android.util.Log
import kotlinx.coroutines.*
import org.sahaayanet.app.mesh.routing.StoreCarryForwardRouter
import java.io.*
import java.net.InetSocketAddress
import java.net.ServerSocket
import java.net.Socket

/**
 * SahaayaNet Wi-Fi Direct (P2P) Communication Manager
 * Handles high-throughput DTN bundle transfers over ad-hoc peer sockets without an access point.
 */
class WifiDirectManager(
    private val context: Context,
    private val router: StoreCarryForwardRouter
) : WifiP2pManager.PeerListListener, WifiP2pManager.ConnectionInfoListener {

    companion object {
        private const val TAG = "WifiDirectManager"
        const val SOCKET_PORT = 8888
        const val SOCKET_TIMEOUT_MS = 10000
    }

    private val wifiP2pManager: WifiP2pManager? =
        context.getSystemService(Context.WIFI_P2P_SERVICE) as? WifiP2pManager
    private val channel: WifiP2pManager.Channel? =
        wifiP2pManager?.initialize(context, context.mainLooper, null)

    private val peers = mutableListOf<WifiP2pDevice>()
    private var serverJob: Job? = null
    private val coroutineScope = CoroutineScope(Dispatchers.IO)

    @SuppressLint("MissingPermission")
    fun discoverPeers(onSuccess: () -> Unit = {}, onFailure: (Int) -> Unit = {}) {
        wifiP2pManager?.discoverPeers(channel, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                Log.i(TAG, "Wi-Fi Direct peer discovery started")
                onSuccess()
            }

            override fun onFailure(reasonCode: Int) {
                Log.e(TAG, "Wi-Fi Direct discovery failed: $reasonCode")
                onFailure(reasonCode)
            }
        })
    }

    override fun onPeersAvailable(peerList: WifiP2pDeviceList?) {
        peers.clear()
        peerList?.deviceList?.let { peers.addAll(it) }
        Log.i(TAG, "Wi-Fi Direct peers available: ${peers.size}")
    }

    @SuppressLint("MissingPermission")
    fun connectToPeer(device: WifiP2pDevice, onSuccess: () -> Unit = {}, onFailure: (Int) -> Unit = {}) {
        val config = WifiP2pConfig().apply {
            deviceAddress = device.deviceAddress
            groupOwnerIntent = 0 // Prefer client to let stationary gateway be group owner
        }

        wifiP2pManager?.connect(channel, config, object : WifiP2pManager.ActionListener {
            override fun onSuccess() {
                Log.i(TAG, "Connecting to Wi-Fi Direct peer ${device.deviceName}")
                onSuccess()
            }

            override fun onFailure(reason: Int) {
                Log.e(TAG, "Failed connecting to peer: $reason")
                onFailure(reason)
            }
        })
    }

    override fun onConnectionInfoAvailable(info: WifiP2pInfo?) {
        info ?: return

        if (info.groupFormed && info.isGroupOwner) {
            Log.i(TAG, "This device is Wi-Fi Direct Group Owner. Starting socket listener...")
            startServerSocket()
        } else if (info.groupFormed) {
            val groupOwnerAddress = info.groupOwnerAddress.hostAddress
            Log.i(TAG, "Connected as client. Group Owner IP: $groupOwnerAddress")
            groupOwnerAddress?.let { ip ->
                // Send pending store-carry-forward bundles to group owner
                coroutineScope.launch {
                    syncBundlesWithPeer(ip)
                }
            }
        }
    }

    private fun startServerSocket() {
        serverJob?.cancel()
        serverJob = coroutineScope.launch {
            try {
                val serverSocket = ServerSocket(SOCKET_PORT)
                Log.i(TAG, "Socket Server listening on port $SOCKET_PORT")
                while (isActive) {
                    val clientSocket = serverSocket.accept()
                    launch {
                        handleIncomingConnection(clientSocket)
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Server socket error", e)
            }
        }
    }

    private suspend fun handleIncomingConnection(socket: Socket) = withContext(Dispatchers.IO) {
        try {
            val reader = BufferedReader(InputStreamReader(socket.getInputStream()))
            val writer = PrintWriter(BufferedWriter(OutputStreamWriter(socket.getOutputStream())), true)

            val rawData = reader.readLine()
            if (!rawData.isNullOrBlank()) {
                Log.i(TAG, "Received incoming DTN bundle via Wi-Fi Direct")
                router.processIncomingBundleString(rawData, "WIFI_DIRECT")
                writer.println("ACK:RECEIVED")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error handling peer socket stream", e)
        } finally {
            try { socket.close() } catch (_: Exception) {}
        }
    }

    suspend fun syncBundlesWithPeer(peerIpAddress: String) = withContext(Dispatchers.IO) {
        val bundlesToSend = router.getPendingForwardingBundles()
        if (bundlesToSend.isEmpty()) {
            Log.i(TAG, "No DTN bundles in queue for peer $peerIpAddress")
            return@withContext
        }

        for (bundle in bundlesToSend) {
            var socket: Socket? = null
            try {
                socket = Socket()
                socket.connect(InetSocketAddress(peerIpAddress, SOCKET_PORT), SOCKET_TIMEOUT_MS)
                val writer = PrintWriter(BufferedWriter(OutputStreamWriter(socket.getOutputStream())), true)
                val reader = BufferedReader(InputStreamReader(socket.getInputStream()))

                val jsonPayload = bundle.payloadJson
                writer.println(jsonPayload)

                val response = reader.readLine()
                if (response?.startsWith("ACK") == true) {
                    Log.i(TAG, "Bundle ${bundle.bundleId} acknowledged by peer $peerIpAddress")
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error transmitting bundle to $peerIpAddress", e)
            } finally {
                try { socket?.close() } catch (_: Exception) {}
            }
        }
    }

    fun stop() {
        serverJob?.cancel()
    }
}
