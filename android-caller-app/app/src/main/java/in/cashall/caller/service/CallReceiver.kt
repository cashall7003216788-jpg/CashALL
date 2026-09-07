package `in`.cashall.caller.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import android.telephony.TelephonyManager
import android.util.Log
import `in`.cashall.caller.utils.PreferenceManager

class CallReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val prefs = PreferenceManager(context)

        // ── Restart monitoring service after device reboot ──
        if (action == Intent.ACTION_BOOT_COMPLETED) {
            Log.i(TAG, "📱 Boot completed — starting CallMonitoringService")
            startMonitoringService(context)
            return
        }

        // ── Capture outgoing call phone number ──
        if (action == Intent.ACTION_NEW_OUTGOING_CALL) {
            @Suppress("DEPRECATION")
            val number = resultData ?: intent.getStringExtra(Intent.EXTRA_PHONE_NUMBER) ?: ""
            if (number.isNotBlank()) {
                lastNumber = number
                prefs.lastTargetCustomerPhone = number
                Log.i(TAG, "📤 Outgoing call to: $number")
            }
            return
        }

        // ── Monitor phone call states ──
        if (action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)

            @Suppress("DEPRECATION")
            val incoming = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)
            if (!incoming.isNullOrBlank()) {
                lastNumber = incoming
                prefs.lastTargetCustomerPhone = incoming
                Log.d(TAG, "📥 Incoming call from: $incoming")
            }

            val phone = lastNumber.ifBlank { prefs.lastTargetCustomerPhone }.ifBlank { "Unknown" }

            when (state) {
                TelephonyManager.EXTRA_STATE_RINGING -> {
                    Log.d(TAG, "📳 Ringing: $phone")
                }

                TelephonyManager.EXTRA_STATE_OFFHOOK -> {
                    // Call is now active — tell the ALWAYS-RUNNING service to start recording
                    Log.i(TAG, "✅ OFFHOOK ($phone) — requesting recording start")
                    sendToService(context, CallMonitoringService.ACTION_START_RECORDING, phone)
                }

                TelephonyManager.EXTRA_STATE_IDLE -> {
                    // Call ended — tell service to stop recording and upload
                    Log.i(TAG, "🔴 IDLE ($phone) — requesting recording stop + upload")
                    sendToService(context, CallMonitoringService.ACTION_STOP_RECORDING, phone)
                    lastNumber = ""
                }
            }
        }
    }

    // ── Helpers ──

    private fun sendToService(context: Context, action: String, phone: String) {
        try {
            val intent = Intent(context, CallMonitoringService::class.java).apply {
                this.action = action
                putExtra(CallMonitoringService.EXTRA_PHONE, phone)
            }
            // CallMonitoringService is already a foreground service — just startService()
            context.startService(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send $action to service: ${e.message}")
        }
    }

    private fun startMonitoringService(context: Context) {
        try {
            val intent = Intent(context, CallMonitoringService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start monitoring service on boot: ${e.message}")
        }
    }

    companion object {
        private const val TAG = "CashAllReceiver"
        var lastNumber: String = ""
    }
}
