package org.sahaayanet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Warning
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
fun EmergencySosScreen(
    nodeId: String,
    onSubmitSos: (SosAlertEntity) -> Unit,
    onNavigateBack: () -> Unit
) {
    var category by remember { mutableStateOf("MEDICAL") }
    var description by remember { mutableStateOf("") }
    var peopleAffected by remember { mutableStateOf("1") }
    var injuryDetails by remember { mutableStateOf("") }
    var shareLocation by remember { mutableStateOf(true) }
    var latitude by remember { mutableDoubleStateOf(17.3850) }
    var longitude by remember { mutableDoubleStateOf(78.4867) }
    var additionalInfo by remember { mutableStateOf("") }

    // Validation errors
    var descriptionError by remember { mutableStateOf(false) }
    var peopleError by remember { mutableStateOf(false) }
    var isSubmitted by remember { mutableStateOf(false) }

    val categories = listOf("MEDICAL", "FLOOD", "FIRE", "STRUCTURAL_COLLAPSE", "SEARCH_AND_RESCUE", "SUPPLIES")

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
            Text(
                text = "Emergency SOS Request",
                fontSize = 22.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )
            Surface(
                color = Color(0xFFDC2626),
                shape = RoundedCornerShape(6.dp)
            ) {
                Text(
                    text = "PRIORITY 1",
                    color = Color.White,
                    fontWeight = FontWeight.Black,
                    fontSize = 10.sp,
                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                )
            }
        }

        Text(
            text = "Broadcasts immediately across offline BLE & Wi-Fi Direct peer mesh without internet.",
            color = Color(0xFF94A3B8),
            fontSize = 12.sp,
            modifier = Modifier.padding(top = 2.dp, bottom = 18.dp)
        )

        // 1. Emergency Category
        Text("Emergency Category *", color = Color(0xFF94A3B8), fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            categories.take(3).forEach { cat ->
                FilterChip(
                    selected = category == cat,
                    onClick = { category = cat },
                    label = { Text(cat.replace("_", " "), fontSize = 11.sp) }
                )
            }
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 14.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            categories.drop(3).forEach { cat ->
                FilterChip(
                    selected = category == cat,
                    onClick = { category = cat },
                    label = { Text(cat.replace("_", " "), fontSize = 11.sp) }
                )
            }
        }

        // 2. Emergency Description (Required)
        OutlinedTextField(
            value = description,
            onValueChange = {
                description = it
                descriptionError = it.isBlank()
            },
            isError = descriptionError,
            label = { Text("Emergency Situation Description *") },
            placeholder = { Text("e.g. Flash flood trapped family on 2nd floor balcony, power is out") },
            minLines = 3,
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFFDC2626),
                unfocusedBorderColor = Color(0xFF334155),
                errorBorderColor = Color(0xFFEF4444)
            )
        )
        if (descriptionError) {
            Text("Please describe the emergency so responders can triage equipment", color = Color(0xFFEF4444), fontSize = 11.sp, modifier = Modifier.padding(start = 8.dp, top = 2.dp))
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 3. Number of People Affected
        OutlinedTextField(
            value = peopleAffected,
            onValueChange = {
                peopleAffected = it
                peopleError = it.toIntOrNull() == null || (it.toIntOrNull() ?: 0) < 1
            },
            isError = peopleError,
            label = { Text("Number of People Affected / Trapped *") },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFFDC2626),
                unfocusedBorderColor = Color(0xFF334155),
                errorBorderColor = Color(0xFFEF4444)
            )
        )
        if (peopleError) {
            Text("Enter a valid number of affected individuals (at least 1)", color = Color(0xFFEF4444), fontSize = 11.sp, modifier = Modifier.padding(start = 8.dp, top = 2.dp))
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 4. Injury Details
        OutlinedTextField(
            value = injuryDetails,
            onValueChange = { injuryDetails = it },
            label = { Text("Specific Injury Details / Medical Requisitions") },
            placeholder = { Text("e.g. Deep lacerations, fractured leg, insulin required") },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFFDC2626),
                unfocusedBorderColor = Color(0xFF334155)
            )
        )

        Spacer(modifier = Modifier.height(14.dp))

        // 5. Location Sharing Toggle & Coordinates
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
                        Icon(Icons.Default.LocationOn, contentDescription = null, tint = Color(0xFF38BDF8), modifier = Modifier.size(20.dp))
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text("Share GPS Distress Coordinates", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 13.sp)
                            Text("Lat: ${latitude.toString().take(7)}, Lng: ${longitude.toString().take(7)}", color = Color(0xFF94A3B8), fontSize = 11.sp)
                        }
                    }
                    Switch(
                        checked = shareLocation,
                        onCheckedChange = { shareLocation = it }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(14.dp))

        // 6. Additional Information
        OutlinedTextField(
            value = additionalInfo,
            onValueChange = { additionalInfo = it },
            label = { Text("Additional Hazards / Landmarks / Instructions") },
            placeholder = { Text("e.g. Downed electrical line near blue water gate") },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFFDC2626),
                unfocusedBorderColor = Color(0xFF334155)
            )
        )

        Spacer(modifier = Modifier.height(24.dp))

        // Submit SOS Button
        Button(
            onClick = {
                val hasDescErr = description.isBlank()
                val hasPeopleErr = peopleAffected.toIntOrNull() == null || (peopleAffected.toIntOrNull() ?: 0) < 1

                descriptionError = hasDescErr
                peopleError = hasPeopleErr

                if (!hasDescErr && !hasPeopleErr) {
                    val alert = SosAlertEntity(
                        alertId = "SOS-${System.currentTimeMillis()}-${(100..999).random()}",
                        senderName = "Citizen ($nodeId)",
                        emergencyType = category,
                        severity = "CRITICAL",
                        status = "PENDING",
                        victimCount = peopleAffected.toIntOrNull() ?: 1,
                        medicalNeeds = injuryDetails,
                        notes = "$description. Additional: $additionalInfo",
                        latitude = if (shareLocation) latitude else 0.0,
                        longitude = if (shareLocation) longitude else 0.0,
                        originNodeId = nodeId,
                        hopCount = 0,
                        isSynced = false
                    )
                    onSubmitSos(alert)
                    isSubmitted = true
                }
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFDC2626)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(54.dp)
        ) {
            Icon(Icons.Default.Warning, contentDescription = null, modifier = Modifier.size(20.dp))
            Spacer(modifier = Modifier.width(8.dp))
            Text("SUBMIT SOS DISTRESS SIGNAL", fontSize = 16.sp, fontWeight = FontWeight.Bold)
        }

        if (isSubmitted) {
            Spacer(modifier = Modifier.height(14.dp))
            Surface(
                color = Color(0xFF065F46),
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = "Distress signal confirmed! Stored in local Room database and actively broadcasting via BLE & Wi-Fi Direct.",
                    color = Color(0xFFD1FAE5),
                    fontSize = 12.sp,
                    modifier = Modifier.padding(14.dp)
                )
            }
        }
    }
}
