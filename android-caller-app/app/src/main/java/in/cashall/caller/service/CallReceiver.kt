package in.cashall.caller.service

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.telephony.TelephonyManager
import android.util.Log
import in.cashall.caller.utils.PreferenceManager

class CallReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val prefs = PreferenceManager(context)

        if (action == Intent.ACTION_NEW_OUTGOING_CALL) {
            val dialedNumber = intent.getStringExtra(Intent.EXTRA_PHONE_NUMBER)
            if (!dialedNumber.isNullOrBlank()) {
                lastDialedNumber = dialedNumber
                prefs.lastTargetCustomerPhone = dialedNumber
                Log.d(TAG, "Outgoing call dialed to: $dialedNumber")
            }
            return
        }

        if (action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val stateStr = intent.getStringExtra(TelephonyManager.EXTRA_STATE)
            val incomingNumber = intent.getStringExtra(TelephonyManager.EXTRA_INCOMING_NUMBER)

            if (!incomingNumber.isNullOrBlank()) {
                lastDialedNumber = incomingNumber
                prefs.lastTargetCustomerPhone = incomingNumber
            }

            val targetPhone = lastDialedNumber.ifBlank { prefs.lastTargetCustomerPhone }.ifBlank { "Customer" }

            when (stateStr) {
                TelephonyManager.EXTRA_STATE_OFFHOOK -> {
                    // Call answered / active conversation started
                    Log.i(TAG, "Call connected (OFFHOOK) with $targetPhone. Starting recording...")
                    CallRecorderAccessibilityService.instance?.startRecording(targetPhone)
                }

                TelephonyManager.EXTRA_STATE_IDLE -> {
                    // Call ended / hung up
                    Log.i(TAG, "Call ended (IDLE) with $targetPhone. Stopping recording & uploading...")
                    CallRecorderAccessibilityService.instance?.stopRecording(targetPhone)
                    lastDialedNumber = ""
                }

                TelephonyManager.EXTRA_STATE_RINGING -> {
                    Log.d(TAG, "Phone ringing: $targetPhone")
                }
            }
        }
    }

    companion object {
        private const val TAG = "CashAllCallReceiver"
        var lastDialedNumber: String = ""
    }
}
