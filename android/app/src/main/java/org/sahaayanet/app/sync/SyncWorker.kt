package org.sahaayanet.app.sync

import android.content.Context
import android.os.Build
import android.util.Log
import androidx.work.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.concurrent.TimeUnit

/**
 * SahaayaNet Background Synchronization Worker
 * Uses AndroidX WorkManager to automatically trigger online DTN bundle uploads
 * and downstream emergency directive downloads when network connectivity is restored,
 * even if the application is not actively open in the foreground.
 */
class SyncWorker(
    appContext: Context,
    workerParams: WorkerParameters
) : CoroutineWorker(appContext, workerParams) {

    companion object {
        private const val TAG = "SyncWorker"
        const val WORK_NAME = "org.sahaayanet.sync.periodic"

        /**
         * Enqueues periodic sync work constrained to unmetered or connected internet access.
         */
        fun schedulePeriodicSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .setRequiresBatteryNotLow(false)
                .build()

            val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(15, TimeUnit.MINUTES)
                .setConstraints(constraints)
                .setBackoffCriteria(BackoffPolicy.EXPONENTIAL, 30, TimeUnit.SECONDS)
                .build()

            WorkManager.getInstance(context).enqueueUniquePeriodicWork(
                WORK_NAME,
                ExistingPeriodicWorkPolicy.KEEP,
                syncRequest
            )
            Log.i(TAG, "SahaayaNet Periodic Sync Worker scheduled")
        }

        /**
         * Immediately enqueues a one-time expedited sync job upon network detection.
         */
        fun triggerExpeditedSync(context: Context) {
            val constraints = Constraints.Builder()
                .setRequiredNetworkType(NetworkType.CONNECTED)
                .build()

            val oneTimeRequest = OneTimeWorkRequestBuilder<SyncWorker>()
                .setConstraints(constraints)
                .build()

            WorkManager.getInstance(context).enqueue(oneTimeRequest)
            Log.i(TAG, "Expedited one-time sync task triggered")
        }
    }

    override suspend fun doWork(): Result = withContext(Dispatchers.IO) {
        val nodeId = "NODE-" + Build.MODEL.replace(" ", "").take(8)
        Log.i(TAG, "Executing background DTN mesh sync for $nodeId")

        val syncManager = CloudSyncManager(applicationContext, nodeId)
        return@withContext try {
            syncManager.triggerBatchSync()
            Result.success()
        } catch (e: Exception) {
            Log.e(TAG, "SyncWorker encountered an error during batch sync", e)
            if (runAttemptCount < 3) Result.retry() else Result.failure()
        }
    }
}
