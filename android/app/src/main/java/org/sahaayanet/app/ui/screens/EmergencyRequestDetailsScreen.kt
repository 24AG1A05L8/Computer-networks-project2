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
import org.sahaayanet.app.data.local.entity.SosAlertEntity

@Composable
fun EmergencyRequestDetailsScreen(
    alert: SosAlertEntity,
    onNavigateBack: () -> Unit,
    onMarkSafe: (alertId: String) -> Unit
) {
    var markedSafeFeedback by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(18.dp)
            .verticalScroll(rememberScrollState())
    ) {
        IconButton(
            onClick = onNavigateBack,
            modifier = Modifier.padding(bottom = 6.dp)
        ) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(alert.alertId, color = Color(0xFF38BDF8), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text(alert.emergencyType.replace("_", " "), color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Black)
            }

            Surface(
                color = when (alert.severity) {
                    "CRITICAL" -> Color(0xFFDC2626)
                    "HIGH" -> Color(0xFFEA580C)
                    else -> Color(0xFF0284C7)
                },
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(
                    text = "${alert.severity} PRIORITY",
                    color = Color.White,
                    fontWeight = FontWeight.Bold,
                    fontSize = 10.sp,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Status Card
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = when (alert.status) {
                            "DISPATCHED" -> Color(0xFF0284C7)
                            "RESOLVED" -> Color(0xFF059669)
                            else -> Color(0xFFF59E0B)
                        },
                        shape = RoundedCornerShape(4.dp),
                        modifier = Modifier.size(10.dp)
                    ) {}
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Triage Status: ${alert.status}", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                }

                Text("${alert.hopCount} Hops via DTN", color = Color(0xFF94A3B8), fontSize = 11.sp)
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Victims & Medical Needs
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(16.dp)) {
                Text("Casualty & Victim Assessment", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(Icons.Default.Group, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(18.dp))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("${alert.victimCount} People Trapped or Injured", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }

                if (alert.medicalNeeds.isNotBlank()) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("Medical Needs:", color = Color(0xFFEF4444), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(alert.medicalNeeds, color = Color.White, fontSize = 13.sp, modifier = Modifier.padding(top = 2.dp))
                }

                if (alert.notes.isNotBlank()) {
                    Spacer(modifier = Modifier.height(10.dp))
                    Text("Situation Notes:", color = Color(0xFF94A3B8), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text(alert.notes, color = Color.White, fontSize = 13.sp, modifier = Modifier.padding(top = 2.dp))
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Geolocation
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(Icons.Default.LocationOn, contentDescription = null, tint = Color(0xFFDC2626), modifier = Modifier.size(24.dp))
                Spacer(modifier = Modifier.width(12.dp))
                Column {
                    Text("Distress Location Coordinates", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                    Text("Lat: ${alert.latitude}, Lng: ${alert.longitude}", color = Color(0xFF94A3B8), fontSize = 12.sp)
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Store-Carry-Forward Hop Telemetry
        Surface(
            color = Color(0xFF1E293B),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(14.dp)) {
                Text("Store-Carry-Forward DTN Propagation", color = Color(0xFF94A3B8), fontSize = 11.sp, fontWeight = FontWeight.Bold)
                Spacer(modifier = Modifier.height(8.dp))
                Text("Origin Node: ${alert.originNodeId}", color = Color(0xFF38BDF8), fontWeight = FontWeight.SemiBold, fontSize = 12.sp)
                Text("Relayed across peer mesh hops without internet connectivity.", color = Color(0xFF94A3B8), fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Mark Safe Button
        Button(
            onClick = {
                onMarkSafe(alert.alertId)
                markedSafeFeedback = true
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF059669)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
        ) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(18.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("RESOLVE / MARK CASUALTY SAFE", fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }

        if (markedSafeFeedback) {
            Spacer(modifier = Modifier.height(10.dp))
            Text(
                text = "Status updated to RESOLVED in Room database.",
                color = Color(0xFF34D399),
                fontSize = 12.sp,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            )
        }
    }
}
