package `in`.cashall.agent

import android.app.NotificationManager
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class AlarmActionReceiver : BroadcastReceiver() {

    companion object {
        const val ACTION_SILENCE_ALARM = "in.cashall.agent.ACTION_SILENCE_ALARM"
        const val NOTIF_ID_URGENT_ALARM = 2002
    }

    override fun onReceive(context: Context, intent: Intent?) {
        Log.i("AlarmActionReceiver", "Received action: ${intent?.action}")
        if (intent?.action == ACTION_SILENCE_ALARM) {
            AlarmSoundManager.stopAlarm(context)
            try {
                val notifManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                notifManager?.cancel(NOTIF_ID_URGENT_ALARM)
            } catch (ignored: Exception) {}
            MainActivity.instance?.updateAlarmCard(false)
        }
    }
}
