# SahaayaNet Android Native Application

Internet-Independent Emergency Mesh Communication Client built with Kotlin, Jetpack Compose, BLE, Wi-Fi Direct, and Room Database.

## Architecture

```
android/app/src/main/java/org/sahaayanet/app/
├── SahaayaApplication.kt          # Global dependency singletons and random node identity generator
├── data/
│   └── local/
│       ├── entity/
│       │   └── Entities.kt        # Room @Entity: MessageEntity, SosAlertEntity, MeshNodeEntity
│       ├── dao/
│       │   └── Daos.kt            # Room @Dao: MessageDao, SosAlertDao, MeshNodeDao
│       └── SahaayaDatabase.kt     # Room @Database definition with singleton instance
├── mesh/
│   ├── ble/
│   │   └── BleDiscoveryManager.kt # BluetoothLeAdvertiser & BluetoothLeScanner using UUID 0000FEAA
│   ├── wifidirect/
│   │   └── WifiDirectManager.kt   # WifiP2pManager, ServerSocket & Client Socket for high-bandwidth DTN transfer
│   ├── routing/
│   │   └── StoreCarryForwardRouter.kt # Epidemic/DTN store-carry-forward engine, TTL enforcement, priority triage
│   └── service/
│       └── SahaayaMeshService.kt  # Android Foreground Service to maintain BLE and sockets in background
├── sync/
│   └── CloudSyncManager.kt        # ConnectivityManager listener & OkHttp client for online sync
└── ui/
    ├── MainActivity.kt            # Compose host with runtime Bluetooth/Wifi/Location permissions
    └── screens/
        ├── SosScreen.kt           # Distress alert generator with GPS and triage urgency
        ├── MeshRadarScreen.kt     # Live peer radar for nearby BLE/Wi-Fi Direct devices
        └── OfflineInboxScreen.kt  # Room DB store-carry-forward bundle inspector
```

## How to Build in Android Studio
1. Open the `/android` directory in Android Studio (Iguana / Jellyfish / Koala).
2. Allow Gradle sync to complete with JDK 17.
3. Build APK: `./gradlew assembleDebug`
4. Deploy to two physical Android devices with Bluetooth and Wi-Fi enabled.
