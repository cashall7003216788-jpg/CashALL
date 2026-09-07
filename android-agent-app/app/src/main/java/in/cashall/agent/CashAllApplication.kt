package `in`.cashall.agent

import android.app.Application
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.media.RingtoneManager
import android.os.Build
import android.util.Log

class CashAllApplication : Application() {

    companion object {
        private const val TAG = "CashAllAgentApp"
        const val CHANNEL_MONITOR_ID = "cashall_agent_monitor_channel"
        const val CHANNEL_URGENT_ALARM_ID = "cashall_agent_urgent_lead_channel"
    }

    override fun onCreate() {
        super.onCreate()
        setupGlobalCrashHandler()
        createNotificationChannels()
    }

    private fun setupGlobalCrashHandler() {
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            Log.e(TAG, "FATAL CRASH on thread ${thread.name}: ${throwable.message}", throwable)
            defaultHandler?.uncaughtException(thread, throwable)
        }
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        val manager = getSystemService(NotificationManager::class.java) ?: return

        try {
            // 1. Silent Ongoing Service Channel
            val monitorChannel = NotificationChannel(
                CHANNEL_MONITOR_ID,
                "CashALL Field Agent Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps lead monitoring active in the background"
                setShowBadge(false)
            }
            manager.createNotificationChannel(monitorChannel)

            // 2. High Priority Loud Alarm & Siren Channel
            val urgentAlarmChannel = NotificationChannel(
                CHANNEL_URGENT_ALARM_ID,
                "Urgent New Lead Siren Alert",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Loud alarm sounds and phone vibrations when a new customer lead is assigned"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 800, 300, 800, 300, 1000)
                // Sound is handled exclusively by AlarmSoundManager (STREAM_ALARM)
                // to prevent double-alarm mixing and enable instant cancellation.
                setSound(null, null)
                lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                setBypassDnd(true)
            }
            manager.createNotificationChannel(urgentAlarmChannel)

            Log.i(TAG, "Notification channels created successfully.")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to create notification channels: ${e.message}", e)
        }
    }
}
