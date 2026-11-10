package org.sahaayanet.app.data.local.dao

import androidx.room.*
import kotlinx.coroutines.flow.Flow
import org.sahaayanet.app.data.local.entity.MessageEntity
import org.sahaayanet.app.data.local.entity.SosAlertEntity
import org.sahaayanet.app.data.local.entity.MeshNodeEntity

@Dao
interface MessageDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertMessage(message: MessageEntity)

    @Insert(onConflict = OnConflictStrategy.IGNORE)
    suspend fun insertMessages(messages: List<MessageEntity>)

    @Query("SELECT * FROM messages WHERE bundleId = :bundleId LIMIT 1")
    suspend fun getMessageById(bundleId: String): MessageEntity?

    @Query("SELECT * FROM messages ORDER BY priority ASC, createdTimestamp ASC")
    fun getAllMessagesFlow(): Flow<List<MessageEntity>>

    @Query("SELECT * FROM messages WHERE isSyncedToCloud = 0 ORDER BY priority ASC, createdTimestamp ASC")
    suspend fun getUnsyncedMessages(): List<MessageEntity>

    @Query("UPDATE messages SET isSyncedToCloud = 1 WHERE bundleId IN (:bundleIds)")
    suspend fun markAsSynced(bundleIds: List<String>)

    @Query("DELETE FROM messages WHERE bundleId = :bundleId")
    suspend fun deleteMessage(bundleId: String)

    @Query("DELETE FROM messages WHERE (:currentTimestamp - createdTimestamp) > (timeToLiveSeconds * 1000)")
    suspend fun purgeExpiredMessages(currentTimestamp: Long): Int
}

@Dao
interface SosAlertDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAlert(alert: SosAlertEntity)

    @Query("SELECT * FROM sos_alerts ORDER BY timestamp DESC")
    fun getAllAlertsFlow(): Flow<List<SosAlertEntity>>

    @Query("SELECT * FROM sos_alerts WHERE isSynced = 0 ORDER BY timestamp ASC")
    suspend fun getUnsyncedAlerts(): List<SosAlertEntity>

    @Query("UPDATE sos_alerts SET isSynced = 1, syncedAt = :syncedAt WHERE alertId IN (:alertIds)")
    suspend fun markAlertsSynced(alertIds: List<String>, syncedAt: Long)

    @Query("UPDATE sos_alerts SET status = :status WHERE alertId = :alertId")
    suspend fun updateAlertStatus(alertId: String, status: String)
}

@Dao
interface MeshNodeDao {
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun upsertNode(node: MeshNodeEntity)

    @Query("SELECT * FROM mesh_nodes ORDER BY lastSeenTimestamp DESC")
    fun getAllNodesFlow(): Flow<List<MeshNodeEntity>>

    @Query("SELECT * FROM mesh_nodes WHERE nodeId = :nodeId LIMIT 1")
    suspend fun getNodeById(nodeId: String): MeshNodeEntity?

    @Query("UPDATE mesh_nodes SET forwardedBundlesCount = forwardedBundlesCount + 1 WHERE nodeId = :nodeId")
    suspend fun incrementForwardCount(nodeId: String)
}
