package org.sahaayanet.app.mesh.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import org.sahaayanet.app.mesh.ble.BleDiscoveryManager
import org.sahaayanet.app.mesh.routing.StoreCarryForwardRouter
import org.sahaayanet.app.mesh.wifidirect.WifiDirectManager
import org.sahaayanet.app.sync.CloudSyncManager

/**
 * Foreground Service that keeps BLE beaconing, Wi-Fi Direct listener,
 * and DTN store-carry-forward active in disaster conditions when the screen is locked.
 */
class SahaayaMeshService : Service() {
    companion object {
        private const val TAG = "SahaayaMeshService"
        private const val CHANNEL_ID = "sahaaya_mesh_channel"
        private const val NOTIFICATION_ID = 101
    }

    private lateinit var router: StoreCarryForwardRouter
    private lateinit var bleManager: BleDiscoveryManager
    private lateinit var wifiDirectManager: WifiDirectManager
    private lateinit var syncManager: CloudSyncManager

    override fun onCreate() {
        super.onCreate()
        val nodeId = "NODE-" + Build.MODEL.replace(" ", "").take(8) + "-" + (100..999).random()
        val role = "CIVILIAN"

        router = StoreCarryForwardRouter(this, nodeId)
        bleManager = BleDiscoveryManager(this, nodeId, role)
        wifiDirectManager = WifiDirectManager(this, router)
        syncManager = CloudSyncManager(this, nodeId)

        createNotificationChannel()
        startForeground(NOTIFICATION_ID, buildForegroundNotification())

        // Start BLE advertising & scanning
        bleManager.startAdvertising(100)
        bleManager.startScanning()

        // Start Wi-Fi Direct discovery
        wifiDirectManager.discoverPeers()

        // Start online sync detector
        syncManager.startMonitoring()

        Log.i(TAG, "SahaayaMeshService initialized and running in foreground")
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "SahaayaNet Mesh Node Active",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps disaster emergency mesh routing active in the background"
            }
            val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildForegroundNotification(): Notification {
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("SahaayaNet Emergency Mesh Active")
            .setContentText("Relaying offline emergency SOS signals via BLE & Wi-Fi Direct")
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    override fun onDestroy() {
        super.onDestroy()
        bleManager.stopAdvertising()
        bleManager.stopScanning()
        wifiDirectManager.stop()
        syncManager.stopMonitoring()
        Log.i(TAG, "SahaayaMeshService stopped")
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
