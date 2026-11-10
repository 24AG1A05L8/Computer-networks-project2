package org.sahaayanet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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

@Composable
fun SettingsScreen(
    onNavigateBack: () -> Unit,
    onPurgeDatabase: () -> Unit
) {
    var maxHops by remember { mutableFloatStateOf(7f) }
    var backgroundRelay by remember { mutableStateOf(true) }
    var batterySaver by remember { mutableStateOf(false) }
    var syncUrl by remember { mutableStateOf("https://ais-dev-dpnrnq3sfhswoqgm3ryfsy-489505497612.asia-southeast1.run.app") }
    var isDarkTheme by remember { mutableStateOf(true) }
    var purgeFeedback by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(18.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }
            Spacer(modifier = Modifier.width(6.dp))
            Text("Settings & Routing Parameters", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 1. DTN Hop Limit Slider
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text("Store-Carry-Forward Max Hops", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("${maxHops.toInt()} Hops", color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }
                Text("Limits packet retransmission perimeter to prevent mesh flooding.", color = Color(0xFF94A3B8), fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp, bottom = 8.dp))
                Slider(
                    value = maxHops,
                    onValueChange = { maxHops = it },
                    valueRange = 1f..10f,
                    steps = 8,
                    colors = SliderDefaults.colors(
                        thumbColor = Color(0xFF38BDF8),
                        activeTrackColor = Color(0xFF0284C7),
                        inactiveTrackColor = Color(0xFF334155)
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 2. Background Relay Toggle
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Background Mesh Relay Service", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("Keep BLE & Wi-Fi Direct socket listening when screen is locked.", color = Color(0xFF94A3B8), fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))
                }
                Switch(
                    checked = backgroundRelay,
                    onCheckedChange = { backgroundRelay = it }
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 3. Battery Preservation Mode
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Battery Preservation Mode", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("Pauses high-throughput Wi-Fi scans when battery drops below 20%.", color = Color(0xFF94A3B8), fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))
                }
                Switch(
                    checked = batterySaver,
                    onCheckedChange = { batterySaver = it }
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 4. Dark / Light Theme Toggle
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(16.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text("Emergency High-Contrast Dark Theme", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("Optimizes OLED battery runtime during prolonged disasters.", color = Color(0xFF94A3B8), fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))
                }
                Switch(
                    checked = isDarkTheme,
                    onCheckedChange = { isDarkTheme = it }
                )
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 5. Cloud Gateway Endpoint
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Central Command Gateway Endpoint", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                Text("PostgreSQL synchronization target when network returns.", color = Color(0xFF94A3B8), fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp, bottom = 8.dp))
                OutlinedTextField(
                    value = syncUrl,
                    onValueChange = { syncUrl = it },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedBorderColor = Color(0xFF38BDF8),
                        unfocusedBorderColor = Color(0xFF334155)
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // 6. Purge Database Button
        Button(
            onClick = {
                onPurgeDatabase()
                purgeFeedback = true
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF991B1B)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(48.dp)
        ) {
            Icon(Icons.Default.DeleteForever, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("PURGE LOCAL ROOM DTN MESSAGE BUFFER", fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }

        if (purgeFeedback) {
            Spacer(modifier = Modifier.height(8.dp))
            Text("Room message buffer successfully purged.", color = Color(0xFFFCA5A5), fontSize = 11.sp, modifier = Modifier.align(Alignment.CenterHorizontally))
        }
    }
}
