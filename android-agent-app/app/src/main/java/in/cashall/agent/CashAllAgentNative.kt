package `in`.cashall.agent

import android.app.Activity
import android.content.Context
import android.os.PowerManager
import android.util.Log
import android.webkit.JavascriptInterface

/**
 * JavaScript Interface bridge injected into WebView as window.CashAllAgentNative
 */
class CashAllAgentNative(
    private val activity: Activity,
    private val onAlarmStateChanged: (Boolean) -> Unit
) {

    companion object {
        private const val TAG = "CashAllAgentNative"
    }

    @JavascriptInterface
    fun saveAgentSession(phone: String, name: String, agentId: String) {
        activity.runOnUiThread {
            Log.i(TAG, "Saving agent session natively: phone=$phone, name=$name, id=$agentId")
            AgentPreferenceManager.saveAgentSession(activity, phone, name, agentId)
            // Immediately start background 24/7 lead monitoring service
            AgentLeadMonitoringService.start(activity)
        }
    }

    @JavascriptInterface
    fun clearAgentSession() {
        activity.runOnUiThread {
            Log.i(TAG, "Clearing agent session and stopping background monitoring.")
            AgentPreferenceManager.clearSession(activity)
            AgentLeadMonitoringService.stop(activity)
            AlarmSoundManager.stopAlarm(activity)
            onAlarmStateChanged(false)
        }
    }

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
                wakeLock.acquire(20000)
            } catch (e: Exception) {
                Log.w(TAG, "WakeLock error: ${e.message}")
            }

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
    fun callCustomer(phone: String, customerName: String, deviceName: String, orderNumber: String) {
        activity.runOnUiThread {
            Log.i(TAG, "Calling customer: phone=$phone, name=$customerName, device=$deviceName, order=$orderNumber")
            AgentPreferenceManager.setLastTargetCall(activity, phone, customerName, deviceName, orderNumber)

            try {
                val cleanPhone = phone.trim()
                val hasCallPhone = activity.checkSelfPermission(android.Manifest.permission.CALL_PHONE) == android.content.pm.PackageManager.PERMISSION_GRANTED
                val intent = if (hasCallPhone) {
                    android.content.Intent(android.content.Intent.ACTION_CALL, android.net.Uri.parse("tel:$cleanPhone"))
                } else {
                    android.content.Intent(android.content.Intent.ACTION_DIAL, android.net.Uri.parse("tel:$cleanPhone"))
                }
                intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
                activity.startActivity(intent)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to launch call intent: ${e.message}", e)
            }
        }
    }

    @JavascriptInterface
    fun openDialerCallSettings() {
        activity.runOnUiThread {
            if (activity is MainActivity) {
                activity.openDialerCallSettings()
            }
        }
    }

    @JavascriptInterface
    fun getAppVersion(): String {
        return "1.0.2-CALL-RECORD-PROD"
    }
}
