package `in`.cashall.admin

import android.content.Context
import android.webkit.JavascriptInterface
import org.json.JSONObject

class CashAllAdminNative(private val context: Context) {

    @JavascriptInterface
    fun openGoogleNavigation(address: String) {
        GoogleNavigationHelper.startNavigation(context, address)
    }

    @JavascriptInterface
    fun triggerRealOrderAlarm(orderJson: String) {
        try {
            val json = JSONObject(orderJson)
            val isReal = json.optBoolean("isRealOrder", true)
            if (isReal) {
                AlarmSoundManager.startAlarm(context)
            }
        } catch (e: Exception) {
            AlarmSoundManager.startAlarm(context)
        }
    }

    @JavascriptInterface
    fun stopAlarm() {
        AlarmSoundManager.stopAlarm(context)
    }

    @JavascriptInterface
    fun getAppVersion(): String = "1.0.0"
}
