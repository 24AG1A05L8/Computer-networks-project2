package org.sahaayanet.app.ui

import android.Manifest
import android.content.Intent
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import androidx.navigation.compose.rememberNavController
import org.sahaayanet.app.SahaayaApplication
import org.sahaayanet.app.mesh.service.SahaayaMeshService
import org.sahaayanet.app.ui.navigation.SahaayaNavGraph

class MainActivity : ComponentActivity() {

    private val requiredPermissions: Array<String> by lazy {
        val list = mutableListOf(
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            list.add(Manifest.permission.BLUETOOTH_SCAN)
            list.add(Manifest.permission.BLUETOOTH_ADVERTISE)
            list.add(Manifest.permission.BLUETOOTH_CONNECT)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            list.add(Manifest.permission.NEARBY_WIFI_DEVICES)
            list.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        list.toTypedArray()
    }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ ->
        startMeshService()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val app = application as SahaayaApplication

        // Request BLE, Location, and Wi-Fi Direct permissions at runtime
        permissionLauncher.launch(requiredPermissions)

        setContent {
            val navController = rememberNavController()
            SahaayaNavGraph(
                navController = navController,
                app = app
            )
        }
    }

    private fun startMeshService() {
        val serviceIntent = Intent(this, SahaayaMeshService::class.java)
        ContextCompat.startForegroundService(this, serviceIntent)
    }
}
