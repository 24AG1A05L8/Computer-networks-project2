package org.sahaayanet.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun OfflineEmergencyInfoScreen(
    onNavigateBack: () -> Unit
) {
    var expandedTopic by remember { mutableStateOf<String?>("CPR") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFF0F172A))
            .padding(16.dp)
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
            Column {
                Text("Offline Emergency Reference", color = Color.White, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text("Stored on-device • 100% accessible with zero connectivity", color = Color(0xFF34D399), fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            }
        }

        Spacer(modifier = Modifier.height(18.dp))

        // Topic 1: CPR
        SurvivalCard(
            title = "Adult Hands-Only CPR Protocol",
            category = "CARDIAC ARREST",
            icon = Icons.Default.Favorite,
            iconTint = Color(0xFFEF4444),
            isExpanded = expandedTopic == "CPR",
            onClick = { expandedTopic = if (expandedTopic == "CPR") null else "CPR" },
            instructions = listOf(
                "1. Check responsiveness and breathing. Tap shoulders firmly.",
                "2. Place heel of one hand in the center of the chest; place other hand on top and interlock fingers.",
                "3. Push hard and fast at a rate of 100–120 compressions/minute (to the beat of 'Stayin' Alive').",
                "4. Allow the chest to fully recoil between each compression.",
                "5. Continue until emergency medical responders arrive or victim shows signs of life."
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Topic 2: Bleeding
        SurvivalCard(
            title = "Severe Bleeding & Tourniquet Control",
            category = "TRAUMA MANAGEMENT",
            icon = Icons.Default.Healing,
            iconTint = Color(0xFFF97316),
            isExpanded = expandedTopic == "BLEEDING",
            onClick = { expandedTopic = if (expandedTopic == "BLEEDING") null else "BLEEDING" },
            instructions = listOf(
                "1. Apply direct, firm pressure over wound using sterile gauze or clean cloth.",
                "2. If arterial bright red spurting persists on limb, place tourniquet 2–3 inches above wound (never directly over a joint).",
                "3. Tighten the windlass until bleeding stops completely. Note exact application time on victim's forehead or arm.",
                "4. Keep victim warm with a thermal blanket to prevent hypothermia."
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Topic 3: Flood
        SurvivalCard(
            title = "Flash Flood Evacuation Safety",
            category = "NATURAL DISASTER",
            icon = Icons.Default.WaterDrop,
            iconTint = Color(0xFF38BDF8),
            isExpanded = expandedTopic == "FLOOD",
            onClick = { expandedTopic = if (expandedTopic == "FLOOD") null else "FLOOD" },
            instructions = listOf(
                "1. Never attempt to drive or walk through moving water. 6 inches of water can sweep a person off their feet.",
                "2. Move immediately to higher ground or top floors. Do not climb into enclosed attics unless an axe/roof exit is available.",
                "3. Disconnect electricity at main breaker if safe before water rises.",
                "4. Wave a bright colored cloth or flash a light toward rescuers."
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Topic 4: Water Purification
        SurvivalCard(
            title = "Emergency Water Purification",
            category = "SURVIVAL SUPPLIES",
            icon = Icons.Default.Science,
            iconTint = Color(0xFFA855F7),
            isExpanded = expandedTopic == "WATER",
            onClick = { expandedTopic = if (expandedTopic == "WATER") null else "WATER" },
            instructions = listOf(
                "1. Boil water vigorously for at least 1 full minute (3 minutes at high altitude).",
                "2. Chemical disinfection: Add 2 drops of non-scented household bleach per liter of clear water; stir and wait 30 minutes.",
                "3. If water is cloudy, filter through multiple clean cotton cloths before chemical treatment."
            )
        )
    }
}

@Composable
private fun SurvivalCard(
    title: String,
    category: String,
    icon: ImageVector,
    iconTint: Color,
    isExpanded: Boolean,
    onClick: () -> Unit,
    instructions: List<String>
) {
    Surface(
        color = Color(0xFF1E293B),
        shape = RoundedCornerShape(12.dp),
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Surface(
                        color = iconTint.copy(alpha = 0.2f),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.size(36.dp)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(icon, contentDescription = null, tint = iconTint, modifier = Modifier.size(20.dp))
                        }
                    }
                    Spacer(modifier = Modifier.width(10.dp))
                    Column {
                        Text(category, color = iconTint, fontSize = 10.sp, fontWeight = FontWeight.Black, letterSpacing = 1.sp)
                        Text(title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                    }
                }
                Icon(
                    if (isExpanded) Icons.Default.ExpandLess else Icons.Default.ExpandMore,
                    contentDescription = null,
                    tint = Color(0xFF94A3B8)
                )
            }

            if (isExpanded) {
                Spacer(modifier = Modifier.height(12.dp))
                HorizontalDivider(color = Color(0xFF334155), thickness = 0.5.dp)
                Spacer(modifier = Modifier.height(10.dp))
                instructions.forEach { step ->
                    Text(
                        text = step,
                        color = Color(0xFFE2E8F0),
                        fontSize = 12.sp,
                        lineHeight = 18.sp,
                        modifier = Modifier.padding(bottom = 6.dp)
                    )
                }
            }
        }
    }
}
