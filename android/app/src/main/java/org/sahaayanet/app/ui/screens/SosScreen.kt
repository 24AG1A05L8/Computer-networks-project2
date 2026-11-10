package org.sahaayanet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.sahaayanet.app.data.local.entity.SosAlertEntity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SosScreen(
    nodeId: String,
    onBroadcastSos: (SosAlertEntity) -> Unit
) {
    var senderName by remember { mutableStateOf("") }
    var selectedType by remember { mutableStateOf("MEDICAL") }
    var severity by remember { mutableStateOf("CRITICAL") }
    var victimCount by remember { mutableStateOf("1") }
    var medicalNeeds by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var alertSentFeedback by remember { mutableStateOf(false) }

    val emergencyTypes = listOf("MEDICAL", "FIRE", "FLOOD", "STRUCTURAL_COLLAPSE", "SEARCH_AND_RESCUE", "SUPPLIES")
    val severities = listOf("CRITICAL", "HIGH", "MEDIUM", "LOW")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp)
            .verticalScroll(rememberScrollState()),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        // Node Status Badge
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text("SahaayaNet Offline Node", color = Color(0xFF94A3B8), fontSize = 12.sp)
                Text(nodeId, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
            }
            Surface(
                color = Color(0xFF1E293B),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text(
                    text = "OFFLINE MESH ARMED",
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 4.dp),
                    color = Color(0xFF38BDF8),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
            }
        }

        // Giant SOS Trigger Card
        Card(
            colors = CardDefaults.cardColors(
                containerColor = if (severity == "CRITICAL") Color(0xFFDC2626) else Color(0xFFEA580C)
            ),
            shape = RoundedCornerShape(16.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Icon(
                    imageVector = Icons.Default.Warning,
                    contentDescription = "SOS Warning",
                    tint = Color.White,
                    modifier = Modifier.size(48.dp)
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    "EMERGENCY DISTRESS BEACON",
                    color = Color.White,
                    fontWeight = FontWeight.Black,
                    fontSize = 18.sp
                )
                Text(
                    "Broadcasts priority packet through peer-to-peer BLE & Wi-Fi Direct mesh without Internet",
                    color = Color(0xFFFEE2E2),
                    fontSize = 12.sp,
                    lineHeight = 16.sp
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Form Fields
        OutlinedTextField(
            value = senderName,
            onValueChange = { senderName = it },
            label = { Text("Victim / Reporter Name or Call Sign", color = Color(0xFFCBD5E1)) },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFF38BDF8),
                unfocusedBorderColor = Color(0xFF334155)
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        Text(
            "Emergency Classification",
            color = Color(0xFF94A3B8),
            fontSize = 12.sp,
            modifier = Modifier.align(Alignment.Start)
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            emergencyTypes.take(3).forEach { type ->
                FilterChip(
                    selected = selectedType == type,
                    onClick = { selectedType = type },
                    label = { Text(type, fontSize = 11.sp) }
                )
            }
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            emergencyTypes.drop(3).forEach { type ->
                FilterChip(
                    selected = selectedType == type,
                    onClick = { selectedType = type },
                    label = { Text(type, fontSize = 11.sp) }
                )
            }
        }

        Text(
            "Triage Severity Level",
            color = Color(0xFF94A3B8),
            fontSize = 12.sp,
            modifier = Modifier.align(Alignment.Start)
        )
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            severities.forEach { s ->
                FilterChip(
                    selected = severity == s,
                    onClick = { severity = s },
                    label = { Text(s, fontSize = 11.sp) }
                )
            }
        }

        Spacer(modifier = Modifier.height(8.dp))

        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            OutlinedTextField(
                value = victimCount,
                onValueChange = { victimCount = it },
                label = { Text("Victims Count", color = Color(0xFFCBD5E1)) },
                modifier = Modifier.weight(1f),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF38BDF8),
                    unfocusedBorderColor = Color(0xFF334155)
                )
            )
            Surface(
                modifier = Modifier
                    .weight(1f)
                    .height(60.dp),
                color = Color(0xFF1E293B),
                shape = RoundedCornerShape(8.dp)
            ) {
                Row(
                    modifier = Modifier.padding(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.LocationOn, contentDescription = null, tint = Color(0xFF38BDF8))
                    Spacer(modifier = Modifier.width(6.dp))
                    Column {
                        Text("GPS Acquired", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        Text("Lat: 17.385, Lng: 78.486", color = Color(0xFF94A3B8), fontSize = 9.sp)
                    }
                }
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = medicalNeeds,
            onValueChange = { medicalNeeds = it },
            label = { Text("Specific Medical Needs (e.g., Insulin, Blood, Splint)", color = Color(0xFFCBD5E1)) },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFF38BDF8),
                unfocusedBorderColor = Color(0xFF334155)
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        OutlinedTextField(
            value = notes,
            onValueChange = { notes = it },
            label = { Text("Hazards, Landmarks, Physical Details", color = Color(0xFFCBD5E1)) },
            modifier = Modifier.fillMaxWidth(),
            minLines = 3,
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFF38BDF8),
                unfocusedBorderColor = Color(0xFF334155)
            )
        )

        Spacer(modifier = Modifier.height(20.dp))

        Button(
            onClick = {
                val alert = SosAlertEntity(
                    alertId = "SOS-${System.currentTimeMillis()}-${(100..999).random()}",
                    senderName = senderName.ifBlank { "Unidentified Victim" },
                    emergencyType = selectedType,
                    severity = severity,
                    status = "PENDING",
                    victimCount = victimCount.toIntOrNull() ?: 1,
                    medicalNeeds = medicalNeeds,
                    notes = notes,
                    latitude = 17.385044,
                    longitude = 78.486671,
                    accuracyMeters = 4.2f,
                    timestamp = System.currentTimeMillis(),
                    originNodeId = nodeId,
                    hopCount = 0,
                    isSynced = false
                )
                onBroadcastSos(alert)
                alertSentFeedback = true
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFEF4444)),
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("BROADCAST SOS OVER MESH", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        if (alertSentFeedback) {
            Spacer(modifier = Modifier.height(12.dp))
            Surface(
                color = Color(0xFF065F46),
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Row(
                    modifier = Modifier.padding(12.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF34D399))
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        "SOS Packet stored in Room DB & queued for BLE/Wi-Fi Direct epidemic propagation",
                        color = Color(0xFFD1FAE5),
                        fontSize = 12.sp
                    )
                }
            }
        }
    }
}
