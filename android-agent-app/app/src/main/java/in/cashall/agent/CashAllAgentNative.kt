package `in`.cashall.agent

import android.app.Activity
import android.content.Context
import android.os.PowerManager
import android.webkit.JavascriptInterface

/**
 * JavaScript Interface bridge injected into WebView as window.CashAllAgentNative
 */
class CashAllAgentNative(
    private val activity: Activity,
    private val onAlarmStateChanged: (Boolean) -> Unit
) {

    @JavascriptInterface
    fun startAlarm() {
        activity.runOnUiThread {
            // Wake device screen if sleeping
            try {
                val powerManager = activity.getSystemService(Context.POWER_SERVICE) as PowerManager
                val wakeLock = powerManager.newWakeLock(
                    PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
                    "cashall:agent_lead_alarm_wake"
                )
                wakeLock.acquire(15000)
            } catch (e: Exception) {}

            AlarmSoundManager.startAlarm(activity)
            onAlarmStateChanged(true)
        }
    }

    @JavascriptInterface
    fun stopAlarm() {
        activity.runOnUiThread {
            AlarmSoundManager.stopAlarm(activity)
            onAlarmStateChanged(false)
        }
    }

    @JavascriptInterface
    fun isAlarmActive(): Boolean {
        return AlarmSoundManager.isAlarmActive()
    }

    @JavascriptInterface
    fun triggerHaptic() {
        AlarmSoundManager.triggerOneShotHaptic(activity)
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return "1.0.0-PROD"
    }
}
