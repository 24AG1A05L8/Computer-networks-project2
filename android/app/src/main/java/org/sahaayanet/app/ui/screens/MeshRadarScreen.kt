package org.sahaayanet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Wifi
import androidx.compose.material.icons.filled.Bluetooth
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.sahaayanet.app.data.local.entity.MeshNodeEntity

@Composable
fun MeshRadarScreen(
    discoveredNodes: List<MeshNodeEntity>,
    onTriggerScan: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    "Offline Peer Radar",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp
                )
                Text(
                    "BLE Discovery & Wi-Fi Direct Swarm",
                    color = Color(0xFF94A3B8),
                    fontSize = 12.sp
                )
            }
            IconButton(
                onClick = onTriggerScan,
                modifier = Modifier.background(Color(0xFF1E293B), CircleShape)
            ) {
                Icon(Icons.Default.Refresh, contentDescription = "Scan", tint = Color(0xFF38BDF8))
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Radar stats banner
        Card(
            colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                horizontalArrangement = Arrangement.SpaceAround
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text("${discoveredNodes.size}", color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold, fontSize = 22.sp)
                    Text("Discovered Peers", color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    val gateways = discoveredNodes.count { it.isGateway }
                    Text("$gateways", color = Color(0xFF34D399), fontWeight = FontWeight.Bold, fontSize = 22.sp)
                    Text("Sync Gateways", color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    val avgBattery = if (discoveredNodes.isNotEmpty()) discoveredNodes.map { it.batteryPercent }.average().toInt() else 100
                    Text("$avgBattery%", color = Color(0xFFFBBF24), fontWeight = FontWeight.Bold, fontSize = 22.sp)
                    Text("Avg Fleet Power", color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (discoveredNodes.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(color = Color(0xFF38BDF8), strokeWidth = 2.dp)
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(
                        "Listening for BLE service UUID 0000FEAA...",
                        color = Color(0xFF94A3B8),
                        fontSize = 13.sp
                    )
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(discoveredNodes) { node ->
                    PeerNodeRow(node)
                }
            }
        }
    }
}

@Composable
fun PeerNodeRow(node: MeshNodeEntity) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(10.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Surface(
                    color = when (node.role) {
                        "FIRST_RESPONDER" -> Color(0xFF0369A1)
                        "MEDIC" -> Color(0xFF15803D)
                        "GATEWAY" -> Color(0xFF7E22CE)
                        else -> Color(0xFF334155)
                    },
                    shape = RoundedCornerShape(8.dp),
                    modifier = Modifier.size(42.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            if (node.wifiDirectAddress != null) Icons.Default.Wifi else Icons.Default.Bluetooth,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(22.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                Column {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(node.nodeId, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                        if (node.isGateway) {
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                color = Color(0xFF065F46),
                                shape = RoundedCornerShape(4.dp)
                            ) {
                                Text(
                                    "GATEWAY",
                                    color = Color(0xFF6EE7B7),
                                    fontSize = 9.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 4.dp, vertical = 2.dp)
                                )
                            }
                        }
                    }
                    Text(
                        "${node.role} • ${node.bleAddress}",
                        color = Color(0xFF94A3B8),
                        fontSize = 11.sp
                    )
                }
            }

            Column(horizontalAlignment = Alignment.End) {
                Text(
                    "${node.batteryPercent}% bat",
                    color = if (node.batteryPercent > 25) Color(0xFF34D399) else Color(0xFFEF4444),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    "${node.rssi} dBm",
                    color = Color(0xFF64748B),
                    fontSize = 11.sp
                )
            }
        }
    }
}
