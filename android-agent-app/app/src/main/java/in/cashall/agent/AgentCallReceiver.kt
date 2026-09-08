package `in`.cashall.agent

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.provider.CallLog
import android.telephony.TelephonyManager
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File

class AgentCallReceiver : BroadcastReceiver() {

    companion object {
        private const val TAG = "AgentCallReceiver"
        private var lastDialedNumber: String = ""
        private var isCallActive: Boolean = false
        private var callStartTime: Long = 0L
        private var lastUploadTime: Long = 0L
        private var lastUploadedPhone: String = ""
    }

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return

        // 1. Capture outgoing dialed number
        if (action == Intent.ACTION_NEW_OUTGOING_CALL) {
            @Suppress("DEPRECATION")
            val number = resultData ?: intent.getStringExtra(Intent.EXTRA_PHONE_NUMBER) ?: ""
            if (number.isNotBlank()) {
                lastDialedNumber = number
                Log.i(TAG, "📤 Outgoing call initiated to: $number")
            }
            return
        }

        // 2. Monitor telephony state
        if (action == TelephonyManager.ACTION_PHONE_STATE_CHANGED) {
            val state = intent.getStringExtra(TelephonyManager.EXTRA_STATE)

            // Ignore incoming calls completely on agent's personal phone
            if (state == TelephonyManager.EXTRA_STATE_RINGING) {
                Log.d(TAG, "📳 Incoming call detected on personal phone — ignored.")
                return
            }

            val savedTargetPhone = AgentPreferenceManager.getLastTargetPhone(context)
            if (savedTargetPhone.isBlank()) {
                // No active customer call was initiated from app
                return
            }

            val effectivePhone = lastDialedNumber.ifBlank { savedTargetPhone }

            // Strict Privacy Check: Only record and upload if initiated via CashALL "Call Customer"
            val isAppCall = AgentPreferenceManager.isAppInitiatedCallActive(context, effectivePhone)
            if (!isAppCall) {
                Log.d(TAG, "🔒 Privacy Filter: Call ($effectivePhone) is personal/outside CashALL. Ignoring recording & upload.")
                if (state == TelephonyManager.EXTRA_STATE_IDLE) {
                    lastDialedNumber = ""
                    isCallActive = false
                    callStartTime = 0L
                    InAppAudioRecorder.stopRecording()?.delete()
                }
                return
            }

            when (state) {
                TelephonyManager.EXTRA_STATE_OFFHOOK -> {
                    if (!isCallActive) {
                        isCallActive = true
                        callStartTime = System.currentTimeMillis()
                        Log.i(TAG, "📞 CashALL Lead Call CONNECTED to $effectivePhone at $callStartTime")
                        InAppAudioRecorder.startRecording(context, effectivePhone)
                    }
                }

                TelephonyManager.EXTRA_STATE_IDLE -> {
                    val inAppFile = InAppAudioRecorder.stopRecording()
                    if (isCallActive && callStartTime > 0L) {
                        isCallActive = false
                        val startTime = callStartTime
                        val endTime = System.currentTimeMillis()
                        callStartTime = 0L

                        Log.i(TAG, "🔴 CashALL Lead Call DISCONNECTED from $effectivePhone. Processing sync...")
                        processCallEnd(context.applicationContext, effectivePhone, startTime, endTime, inAppFile)
                    }
                    lastDialedNumber = ""
                }
            }
        }
    }

    private fun processCallEnd(context: Context, phone: String, startTime: Long, endTime: Long, inAppFile: File? = null) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Clear active call session immediately to protect privacy on next calls
                AgentPreferenceManager.clearAppInitiatedCall(context)

                delay(600) // Small delay for system dialer to register call in CallLog

                val exactDuration = getExactDurationFromCallLog(context, phone)
                val fallbackDuration = ((endTime - startTime) / 1000).toInt()
                val finalDuration = exactDuration ?: fallbackDuration

                val now = System.currentTimeMillis()
                if (now - lastUploadTime < 3000 && phone == lastUploadedPhone) {
                    Log.w(TAG, "Duplicate upload suppressed within 3s window for $phone")
                    inAppFile?.delete()
                    return@launch
                }
                lastUploadTime = now
                lastUploadedPhone = phone

                val customerName = AgentPreferenceManager.getLastTargetName(context)
                val deviceName = AgentPreferenceManager.getLastTargetDevice(context)
                val orderNumber = AgentPreferenceManager.getLastTargetOrder(context)
                val agentName = AgentPreferenceManager.getAgentName(context) ?: "Field Agent"
                val agentPhone = AgentPreferenceManager.getAgentPhone(context) ?: ""

                Log.i(TAG, "📊 Processing call summary: Agent=$agentName ($agentPhone), Customer=$customerName ($phone), Order=$orderNumber, Duration=${finalDuration}s")

                // 1. Scan device for native 2-way call recording (Samsung, Xiaomi/MIUI, Vivo, OnePlus, Oppo, Realme)
                val nativeAudioFile = NativeCallRecordFinder.findRecentRecording(
                    context = context,
                    rawCustomerPhone = phone,
                    customerName = customerName,
                    callStartTime = startTime,
                    callEndTime = endTime
                )

                val callNotes: String
                val finalAudio: File?

                if (nativeAudioFile != null && nativeAudioFile.exists() && nativeAudioFile.length() >= 5000) {
                    finalAudio = nativeAudioFile
                    callNotes = "Recorded via Native System Call Recorder (HD 2-Way Audio)"
                    Log.i(TAG, "🎉 Native recording verified (${finalAudio.length()} bytes): ${finalAudio.name}")
                    inAppFile?.delete()
                } else if (inAppFile != null && inAppFile.exists() && inAppFile.length() >= 5000) {
                    finalAudio = inAppFile
                    callNotes = "Recorded via CashALL In-App Audio Engine"
                    Log.i(TAG, "🎙 Using In-App Recording (${finalAudio.length()} bytes): ${finalAudio.name}")
                } else {
                    finalAudio = null
                    callNotes = "Logged via CashALL Field Agent App (Auto-record not detected)"
                    Log.w(TAG, "⚠️ No audio recording found. Logging metadata.")
                }

                CallUploader.uploadCallRecording(
                    context = context,
                    audioFile = finalAudio,
                    customerPhone = phone,
                    customerName = customerName,
                    deviceName = deviceName,
                    supportPersonName = agentName,
                    supportPersonPhone = agentPhone,
                    quoteId = orderNumber,
                    durationSeconds = finalDuration,
                    callNotes = callNotes
                )
            } catch (e: Exception) {
                Log.e(TAG, "Error in processCallEnd: ${e.message}", e)
            }
        }
    }

    private fun getExactDurationFromCallLog(context: Context, phone: String): Int? {
        if (context.checkSelfPermission(android.Manifest.permission.READ_CALL_LOG) != PackageManager.PERMISSION_GRANTED) {
            Log.w(TAG, "READ_CALL_LOG permission not granted; falling back to timer.")
            return null
        }
        return try {
            val cleanPhone = phone.replace(Regex("[^0-9]"), "").takeLast(10)
            val cursor = context.contentResolver.query(
                CallLog.Calls.CONTENT_URI,
                arrayOf(CallLog.Calls.NUMBER, CallLog.Calls.DURATION, CallLog.Calls.DATE, CallLog.Calls.TYPE),
                null,
                null,
                "${CallLog.Calls.DATE} DESC"
            )
            cursor?.use {
                if (it.moveToFirst()) {
                    val numberCol = it.getColumnIndex(CallLog.Calls.NUMBER)
                    val durationCol = it.getColumnIndex(CallLog.Calls.DURATION)
                    val dateCol = it.getColumnIndex(CallLog.Calls.DATE)

                    val number = if (numberCol != -1) it.getString(numberCol) ?: "" else ""
                    val duration = if (durationCol != -1) it.getInt(durationCol) else 0
                    val date = if (dateCol != -1) it.getLong(dateCol) else 0L

                    val isRecent = (System.currentTimeMillis() - date) < 90_000
                    val logClean = number.replace(Regex("[^0-9]"), "").takeLast(10)

                    if (isRecent && (cleanPhone.isEmpty() || logClean.contains(cleanPhone) || cleanPhone.contains(logClean))) {
                        Log.d(TAG, "Exact duration from CallLog: ${duration}s for $number")
                        return duration
                    }
                }
            }
            null
        } catch (e: Exception) {
            Log.w(TAG, "Failed querying CallLog: ${e.message}")
            null
        }
    }
}
