package org.sahaayanet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun LoginScreen(
    onLoginSuccess: (callsignOrPhone: String) -> Unit,
    onNavigateBack: () -> Unit,
    onNavigateToRegister: () -> Unit
) {
    var identifier by remember { mutableStateOf("") }
    var pin by remember { mutableStateOf("") }
    var identifierError by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(24.dp),
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        Column {
            IconButton(
                onClick = onNavigateBack,
                modifier = Modifier.padding(bottom = 8.dp)
            ) {
                Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = Color.White)
            }

            Text(
                text = "Sign In to SahaayaNet",
                fontSize = 26.sp,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Text(
                text = "Access your local Room cryptographic keystore and peer reputation record.",
                fontSize = 13.sp,
                color = Color(0xFF94A3B8),
                modifier = Modifier.padding(top = 4.dp, bottom = 28.dp)
            )

            OutlinedTextField(
                value = identifier,
                onValueChange = {
                    identifier = it
                    identifierError = it.isBlank()
                },
                isError = identifierError,
                label = { Text("Callsign or Phone Number") },
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
            if (identifierError) {
                Text("Enter a registered phone number or callsign", color = Color(0xFFEF4444), fontSize = 11.sp, modifier = Modifier.padding(start = 8.dp, top = 2.dp))
            }

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = pin,
                onValueChange = { pin = it },
                label = { Text("Emergency Security PIN (Optional for offline)") },
                leadingIcon = { Icon(Icons.Default.Lock, contentDescription = null, tint = Color(0xFF38BDF8)) },
                modifier = Modifier.fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    focusedBorderColor = Color(0xFF38BDF8),
                    unfocusedBorderColor = Color(0xFF334155)
                )
            )

            Spacer(modifier = Modifier.height(28.dp))

            Button(
                onClick = {
                    if (identifier.isBlank()) {
                        identifierError = true
                    } else {
                        onLoginSuccess(identifier)
                    }
                },
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                shape = RoundedCornerShape(12.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp)
            ) {
                Text("Authenticate & Unlock Node", fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("Don't have an emergency ID? ", color = Color(0xFF94A3B8), fontSize = 13.sp)
            TextButton(onClick = onNavigateToRegister) {
                Text("Register Now", color = Color(0xFF38BDF8), fontWeight = FontWeight.Bold, fontSize = 13.sp)
            }
        }
    }
}
