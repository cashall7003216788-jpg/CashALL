package `in`.cashall.admin

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.media.AudioAttributes
import android.os.Build

class CashAllAdminApplication : Application() {

    companion object {
        const val CHANNEL_ALARM = "cashall_admin_real_order_alarm"
        const val CHANNEL_SERVICE = "cashall_admin_foreground_service"
        const val CHANNEL_INFO = "cashall_admin_info"
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

            // 1. Ongoing 24/7 Background Service Channel
            val serviceChannel = NotificationChannel(
                CHANNEL_SERVICE,
                "Admin Order Sentinel",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps CashALL Admin monitoring active for new real customer orders"
                setShowBadge(false)
            }

            // 2. High Priority Real Customer Order Alarm Channel
            val alarmChannel = NotificationChannel(
                CHANNEL_ALARM,
                "Real Customer Order Alert",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "10-second loud alarm buzzer and phone vibration when an actual customer order is placed"
                enableVibration(true)
                vibrationPattern = longArrayOf(0, 800, 300, 800, 300, 1000)
                setSound(
                    null, // Handled directly by AlarmSoundManager via MediaPlayer USAGE_ALARM
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .build()
                )
                lockscreenVisibility = android.app.Notification.VISIBILITY_PUBLIC
            }

            // 3. Informational Channel (Silent notifications for test orders)
            val infoChannel = NotificationChannel(
                CHANNEL_INFO,
                "Test Orders & General Info",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Silent notifications for test orders and status updates"
            }

            notificationManager.createNotificationChannels(listOf(serviceChannel, alarmChannel, infoChannel))
        }
    }
}
