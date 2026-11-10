package org.sahaayanet.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import org.sahaayanet.app.data.local.dao.MessageDao
import org.sahaayanet.app.data.local.dao.SosAlertDao
import org.sahaayanet.app.data.local.dao.MeshNodeDao
import org.sahaayanet.app.data.local.entity.MessageEntity
import org.sahaayanet.app.data.local.entity.SosAlertEntity
import org.sahaayanet.app.data.local.entity.MeshNodeEntity

@Database(
    entities = [
        MessageEntity::class,
        SosAlertEntity::class,
        MeshNodeEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class SahaayaDatabase : RoomDatabase() {
    abstract fun messageDao(): MessageDao
    abstract fun sosAlertDao(): SosAlertDao
    abstract fun meshNodeDao(): MeshNodeDao

    companion object {
        @Volatile
        private var INSTANCE: SahaayaDatabase? = null

        fun getDatabase(context: Context): SahaayaDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    SahaayaDatabase::class.java,
                    "sahaayanet_offline.db"
                )
                .fallbackToDestructiveMigration()
                .build()
                INSTANCE = instance
                instance
            }
        }
    }
}
