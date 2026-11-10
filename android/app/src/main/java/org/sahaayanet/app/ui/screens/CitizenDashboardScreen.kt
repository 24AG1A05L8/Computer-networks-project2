package org.sahaayanet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.sahaayanet.app.data.local.entity.MessageEntity
import org.sahaayanet.app.data.local.entity.MeshNodeEntity

@Composable
fun CitizenDashboardScreen(
    userName: String,
    nodeId: String,
    isInternetOnline: Boolean,
    isBleActive: Boolean,
    isWifiDirectActive: Boolean,
    nearbyNodesCount: Int,
    pendingMessagesCount: Int,
    recentMessages: List<MessageEntity>,
    onTriggerSos: () -> Unit,
    onNavigateToMessages: () -> Unit,
    onNavigateToNearby: () -> Unit,
    onNavigateToNetworkStatus: () -> Unit,
    onNavigateToEmergencyInfo: () -> Unit,
    onNavigateToProfile: () -> Unit,
    onNavigateToSettings: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // 1. User Profile & Quick Actions Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.clickable { onNavigateToProfile() }
            ) {
                Surface(
                    color = Color(0xFF0284C7),
                    shape = CircleShape,
                    modifier = Modifier.size(44.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Text(
                            text = userName.take(1).uppercase(),
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    }
                }
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text(userName, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                    Text("Node: $nodeId", color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
            }

            IconButton(
                onClick = onNavigateToSettings,
                modifier = Modifier.background(Color(0xFF1E293B), CircleShape)
            ) {
                Icon(Icons.Default.Settings, contentDescription = "Settings", tint = Color(0xFF94A3B8))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 2. Hardware Connectivity & Peer Discovery Status Badges
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(14.dp),
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onNavigateToNetworkStatus() }
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Mesh Hardware Radios", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text("Diagnostics ›", color = Color(0xFF38BDF8), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                }

                Spacer(modifier = Modifier.height(10.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    // Cellular / Internet Uplink
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Surface(
                            color = if (isInternetOnline) Color(0xFF059669) else Color(0xFF475569),
                            shape = CircleShape,
                            modifier = Modifier.size(8.dp)
                        ) {}
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            if (isInternetOnline) "Internet Online" else "Offline Mesh",
                            color = Color.White,
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }

                    // BLE
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Bluetooth, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("BLE Scanning", color = Color.White, fontSize = 12.sp)
                    }

                    // Wi-Fi Direct
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Default.Wifi, contentDescription = null, tint = Color(0xFFC084FC), modifier = Modifier.size(14.dp))
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Wi-Fi Direct P2P", color = Color.White, fontSize = 12.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 3. Nearby Device Discovery Banner
        Surface(
            color = Color(0xFF0F2338),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onNavigateToNearby() }
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Radar, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(24.dp))
                    Spacer(modifier = Modifier.width(12.dp))
                    Column {
                        Text("$nearbyNodesCount Nearby Mesh Nodes Discovered", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                        Text("Routing packets within direct BLE & Wi-Fi range", color = Color(0xFF94A3B8), fontSize = 11.sp)
                    }
                }
                Icon(Icons.Default.ChevronRight, contentDescription = null, tint = Color(0xFF64748B))
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 4. Large Touch-Friendly Emergency SOS Button
        Surface(
            color = Color(0xFFDC2626),
            shape = RoundedCornerShape(20.dp),
            modifier = Modifier
                .fillMaxWidth()
                .clickable { onTriggerSos() }
        ) {
            Column(
                modifier = Modifier.padding(vertical = 28.dp, horizontal = 20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Surface(
                    color = Color.White.copy(alpha = 0.2f),
                    shape = CircleShape,
                    modifier = Modifier.size(68.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Default.Warning,
                            contentDescription = "Distress",
                            tint = Color.White,
                            modifier = Modifier.size(40.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                Text(
                    text = "EMERGENCY SOS",
                    color = Color.White,
                    fontWeight = FontWeight.Black,
                    fontSize = 26.sp,
                    letterSpacing = 1.sp
                )

                Text(
                    text = "Tap to broadcast distress alert to nearby citizens & rescue teams",
                    color = Color(0xFFFEE2E2),
                    fontSize = 12.sp,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 5. Store-Carry-Forward Buffer / Pending Messages Counter
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Surface(
                color = Color(0xFF1E293B),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .weight(1f)
                    .clickable { onNavigateToMessages() }
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Icon(Icons.Default.Inbox, contentDescription = null, tint = Color(0xFF34D399))
                        Text(
                            text = "$pendingMessagesCount",
                            color = Color(0xFF34D399),
                            fontWeight = FontWeight.Black,
                            fontSize = 20.sp
                        )
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Pending Relays", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("Stored in Room buffer", color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
            }

            Surface(
                color = Color(0xFF1E293B),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .weight(1f)
                    .clickable { onNavigateToEmergencyInfo() }
            ) {
                Column(modifier = Modifier.padding(14.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Icon(Icons.Default.MenuBook, contentDescription = null, tint = Color(0xFFF59E0B))
                        Text("OFFLINE", color = Color(0xFFF59E0B), fontWeight = FontWeight.Bold, fontSize = 10.sp)
                    }
                    Spacer(modifier = Modifier.height(6.dp))
                    Text("Emergency Guides", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("First aid & survival manuals", color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 6. Recent Messages / Distress Feed
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Recent Mesh Activity", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 15.sp)
            Text(
                "View All ›",
                color = Color(0xFF38BDF8),
                fontSize = 12.sp,
                fontWeight = FontWeight.SemiBold,
                modifier = Modifier.clickable { onNavigateToMessages() }
            )
        }

        Spacer(modifier = Modifier.height(10.dp))

        if (recentMessages.isEmpty()) {
            Surface(
                color = Color(0xFF1E293B),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "No mesh packets received yet. Node is listening for broadcasts.",
                    color = Color(0xFF64748B),
                    fontSize = 12.sp,
                    modifier = Modifier.padding(16.dp)
                )
            }
        } else {
            recentMessages.take(3).forEach { msg ->
                Surface(
                    color = Color(0xFF1E293B),
                    shape = RoundedCornerShape(10.dp),
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 8.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Surface(
                                    color = if (msg.priority == 1) Color(0xFFDC2626) else Color(0xFF0284C7),
                                    shape = RoundedCornerShape(4.dp)
                                ) {
                                    Text(
                                        text = msg.payloadType,
                                        color = Color.White,
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                    )
                                }
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(msg.bundleId, color = Color.White, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                            }
                            Text("Hop ${msg.hopCount}/${msg.maxHops} • Origin ${msg.originNodeId}", color = Color(0xFF94A3B8), fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))
                        }
                    }
                }
            }
        }
    }
}
