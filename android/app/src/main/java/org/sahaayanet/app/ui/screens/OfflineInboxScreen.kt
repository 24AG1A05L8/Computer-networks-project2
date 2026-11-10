package org.sahaayanet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudDone
import androidx.compose.material.icons.filled.CloudOff
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.sahaayanet.app.data.local.entity.MessageEntity
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun OfflineInboxScreen(
    messages: List<MessageEntity>,
    onTriggerSync: () -> Unit,
    isOnline: Boolean
) {
    val dateFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())

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
                    "Store-Carry-Forward Buffer",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 20.sp
                )
                Text(
                    "Room DB Message Bundles (${messages.size} total)",
                    color = Color(0xFF94A3B8),
                    fontSize = 12.sp
                )
            }

            Button(
                onClick = onTriggerSync,
                colors = ButtonDefaults.buttonColors(
                    containerColor = if (isOnline) Color(0xFF10B981) else Color(0xFF334155)
                ),
                shape = RoundedCornerShape(8.dp),
                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 6.dp)
            ) {
                Icon(
                    if (isOnline) Icons.Default.CloudDone else Icons.Default.CloudOff,
                    contentDescription = null,
                    modifier = Modifier.size(16.dp)
                )
                Spacer(modifier = Modifier.width(6.dp))
                Text(if (isOnline) "Sync Now" else "Offline", fontSize = 12.sp)
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (messages.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .weight(1f),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    "DTN queue is empty. No transit bundles currently stored in Room DB.",
                    color = Color(0xFF64748B),
                    fontSize = 13.sp
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(messages) { message ->
                    BundleCard(message, dateFormat)
                }
            }
        }
    }
}

@Composable
fun BundleCard(message: MessageEntity, dateFormat: SimpleDateFormat) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color(0xFF1E293B)),
        shape = RoundedCornerShape(10.dp),
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
                        color = if (message.priority == 1) Color(0xFFEF4444) else Color(0xFF3B82F6),
                        shape = RoundedCornerShape(4.dp)
                    ) {
                        Text(
                            text = if (message.priority == 1) "PRIORITY 1 • SOS" else "PRIORITY ${message.priority}",
                            color = Color.White,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        message.payloadType,
                        color = Color(0xFF38BDF8),
                        fontSize = 11.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Surface(
                    color = if (message.isSyncedToCloud) Color(0xFF065F46) else Color(0xFF451A03),
                    shape = RoundedCornerShape(4.dp)
                ) {
                    Text(
                        text = if (message.isSyncedToCloud) "CLOUD SYNCED" else "OFFLINE STORED",
                        color = if (message.isSyncedToCloud) Color(0xFF6EE7B7) else Color(0xFFFDBA74),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                "Bundle ID: ${message.bundleId}",
                color = Color.White,
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )

            Spacer(modifier = Modifier.height(4.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    "Origin: ${message.originNodeId} → Hop ${message.hopCount}/${message.maxHops}",
                    color = Color(0xFF94A3B8),
                    fontSize = 11.sp
                )
                Text(
                    dateFormat.format(Date(message.createdTimestamp)),
                    color = Color(0xFF64748B),
                    fontSize = 11.sp
                )
            }
        }
    }
}
