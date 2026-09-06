package in.cashall.caller.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat
import in.cashall.caller.CashAllApplication
import in.cashall.caller.MainActivity

class CallMonitoringService : Service() {

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_IMMUTABLE
        )

        val notification: Notification = NotificationCompat.Builder(this, CashAllApplication.CHANNEL_ID)
            .setContentTitle("CashALL Calling Desk Active")
            .setContentText("Call tracking & quality assurance is active for this shift")
            .setSmallIcon(android.R.drawable.stat_sys_phone_call)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()

        startForeground(1001, notification)
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
