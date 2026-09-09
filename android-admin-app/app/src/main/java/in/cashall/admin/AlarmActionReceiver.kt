package `in`.cashall.admin

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class AlarmActionReceiver : BroadcastReceiver() {
    companion object {
        const val ACTION_SILENCE_ALARM = "in.cashall.admin.ACTION_SILENCE_ALARM"
    }

    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action == ACTION_SILENCE_ALARM) {
            AlarmSoundManager.stopAlarm(context)
        }
    }
}
