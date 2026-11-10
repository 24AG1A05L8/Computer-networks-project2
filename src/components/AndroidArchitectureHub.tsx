import React, { useState } from 'react';
import {
  Smartphone,
  Folder,
  FileCode,
  Layers,
  Cpu,
  Radio,
  Wifi,
  Database,
  Cloud,
  Check,
  Copy,
} from 'lucide-react';

export const AndroidArchitectureHub: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('StoreCarryForwardRouter.kt');
  const [copied, setCopied] = useState(false);

  const filesMap: Record<string, { path: string; category: string; description: string; code: string }> = {
    'StoreCarryForwardRouter.kt': {
      path: 'android/app/src/main/java/org/sahaayanet/app/mesh/routing/StoreCarryForwardRouter.kt',
      category: 'DTN Routing Engine',
      description: 'Epidemic Store-Carry-Forward routing with anti-flooding, Room queue integration, TTL verification, and SOS packet priority.',
      code: `package org.sahaayanet.app.mesh.routing

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import org.json.JSONObject
import org.sahaayanet.app.data.local.SahaayaDatabase
import org.sahaayanet.app.data.local.entity.MessageEntity
import org.sahaayanet.app.data.local.entity.SosAlertEntity

class StoreCarryForwardRouter(
    private val context: Context,
    private val myNodeId: String
) {
    companion object {
        const val DEFAULT_MAX_HOPS = 7
        const val DEFAULT_TTL_SECONDS = 86400L // 24 hours
    }

    private val db = SahaayaDatabase.getDatabase(context)

    suspend fun processIncomingBundleString(rawJson: String, bearer: String): Boolean {
        val json = JSONObject(rawJson)
        val bundleId = json.getString("bundleId")
        val hopCount = json.getInt("hopCount")
        val maxHops = json.optInt("maxHops", DEFAULT_MAX_HOPS)
        val createdTimestamp = json.getLong("createdTimestamp")
        val timeToLiveSeconds = json.optLong("timeToLiveSeconds", DEFAULT_TTL_SECONDS)

        // 1. Drop duplicates already stored in Room DB
        if (db.messageDao().getMessageById(bundleId) != null) return false

        // 2. Drop if hop count limit exceeded
        if (hopCount >= maxHops) return false

        // 3. Drop if expired TTL
        if ((System.currentTimeMillis() - createdTimestamp) > (timeToLiveSeconds * 1000L)) return false

        // 4. Save into Room DB with incremented hop count
        val messageEntity = MessageEntity(
            bundleId = bundleId,
            originNodeId = json.getString("originNodeId"),
            destinationNodeId = json.optString("destinationNodeId", "BROADCAST"),
            payloadType = json.getString("payloadType"),
            payloadJson = rawJson,
            priority = json.optInt("priority", 5),
            hopCount = hopCount + 1,
            maxHops = maxHops,
            timeToLiveSeconds = timeToLiveSeconds,
            createdTimestamp = createdTimestamp
        )
        db.messageDao().insertMessage(messageEntity)
        return true
    }
}`,
    },
    'BleDiscoveryManager.kt': {
      path: 'android/app/src/main/java/org/sahaayanet/app/mesh/ble/BleDiscoveryManager.kt',
      category: 'BLE Discovery',
      description: 'Continuous low-power Bluetooth Low Energy advertising and scanning using dedicated Service UUID 0000FEAA.',
      code: `package org.sahaayanet.app.mesh.ble

import android.bluetooth.le.*
import android.content.Context
import android.os.ParcelUuid
import java.util.UUID

class BleDiscoveryManager(context: Context, val myNodeId: String, val myRole: String) {
    companion object {
        val SERVICE_UUID: UUID = UUID.fromString("0000FEAA-0000-1000-8000-00805F9B34FB")
        val PARCEL_UUID = ParcelUuid(SERVICE_UUID)
    }

    fun startAdvertising(batteryPercent: Int) {
        val settings = AdvertiseSettings.Builder()
            .setAdvertiseMode(AdvertiseSettings.ADVERTISE_MODE_BALANCED)
            .setTxPowerLevel(AdvertiseSettings.ADVERTISE_TX_POWER_HIGH)
            .setConnectable(true)
            .build()

        val payload = "$myNodeId|$myRole|$batteryPercent".toByteArray()
        val data = AdvertiseData.Builder()
            .addServiceUuid(PARCEL_UUID)
            .addServiceData(PARCEL_UUID, payload)
            .build()

        advertiser?.startAdvertising(settings, data, advertiseCallback)
    }

    fun startScanning() {
        val filter = ScanFilter.Builder().setServiceUuid(PARCEL_UUID).build()
        val settings = ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build()
        scanner?.startScan(listOf(filter), settings, scanCallback)
    }
}`,
    },
    'WifiDirectManager.kt': {
      path: 'android/app/src/main/java/org/sahaayanet/app/mesh/wifidirect/WifiDirectManager.kt',
      category: 'Wi-Fi Direct P2P',
      description: 'Ad-hoc peer group negotiation and high-throughput TCP socket server on port 8888 for bulk bundle exchange.',
      code: `package org.sahaayanet.app.mesh.wifidirect

import android.net.wifi.p2p.*
import java.net.ServerSocket
import java.net.Socket

class WifiDirectManager(val context: Context, val router: StoreCarryForwardRouter) :
    WifiP2pManager.PeerListListener, WifiP2pManager.ConnectionInfoListener {

    const val SOCKET_PORT = 8888

    override fun onConnectionInfoAvailable(info: WifiP2pInfo?) {
        if (info?.groupFormed == true && info.isGroupOwner) {
            // Start TCP ServerSocket on port 8888
            startServerSocket()
        } else if (info?.groupFormed == true) {
            // Connect as TCP Client and transmit pending Room bundles
            syncBundlesWithPeer(info.groupOwnerAddress.hostAddress)
        }
    }
}`,
    },
    'SahaayaDatabase.kt': {
      path: 'android/app/src/main/java/org/sahaayanet/app/data/local/SahaayaDatabase.kt',
      category: 'Room Database',
      description: 'Room Database definition with DAOs for MessageEntity, SosAlertEntity, and MeshNodeEntity.',
      code: `package org.sahaayanet.app.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import org.sahaayanet.app.data.local.dao.*
import org.sahaayanet.app.data.local.entity.*

@Database(
    entities = [MessageEntity::class, SosAlertEntity::class, MeshNodeEntity::class],
    version = 1,
    exportSchema = false
)
abstract class SahaayaDatabase : RoomDatabase() {
    abstract fun messageDao(): MessageDao
    abstract fun sosAlertDao(): SosAlertDao
    abstract fun meshNodeDao(): MeshNodeDao
}`,
    },
    'CloudSyncManager.kt': {
      path: 'android/app/src/main/java/org/sahaayanet/app/sync/CloudSyncManager.kt',
      category: 'Cloud Synchronization',
      description: 'NetworkCallback monitors internet restoration and pushes unsynced bundles to the Node.js/PostgreSQL backend via OkHttp.',
      code: `package org.sahaayanet.app.sync

import android.net.ConnectivityManager
import android.net.Network
import okhttp3.OkHttpClient
import okhttp3.Request

class CloudSyncManager(context: Context, val myNodeId: String) {
    private val networkCallback = object : ConnectivityManager.NetworkCallback() {
        override fun onAvailable(network: Network) {
            // Trigger batch synchronization to /api/sync/mesh-bundle
            triggerBatchSync()
        }
    }

    fun triggerBatchSync() {
        val unsynced = db.messageDao().getUnsyncedMessages()
        // HTTP POST to /api/sync/mesh-bundle with OkHttp
    }
}`,
    },
    'AndroidManifest.xml': {
      path: 'android/app/src/main/AndroidManifest.xml',
      category: 'Android Manifest',
      description: 'Permission declarations for Bluetooth LE, Wi-Fi Direct, Fine Location, Foreground Service, and Network State.',
      code: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <uses-permission android:name="android.permission.BLUETOOTH_SCAN" />
    <uses-permission android:name="android.permission.BLUETOOTH_ADVERTISE" />
    <uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.CHANGE_WIFI_STATE" />
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE" />

    <application android:name=".SahaayaApplication">
        <activity android:name=".ui.MainActivity" android:exported="true" />
        <service android:name=".mesh.service.SahaayaMeshService" android:foregroundServiceType="connectedDevice" />
    </application>
</manifest>`,
    },
    'build.gradle.kts': {
      path: 'android/app/build.gradle.kts',
      category: 'Gradle Configuration',
      description: 'Target SDK 34, Jetpack Compose 2024.06.00, Room 2.6.1, KSP, Coroutines, and OkHttp.',
      code: `plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
    id("kotlinx-serialization")
}

android {
    namespace = "org.sahaayanet.app"
    compileSdk = 34
    defaultConfig {
        applicationId = "org.sahaayanet.app"
        minSdk = 26
        targetSdk = 34
    }
    buildFeatures { compose = true }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.06.00"))
    implementation("androidx.compose.material3:material3")
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    ksp("androidx.room:room-compiler:2.6.1")
    implementation("com.squareup.okhttp3:okhttp:4.12.0")
}`,
    },
  };

  const currentFile = filesMap[selectedFile];

  const handleCopy = () => {
    if (!currentFile) return;
    navigator.clipboard.writeText(currentFile.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Top Architecture Layers Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-sky-500/20 text-sky-400 rounded-lg">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">SahaayaNet Android Native System Architecture</h3>
            <p className="text-xs text-slate-400">
              Modular 5-layer emergency mesh architecture implemented in Kotlin, Jetpack Compose, and Room DB
            </p>
          </div>
        </div>

        {/* 5 Layer Architecture Diagram */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
              <Radio className="w-4 h-4" />
              <span>Layer 1: BLE Radar</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              UUID 0000FEAA beaconing & scan filter for zero-touch peer discovery
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-purple-400 font-bold mb-1">
              <Wifi className="w-4 h-4" />
              <span>Layer 2: Wi-Fi P2P</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Ad-hoc peer group negotiation & socket streaming on port 8888
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <Database className="w-4 h-4" />
              <span>Layer 3: Room DB</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              SQLite offline tables for messages, SOS alerts, and peer routing table
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-red-400 font-bold mb-1">
              <Cpu className="w-4 h-4" />
              <span>Layer 4: DTN Router</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Epidemic store-carry-forward, priority triage, hop decrements & TTL
            </p>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
              <Cloud className="w-4 h-4" />
              <span>Layer 5: Cloud Sync</span>
            </div>
            <p className="text-slate-400 text-[11px]">
              Auto-reconnects when internet returns, commits to Cloud SQL PostgreSQL
            </p>
          </div>
        </div>
      </div>

      {/* Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* File Navigator Sidebar */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 pb-3 border-b border-slate-800 mb-3">
            <Folder className="w-4 h-4 text-sky-400" />
            <span>Android Module File Tree</span>
          </div>

          <div className="space-y-1.5 flex-1">
            {Object.keys(filesMap).map((fileName) => {
              const file = filesMap[fileName];
              const isSelected = selectedFile === fileName;
              return (
                <button
                  key={fileName}
                  onClick={() => setSelectedFile(fileName)}
                  className={`w-full text-left p-2.5 rounded-lg text-xs flex flex-col gap-0.5 transition-colors ${
                    isSelected
                      ? 'bg-sky-500/10 text-sky-400 font-semibold border border-sky-500/40'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <FileCode className="w-3.5 h-3.5" />
                    <span className="font-mono">{fileName}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 ml-5">{file.category}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Source Code Viewer */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
            <div>
              <span className="text-[10px] text-slate-500 font-mono block">{currentFile.path}</span>
              <h4 className="text-sm font-bold text-white mt-0.5">{selectedFile}</h4>
            </div>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400 font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Source</span>
                </>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-3 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
            {currentFile.description}
          </p>

          <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-sky-200 overflow-x-auto flex-1 max-h-[460px] leading-relaxed">
            {currentFile.code}
          </pre>
        </div>
      </div>
    </div>
  );
};
