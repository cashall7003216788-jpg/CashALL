package in.cashall.caller

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build

class CashAllApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "CashALL Call Tracking Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Monitors calling shifts and records talk duration"
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    companion object {
        const val CHANNEL_ID = "cashall_calling_channel"
        const val BACKEND_URL = "https://cashall.in/api/v1/support/recordings"
    }
}
