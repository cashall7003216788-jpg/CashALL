package `in`.cashall.caller.utils

import android.content.Context
import android.content.SharedPreferences

class PreferenceManager(context: Context) {
    private val prefs: SharedPreferences =
        context.getSharedPreferences("cashall_caller_prefs", Context.MODE_PRIVATE)

    var agentName: String
        get() = prefs.getString("agent_name", "Support Agent") ?: "Support Agent"
        set(value) = prefs.edit().putString("agent_name", value).apply()

    var agentPhone: String
        get() = prefs.getString("agent_phone", "") ?: ""
        set(value) = prefs.edit().putString("agent_phone", value).apply()

    var lastTargetCustomerPhone: String
        get() = prefs.getString("last_customer_phone", "") ?: ""
        set(value) = prefs.edit().putString("last_customer_phone", value).apply()

    var lastTargetCustomerName: String
        get() = prefs.getString("last_customer_name", "Customer Lead") ?: "Customer Lead"
        set(value) = prefs.edit().putString("last_customer_name", value).apply()

    var lastTargetDeviceName: String
        get() = prefs.getString("last_device_name", "Mobile Device") ?: "Mobile Device"
        set(value) = prefs.edit().putString("last_device_name", value).apply()

    var lastTargetQuoteId: String
        get() = prefs.getString("last_quote_id", "") ?: ""
        set(value) = prefs.edit().putString("last_quote_id", value).apply()

    var hasSeenCallRecordPrompt: Boolean
        get() = prefs.getBoolean("has_seen_call_record_prompt", false)
        set(value) = prefs.edit().putBoolean("has_seen_call_record_prompt", value).apply()
}
