package org.sahaayanet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun RegistrationScreen(
    onRegistered: (name: String, role: String, phone: String) -> Unit,
    onNavigateBack: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var selectedRole by remember { mutableStateOf("CITIZEN") }
    var bloodGroup by remember { mutableStateOf("O+") }
    var emergencyContact by remember { mutableStateOf("") }
    var medicalConditions by remember { mutableStateOf("") }

    var nameError by remember { mutableStateOf(false) }
    var phoneError by remember { mutableStateOf(false) }
    var contactError by remember { mutableStateOf(false) }

    val roles = listOf("CITIZEN", "FIRST_RESPONDER", "MEDIC", "VOLUNTEER")
    val bloodGroups = listOf("O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(20.dp)
            .verticalScroll(rememberScrollState())
    ) {
        IconButton(
            onClick = onNavigateBack,
            modifier = Modifier.padding(bottom = 8.dp)
        ) {
            Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
        }

        Text(
            text = "Emergency Mesh Registration",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Color.White
        )
        Text(
            text = "Stored locally in encrypted Room DB. Transmitted only during life-safety SOS broadcast.",
            fontSize = 12.sp,
            color = Color(0xFF94A3B8),
            modifier = Modifier.padding(top = 4.dp, bottom = 20.dp)
        )

        // Full Name Field
        OutlinedTextField(
            value = name,
            onValueChange = {
                name = it
                nameError = it.isBlank()
            },
            isError = nameError,
            label = { Text("Full Name or Callsign *") },
            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFF38BDF8)) },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFF38BDF8),
                unfocusedBorderColor = Color(0xFF334155),
                errorBorderColor = Color(0xFFEF4444)
            )
        )
        if (nameError) {
            Text("Full name is required for disaster identification", color = Color(0xFFEF4444), fontSize = 11.sp, modifier = Modifier.padding(start = 8.dp, top = 2.dp))
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Phone Number
        OutlinedTextField(
            value = phone,
            onValueChange = {
                phone = it
                phoneError = it.length < 8
            },
            isError = phoneError,
            label = { Text("Phone Number / Radio ID *") },
            leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = Color(0xFF38BDF8)) },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFF38BDF8),
                unfocusedBorderColor = Color(0xFF334155),
                errorBorderColor = Color(0xFFEF4444)
            )
        )
        if (phoneError) {
            Text("Valid contact number/radio ID is required", color = Color(0xFFEF4444), fontSize = 11.sp, modifier = Modifier.padding(start = 8.dp, top = 2.dp))
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Role Selector
        Text("Your Emergency Role", color = Color(0xFF94A3B8), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            roles.forEach { role ->
                FilterChip(
                    selected = selectedRole == role,
                    onClick = { selectedRole = role },
                    label = { Text(role.replace("_", " "), fontSize = 11.sp) }
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        // Blood Group
        Text("Blood Group", color = Color(0xFF94A3B8), fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 6.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            bloodGroups.take(4).forEach { bg ->
                FilterChip(
                    selected = bloodGroup == bg,
                    onClick = { bloodGroup = bg },
                    label = { Text(bg, fontSize = 11.sp) }
                )
            }
        }
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(bottom = 12.dp),
            horizontalArrangement = Arrangement.spacedBy(4.dp)
        ) {
            bloodGroups.drop(4).forEach { bg ->
                FilterChip(
                    selected = bloodGroup == bg,
                    onClick = { bloodGroup = bg },
                    label = { Text(bg, fontSize = 11.sp) }
                )
            }
        }

        // Emergency Next-of-kin Contact
        OutlinedTextField(
            value = emergencyContact,
            onValueChange = {
                emergencyContact = it
                contactError = it.isBlank()
            },
            isError = contactError,
            label = { Text("Next-of-Kin Emergency Phone *") },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFF38BDF8),
                unfocusedBorderColor = Color(0xFF334155),
                errorBorderColor = Color(0xFFEF4444)
            )
        )
        if (contactError) {
            Text("Emergency contact required for rescue triage", color = Color(0xFFEF4444), fontSize = 11.sp, modifier = Modifier.padding(start = 8.dp, top = 2.dp))
        }

        Spacer(modifier = Modifier.height(14.dp))

        // Chronic Medical Conditions
        OutlinedTextField(
            value = medicalConditions,
            onValueChange = { medicalConditions = it },
            label = { Text("Pre-existing Medical Conditions / Allergies (Optional)") },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedTextColor = Color.White,
                unfocusedTextColor = Color.White,
                focusedBorderColor = Color(0xFF38BDF8),
                unfocusedBorderColor = Color(0xFF334155)
            )
        )

        Spacer(modifier = Modifier.height(28.dp))

        // Register Button
        Button(
            onClick = {
                val hasNameErr = name.isBlank()
                val hasPhoneErr = phone.length < 8
                val hasContactErr = emergencyContact.isBlank()

                nameError = hasNameErr
                phoneError = hasPhoneErr
                contactError = hasContactErr

                if (!hasNameErr && !hasPhoneErr && !hasContactErr) {
                    onRegistered(name, selectedRole, phone)
                }
            },
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
            shape = RoundedCornerShape(12.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp)
        ) {
            Text("Complete & Arm Mesh Identity", fontSize = 15.sp, fontWeight = FontWeight.Bold)
        }
    }
}
