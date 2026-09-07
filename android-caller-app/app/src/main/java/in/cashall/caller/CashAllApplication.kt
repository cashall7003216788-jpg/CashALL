package `in`.cashall.caller

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import android.util.Log

class CashAllApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        setupGlobalCrashHandler()
        createNotificationChannels()
    }

    private fun setupGlobalCrashHandler() {
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Log.e(TAG, "FATAL CRASH on thread ${thread.name}: ${throwable.message}", throwable)
            try {
                val prefs = getSharedPreferences("cashall_crash_log", Context.MODE_PRIVATE)
                prefs.edit()
                    .putString("last_crash_message", throwable.message ?: "Unknown error")
                    .putString("last_crash_stack", Log.getStackTraceString(throwable))
                    .putLong("last_crash_time", System.currentTimeMillis())
                    .commit()
            } catch (ignored: Exception) {}

            defaultHandler?.uncaughtException(thread, throwable)
        }
    }

    private fun createNotificationChannels() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val channel = NotificationChannel(
                    CHANNEL_ID,
                    "CashALL Call Tracking Service",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "Monitors calling shifts and records talk duration"
                }
                val manager = getSystemService(NotificationManager::class.java)
                manager?.createNotificationChannel(channel)
            }
        } catch (t: Throwable) {
            Log.e(TAG, "Failed to create notification channel: ${t.message}", t)
        }
    }

    companion object {
        private const val TAG = "CashAllApplication"
        const val CHANNEL_ID = "cashall_calling_channel"
        const val BACKEND_URL = "https://cashall.in/api/v1/support/recordings"
    }
}
