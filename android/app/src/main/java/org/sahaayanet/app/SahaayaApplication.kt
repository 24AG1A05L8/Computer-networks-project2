package org.sahaayanet.app

import android.app.Application
import android.os.Build
import org.sahaayanet.app.data.local.SahaayaDatabase
import org.sahaayanet.app.mesh.ble.BleDiscoveryManager
import org.sahaayanet.app.mesh.routing.StoreCarryForwardRouter
import org.sahaayanet.app.mesh.wifidirect.WifiDirectManager
import org.sahaayanet.app.sync.CloudSyncManager

class SahaayaApplication : Application() {

    lateinit var database: SahaayaDatabase
        private set
    lateinit var router: StoreCarryForwardRouter
        private set
    lateinit var bleManager: BleDiscoveryManager
        private set
    lateinit var wifiDirectManager: WifiDirectManager
        private set
    lateinit var syncManager: CloudSyncManager
        private set

    val nodeId: String by lazy {
        "NODE-" + Build.MODEL.replace(" ", "").take(6).uppercase() + "-" + (1000..9999).random()
    }

    override fun onCreate() {
        super.onCreate()
        database = SahaayaDatabase.getDatabase(this)
        router = StoreCarryForwardRouter(this, nodeId)
        bleManager = BleDiscoveryManager(this, nodeId, "CIVILIAN")
        wifiDirectManager = WifiDirectManager(this, router)
        syncManager = CloudSyncManager(this, nodeId)
    }
}
