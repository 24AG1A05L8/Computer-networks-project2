package org.sahaayanet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
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
fun NearbyDevicesScreen(
    nodes: List<MeshNodeEntity>,
    onTriggerScan: () -> Unit,
    onConnectPeer: (MeshNodeEntity) -> Unit,
    onNavigateBack: () -> Unit
) {
    var selectedFilter by remember { mutableStateOf("ALL") }

    val filteredNodes = nodes.filter {
        when (selectedFilter) {
            "GATEWAY" -> it.isGateway
            "RESPONDER" -> it.role == "FIRST_RESPONDER" || it.role == "MEDIC"
            "CIVILIAN" -> it.role == "CIVILIAN"
            else -> true
        }
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                IconButton(onClick = onNavigateBack) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
                }
                Spacer(modifier = Modifier.width(6.dp))
                Column {
                    Text("Nearby Mesh Nodes", color = Color.White, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("${nodes.size} peers in radio perimeter", color = Color(0xFF94A3B8), fontSize = 11.sp)
                }
            }

            IconButton(
                onClick = onTriggerScan,
                modifier = Modifier.background(Color(0xFF1E293B), CircleShape)
            ) {
                Icon(Icons.Default.Refresh, contentDescription = "Refresh", tint = Color(0xFF38BDF8))
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Role Filter Row
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            listOf("ALL", "RESPONDER", "GATEWAY", "CIVILIAN").forEach { filter ->
                FilterChip(
                    selected = selectedFilter == filter,
                    onClick = { selectedFilter = filter },
                    label = { Text(filter, fontSize = 11.sp) }
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        if (filteredNodes.isEmpty()) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Icon(Icons.Default.Radar, contentDescription = null, tint = Color(0xFF475569), modifier = Modifier.size(48.dp))
                    Spacer(modifier = Modifier.height(12.dp))
                    Text("No nearby peers found in this category.", color = Color(0xFF94A3B8), fontSize = 13.sp)
                    Text("Scanning continuous BLE Service UUID 0000FEAA...", color = Color(0xFF64748B), fontSize = 11.sp)
                }
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                items(filteredNodes) { node ->
                    Surface(
                        color = Color(0xFF1E293B),
                        shape = RoundedCornerShape(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Row(verticalAlignment = Alignment.CenterVertically) {
                                    Surface(
                                        color = if (node.isGateway) Color(0xFF059669) else Color(0xFF0284C7),
                                        shape = RoundedCornerShape(8.dp),
                                        modifier = Modifier.size(36.dp)
                                    ) {
                                        Box(contentAlignment = Alignment.Center) {
                                            Icon(
                                                if (node.wifiDirectAddress != null) Icons.Default.Wifi else Icons.Default.Bluetooth,
                                                contentDescription = null,
                                                tint = Color.White,
                                                modifier = Modifier.size(18.dp)
                                            )
                                        }
                                    }
                                    Spacer(modifier = Modifier.width(10.dp))
                                    Column {
                                        Text(node.nodeId, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                                        Text("${node.role} • ${node.bleAddress}", color = Color(0xFF94A3B8), fontSize = 11.sp)
                                    }
                                }

                                Text(
                                    "${node.batteryPercent}% battery",
                                    color = if (node.batteryPercent > 20) Color(0xFF34D399) else Color(0xFFEF4444),
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Spacer(modifier = Modifier.height(10.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    "RSSI: ${node.rssi} dBm • Relayed: ${node.forwardedBundlesCount} bundles",
                                    color = Color(0xFF64748B),
                                    fontSize = 11.sp
                                )

                                Button(
                                    onClick = { onConnectPeer(node) },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                                    shape = RoundedCornerShape(8.dp),
                                    contentPadding = PaddingValues(horizontal = 12.dp, vertical = 4.dp)
                                ) {
                                    Text("Wi-Fi Direct Link", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
