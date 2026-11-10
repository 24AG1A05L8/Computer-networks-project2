package org.sahaayanet.app.mesh.ble

import android.annotation.SuppressLint
import android.bluetooth.BluetoothAdapter
import android.bluetooth.BluetoothManager
import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import org.sahaayanet.app.data.local.SahaayaDatabase
import org.sahaayanet.app.data.local.entity.MeshNodeEntity
import java.nio.charset.StandardCharsets
import java.util.UUID

/**
 * SahaayaNet BLE Peer Discovery Manager
 * Handles continuous low-power BLE beaconing and scanning for peer nodes in disaster areas.
 */
class BleDiscoveryManager(
    private val context: Context,
    private val myNodeId: String,
    private val myRole: String
) {
    companion object {
        private const val TAG = "BleDiscoveryManager"
        // Dedicated 128-bit UUID for SahaayaNet Emergency Mesh Network
        val SERVICE_UUID: UUID = UUID.fromString("0000FEAA-0000-1000-8000-00805F9B34FB")
        val PARCEL_UUID = ParcelUuid(SERVICE_UUID)
    }

    private val bluetoothManager: BluetoothManager? =
        context.getSystemService(Context.BLUETOOTH_SERVICE) as? BluetoothManager
    private val bluetoothAdapter: BluetoothAdapter? = bluetoothManager?.adapter
    private var advertiser: BluetoothLeAdvertiser? = null
    private var scanner: BluetoothLeScanner? = null

    private val _discoveredNodes = MutableStateFlow<Map<String, MeshNodeEntity>>(emptyMap())
    val discoveredNodes: StateFlow<Map<String, MeshNodeEntity>> = _discoveredNodes

    private val coroutineScope = CoroutineScope(Dispatchers.IO)
    private val db = SahaayaDatabase.getDatabase(context)

    private val advertiseCallback = object : AdvertiseCallback() {
        override fun onStartSuccess(settingsInEffect: AdvertiseSettings?) {
            Log.i(TAG, "BLE Advertising started successfully for node: $myNodeId")
        }

        override fun onStartFailure(errorCode: Int) {
            Log.e(TAG, "BLE Advertising failed with error code: $errorCode")
        }
    }

    private val scanCallback = object : ScanCallback() {
        @SuppressLint("MissingPermission")
        override fun onScanResult(callbackType: Int, result: ScanResult?) {
            result?.let { handleScanResult(it) }
        }

        override fun onBatchScanResults(results: MutableList<ScanResult>?) {
            results?.forEach { handleScanResult(it) }
        }

        override fun onScanFailed(errorCode: Int) {
            Log.e(TAG, "BLE Scan failed with code: $errorCode")
        }
    }

    @SuppressLint("MissingPermission")
    fun startAdvertising(batteryPercent: Int) {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            Log.w(TAG, "Bluetooth not available or disabled")
            return
        }

        advertiser = bluetoothAdapter.bluetoothLeAdvertiser
        if (advertiser == null) {
            Log.w(TAG, "BLE Advertising not supported on this device")
            return
        }

        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(true)
            .build()

        // Encode node identity: "NODE_ID|ROLE|BATTERY"
        val payloadData = "$myNodeId|$myRole|$batteryPercent".toByteArray(StandardCharsets.UTF_8)

        val data = AdvertiseData.Builder()
            .setIncludeDeviceName(false)
            .setIncludeTxPowerLevel(false)
            .addServiceUuid(PARCEL_UUID)
            .addServiceData(PARCEL_UUID, payloadData)
            .build()

        advertiser?.startAdvertising(settings, data, advertiseCallback)
    }

    @SuppressLint("MissingPermission")
    fun stopAdvertising() {
        advertiser?.stopAdvertising(advertiseCallback)
    }

    @SuppressLint("MissingPermission")
    fun startScanning() {
        if (bluetoothAdapter == null || !bluetoothAdapter.isEnabled) {
            Log.w(TAG, "Bluetooth not available for scanning")
            return
        }

        scanner = bluetoothAdapter.bluetoothLeScanner
        if (scanner == null) {
            Log.w(TAG, "BluetoothLeScanner is null")
            return
        }

        val filter = ScanFilter.Builder()
            .setServiceUuid(PARCEL_UUID)
            .build()

        val settings = ScanSettings.Builder()
            .setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY)
            .setReportDelay(0)
            .build()

        scanner?.startScan(listOf(filter), settings, scanCallback)
        Log.i(TAG, "BLE Discovery scan initiated")
    }

    @SuppressLint("MissingPermission")
    fun stopScanning() {
        scanner?.stopScan(scanCallback)
    }

    private fun handleScanResult(result: ScanResult) {
        val record = result.scanRecord ?: return
        val serviceData = record.getServiceData(PARCEL_UUID) ?: return

        try {
            val decodedString = String(serviceData, StandardCharsets.UTF_8)
            val parts = decodedString.split("|")
            if (parts.size >= 2) {
                val peerNodeId = parts[0]
                val peerRole = parts[1]
                val peerBattery = parts.getOrNull(2)?.toIntOrNull() ?: 100

                if (peerNodeId == myNodeId) return // Ignore self-echo

                val nodeEntity = MeshNodeEntity(
                    nodeId = peerNodeId,
                    role = peerRole,
                    bleAddress = result.device.address,
                    wifiDirectAddress = null,
                    batteryPercent = peerBattery,
                    isGateway = peerRole == "GATEWAY" || peerRole == "COMMAND_STATION",
                    lastSeenTimestamp = System.currentTimeMillis(),
                    rssi = result.rssi,
                    directHop = true,
                    forwardedBundlesCount = 0
                )

                val updatedMap = _discoveredNodes.value.toMutableMap()
                updatedMap[peerNodeId] = nodeEntity
                _discoveredNodes.value = updatedMap

                // Persist peer to local Room database asynchronously
                coroutineScope.launch {
                    db.meshNodeDao().upsertNode(nodeEntity)
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing BLE beacon payload", e)
        }
    }
}
