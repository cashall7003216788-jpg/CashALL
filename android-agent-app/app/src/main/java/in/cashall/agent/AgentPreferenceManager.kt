package `in`.cashall.agent

import android.content.Context
import android.content.SharedPreferences

object AgentPreferenceManager {
    private const val PREFS_NAME = "cashall_agent_prefs"
    private const val KEY_PHONE = "agent_phone"
    private const val KEY_NAME = "agent_name"
    private const val KEY_ID = "agent_id"
    private const val KEY_KNOWN_ORDERS = "known_order_ids"
    private const val KEY_INITIAL_SYNC_DONE = "initial_sync_done"

    private fun getPrefs(context: Context): SharedPreferences {
        return context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
    }

    fun saveAgentSession(context: Context, phone: String, name: String, id: String) {
        getPrefs(context).edit()
            .putString(KEY_PHONE, phone.trim())
            .putString(KEY_NAME, name.trim())
            .putString(KEY_ID, id.trim())
            .apply()
    }

    fun getAgentPhone(context: Context): String? {
        return getPrefs(context).getString(KEY_PHONE, null)
    }

    fun getAgentName(context: Context): String? {
        return getPrefs(context).getString(KEY_NAME, null)
    }

    fun getAgentId(context: Context): String? {
        return getPrefs(context).getString(KEY_ID, null)
    }

    fun isAgentLoggedIn(context: Context): Boolean {
        val phone = getAgentPhone(context)
        return !phone.isNullOrBlank()
    }

    fun clearSession(context: Context) {
        getPrefs(context).edit()
            .remove(KEY_PHONE)
            .remove(KEY_NAME)
            .remove(KEY_ID)
            .remove(KEY_KNOWN_ORDERS)
            .remove(KEY_INITIAL_SYNC_DONE)
            .apply()
    }

    fun getKnownOrderIds(context: Context): MutableSet<String> {
        return getPrefs(context).getStringSet(KEY_KNOWN_ORDERS, emptySet())?.toMutableSet() ?: mutableSetOf()
    }

    fun saveKnownOrderIds(context: Context, ids: Set<String>) {
        getPrefs(context).edit()
            .putStringSet(KEY_KNOWN_ORDERS, ids)
            .apply()
    }

    fun isInitialSyncDone(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_INITIAL_SYNC_DONE, false)
    }

    fun setInitialSyncDone(context: Context, done: Boolean) {
        getPrefs(context).edit()
            .putBoolean(KEY_INITIAL_SYNC_DONE, done)
            .apply()
    }

    // Call logging target tracking & Privacy Protection
    private const val KEY_TARGET_PHONE = "target_customer_phone"
    private const val KEY_TARGET_NAME = "target_customer_name"
    private const val KEY_TARGET_DEVICE = "target_device_name"
    private const val KEY_TARGET_ORDER = "target_order_number"
    private const val KEY_TARGET_TIMESTAMP = "target_call_timestamp"
    private const val KEY_APP_INITIATED = "target_is_app_initiated"
    private const val KEY_CALL_RECORDING_CONFIGURED = "call_recording_configured_once"

    fun isCallRecordingConfigured(context: Context): Boolean {
        return getPrefs(context).getBoolean(KEY_CALL_RECORDING_CONFIGURED, false)
    }

    fun setCallRecordingConfigured(context: Context, configured: Boolean = true) {
        getPrefs(context).edit()
            .putBoolean(KEY_CALL_RECORDING_CONFIGURED, configured)
            .apply()
    }

    fun setLastTargetCall(context: Context, phone: String, name: String, device: String, orderNumber: String) {
        getPrefs(context).edit()
            .putString(KEY_TARGET_PHONE, phone.trim())
            .putString(KEY_TARGET_NAME, name.trim())
            .putString(KEY_TARGET_DEVICE, device.trim())
            .putString(KEY_TARGET_ORDER, orderNumber.trim())
            .putLong(KEY_TARGET_TIMESTAMP, System.currentTimeMillis())
            .putBoolean(KEY_APP_INITIATED, true)
            .apply()
    }

    /**
     * Strict privacy protection: Only returns true if the call was explicitly initiated
     * by clicking "Call Customer" inside the CashALL App within the last 15 minutes.
     * Personal calls to family/friends will return FALSE and will NEVER be recorded or uploaded.
     */
    fun isAppInitiatedCallActive(context: Context, dialedNumber: String?): Boolean {
        val prefs = getPrefs(context)
        val isInitiated = prefs.getBoolean(KEY_APP_INITIATED, false)
        val timestamp = prefs.getLong(KEY_TARGET_TIMESTAMP, 0L)
        val targetPhone = prefs.getString(KEY_TARGET_PHONE, "") ?: ""

        // Expire session after 15 minutes
        if (!isInitiated || (System.currentTimeMillis() - timestamp) > 15 * 60 * 1000L) {
            return false
        }

        if (dialedNumber.isNullOrBlank()) {
            return true
        }

        val cleanDialed = dialedNumber.replace("\\D".toRegex(), "").takeLast(10)
        val cleanTarget = targetPhone.replace("\\D".toRegex(), "").takeLast(10)

        // If either is empty, allow fallback to active session, else verify 10-digit match
        return cleanDialed.isEmpty() || cleanTarget.isEmpty() || cleanDialed == cleanTarget
    }

    fun clearAppInitiatedCall(context: Context) {
        getPrefs(context).edit()
            .putBoolean(KEY_APP_INITIATED, false)
            .apply()
    }

    fun getLastTargetPhone(context: Context): String = getPrefs(context).getString(KEY_TARGET_PHONE, "") ?: ""
    fun getLastTargetName(context: Context): String = getPrefs(context).getString(KEY_TARGET_NAME, "Customer Lead") ?: "Customer Lead"
    fun getLastTargetDevice(context: Context): String = getPrefs(context).getString(KEY_TARGET_DEVICE, "Mobile Device") ?: "Mobile Device"
    fun getLastTargetOrder(context: Context): String = getPrefs(context).getString(KEY_TARGET_ORDER, "N/A") ?: "N/A"
}
