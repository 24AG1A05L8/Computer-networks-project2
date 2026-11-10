package org.sahaayanet.app.ui.navigation

import androidx.compose.runtime.*
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import kotlinx.coroutines.launch
import org.sahaayanet.app.SahaayaApplication
import org.sahaayanet.app.data.local.entity.SosAlertEntity
import org.sahaayanet.app.ui.screens.*

object Destinations {
    const val SPLASH = "splash"
    const val WELCOME = "welcome"
    const val REGISTER = "register"
    const val LOGIN = "login"
    const val DASHBOARD = "dashboard"
    const val SOS = "sos"
    const val REQUEST_DETAILS = "request_details"
    const val MESSAGING = "messaging"
    const val NEARBY = "nearby"
    const val NETWORK_STATUS = "network_status"
    const val MESSAGE_HISTORY = "message_history"
    const val EMERGENCY_INFO = "emergency_info"
    const val PROFILE = "profile"
    const val SETTINGS = "settings"
}

@Composable
fun SahaayaNavGraph(
    navController: NavHostController,
    app: SahaayaApplication
) {
    val coroutineScope = rememberCoroutineScope()
    val nodesFlow by app.database.meshNodeDao().getAllNodesFlow().collectAsState(initial = emptyList())
    val messagesFlow by app.database.messageDao().getAllMessagesFlow().collectAsState(initial = emptyList())
    val alertsFlow by app.database.sosAlertDao().getAllAlertsFlow().collectAsState(initial = emptyList())
    val isOnline by app.syncManager.isOnline.collectAsState()

    var userName by remember { mutableStateOf("Citizen Operator") }
    var userPhone by remember { mutableStateOf("+91 97000 12345") }
    var selectedAlert by remember { mutableStateOf<SosAlertEntity?>(null) }

    NavHost(
        navController = navController,
        startDestination = Destinations.SPLASH
    ) {
        // 1. Splash Screen
        composable(Destinations.SPLASH) {
            SplashScreen(
                onSplashFinished = {
                    navController.navigate(Destinations.WELCOME) {
                        popUpTo(Destinations.SPLASH) { inclusive = true }
                    }
                }
            )
        }

        // 2. Welcome Screen
        composable(Destinations.WELCOME) {
            WelcomeScreen(
                onNavigateToRegister = { navController.navigate(Destinations.REGISTER) },
                onNavigateToLogin = { navController.navigate(Destinations.LOGIN) },
                onQuickAccessCitizen = {
                    navController.navigate(Destinations.DASHBOARD) {
                        popUpTo(Destinations.WELCOME) { inclusive = true }
                    }
                }
            )
        }

        // 3. Registration Screen
        composable(Destinations.REGISTER) {
            RegistrationScreen(
                onRegistered = { name, _, phone ->
                    userName = name
                    userPhone = phone
                    navController.navigate(Destinations.DASHBOARD) {
                        popUpTo(Destinations.WELCOME) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 4. Login Screen
        composable(Destinations.LOGIN) {
            LoginScreen(
                onLoginSuccess = { callsign ->
                    userName = callsign
                    navController.navigate(Destinations.DASHBOARD) {
                        popUpTo(Destinations.WELCOME) { inclusive = true }
                    }
                },
                onNavigateBack = { navController.popBackStack() },
                onNavigateToRegister = { navController.navigate(Destinations.REGISTER) }
            )
        }

        // 5. Citizen Home Dashboard Screen
        composable(Destinations.DASHBOARD) {
            CitizenDashboardScreen(
                userName = userName,
                nodeId = app.nodeId,
                isInternetOnline = isOnline,
                isBleActive = true,
                isWifiDirectActive = true,
                nearbyNodesCount = nodesFlow.size,
                pendingMessagesCount = messagesFlow.size,
                recentMessages = messagesFlow,
                onTriggerSos = { navController.navigate(Destinations.SOS) },
                onNavigateToMessages = { navController.navigate(Destinations.MESSAGING) },
                onNavigateToNearby = { navController.navigate(Destinations.NEARBY) },
                onNavigateToNetworkStatus = { navController.navigate(Destinations.NETWORK_STATUS) },
                onNavigateToEmergencyInfo = { navController.navigate(Destinations.EMERGENCY_INFO) },
                onNavigateToProfile = { navController.navigate(Destinations.PROFILE) },
                onNavigateToSettings = { navController.navigate(Destinations.SETTINGS) }
            )
        }

        // 6. Emergency SOS Screen
        composable(Destinations.SOS) {
            EmergencySosScreen(
                nodeId = app.nodeId,
                onSubmitSos = { alert ->
                    selectedAlert = alert
                    app.router.createAndQueueSosAlert(alert)
                    navController.navigate(Destinations.REQUEST_DETAILS)
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 7. Emergency Request Details Screen
        composable(Destinations.REQUEST_DETAILS) {
            val alertToShow = selectedAlert ?: alertsFlow.firstOrNull() ?: SosAlertEntity(
                alertId = "SOS-SAMPLE",
                senderName = userName,
                emergencyType = "FLOOD",
                severity = "CRITICAL",
                status = "PENDING",
                victimCount = 3,
                medicalNeeds = "Insulin refrigeration",
                notes = "Stranded on roof",
                latitude = 17.385,
                longitude = 78.486,
                originNodeId = app.nodeId
            )
            EmergencyRequestDetailsScreen(
                alert = alertToShow,
                onNavigateBack = { navController.popBackStack() },
                onMarkSafe = { alertId ->
                    coroutineScope.launch {
                        app.database.sosAlertDao().updateAlertStatus(alertId, "RESOLVED")
                    }
                }
            )
        }

        // 8. Messaging Screen
        composable(Destinations.MESSAGING) {
            MessagingScreen(
                myNodeId = app.nodeId,
                messages = messagesFlow,
                onSendMessage = { text, dest, priority ->
                    // Queue outgoing DTN message bundle
                    val bundleId = "MSG-${app.nodeId}-${System.currentTimeMillis()}"
                    val msgEntity = org.sahaayanet.app.data.local.entity.MessageEntity(
                        bundleId = bundleId,
                        originNodeId = app.nodeId,
                        destinationNodeId = dest,
                        payloadType = "TEXT_CHAT",
                        payloadJson = "{\"message\":\"$text\"}",
                        priority = priority,
                        hopCount = 0,
                        maxHops = 7,
                        timeToLiveSeconds = 86400L,
                        createdTimestamp = System.currentTimeMillis()
                    )
                    coroutineScope.launch {
                        app.database.messageDao().insertMessage(msgEntity)
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 9. Nearby Devices Screen
        composable(Destinations.NEARBY) {
            NearbyDevicesScreen(
                nodes = nodesFlow,
                onTriggerScan = {
                    app.bleManager.startScanning()
                    app.wifiDirectManager.discoverPeers()
                },
                onConnectPeer = { peer ->
                    // Initiate Wi-Fi Direct connection
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 10. Network Status Screen
        composable(Destinations.NETWORK_STATUS) {
            NetworkStatusScreen(
                nodeId = app.nodeId,
                isInternetOnline = isOnline,
                pendingBundlesCount = messagesFlow.size,
                discoveredPeersCount = nodesFlow.size,
                onNavigateBack = { navController.popBackStack() },
                onTestNetworkProbe = {
                    app.bleManager.startScanning()
                }
            )
        }

        // 11. Message History Screen
        composable(Destinations.MESSAGE_HISTORY) {
            MessageHistoryScreen(
                messages = messagesFlow,
                onPurgeExpired = {
                    coroutineScope.launch {
                        app.database.messageDao().purgeExpiredMessages(System.currentTimeMillis())
                    }
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 12. Offline Emergency Information Screen
        composable(Destinations.EMERGENCY_INFO) {
            OfflineEmergencyInfoScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 13. User Profile Screen
        composable(Destinations.PROFILE) {
            UserProfileScreen(
                currentName = userName,
                nodeId = app.nodeId,
                onSaveProfile = { newName, newPhone, _, _ ->
                    userName = newName
                    userPhone = newPhone
                },
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // 14. Settings Screen
        composable(Destinations.SETTINGS) {
            SettingsScreen(
                onNavigateBack = { navController.popBackStack() },
                onPurgeDatabase = {
                    coroutineScope.launch {
                        app.database.messageDao().purgeExpiredMessages(System.currentTimeMillis() + 99999999999L)
                    }
                }
            )
        }
    }
}
