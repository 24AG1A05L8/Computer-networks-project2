package org.sahaayanet.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import kotlinx.serialization.Serializable

/**
 * Offline Store-Carry-Forward Bundle Entity
 */
@Entity(tableName = "messages")
@Serializable
data class MessageEntity(
    @PrimaryKey
    val bundleId: String,
    val originNodeId: String,
    val destinationNodeId: String,
    val payloadType: String, // SOS_ALERT, STATUS_UPDATE, ACK, TEXT
    val payloadJson: String,
    val priority: Int, // 1 (Highest / SOS) to 10 (Lowest / Telemetry)
    val hopCount: Int,
    val maxHops: Int,
    val timeToLiveSeconds: Long,
    val createdTimestamp: Long,
    val isDelivered: Boolean = false,
    val isSyncedToCloud: Boolean = false,
    val hopsHistoryJson: String = "[]"
)

/**
 * Emergency SOS Request Entity stored locally in Room DB
 */
@Entity(tableName = "sos_alerts")
@Serializable
data class SosAlertEntity(
    @PrimaryKey
    val alertId: String,
    val senderName: String,
    val emergencyType: String, // MEDICAL, FIRE, FLOOD, STRUCTURAL_COLLAPSE, SEARCH_AND_RESCUE, SUPPLIES
    val severity: String,      // CRITICAL, HIGH, MEDIUM, LOW
    val status: String,        // PENDING, DISPATCHED, IN_PROGRESS, RESOLVED
    val victimCount: Int,
    val medicalNeeds: String,
    val notes: String,
    val latitude: Double,
    val longitude: Double,
    val accuracyMeters: Float = 0f,
    val timestamp: Long = System.currentTimeMillis(),
    val originNodeId: String,
    val hopCount: Int = 0,
    val isSynced: Boolean = false,
    val syncedAt: Long? = null
)

/**
 * Discovered Nearby Peer Node Entity
 */
@Entity(tableName = "mesh_nodes")
@Serializable
data class MeshNodeEntity(
    @PrimaryKey
    val nodeId: String,
    val role: String, // CIVILIAN, FIRST_RESPONDER, MEDIC, GATEWAY, COMMAND_STATION
    val bleAddress: String,
    val wifiDirectAddress: String? = null,
    val batteryPercent: Int = 100,
    val isGateway: Boolean = false,
    val lastSeenTimestamp: Long = System.currentTimeMillis(),
    val rssi: Int = 0,
    val directHop: Boolean = true,
    val forwardedBundlesCount: Int = 0
)
