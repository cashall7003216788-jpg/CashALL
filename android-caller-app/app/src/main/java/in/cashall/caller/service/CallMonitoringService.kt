package `in`.cashall.caller.service

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.content.pm.ServiceInfo
import android.media.AudioManager
import android.media.MediaRecorder
import android.os.Build
import android.os.IBinder
import android.provider.CallLog
import android.util.Log
import androidx.core.app.NotificationCompat
import `in`.cashall.caller.CashAllApplication
import `in`.cashall.caller.MainActivity
import `in`.cashall.caller.R
import `in`.cashall.caller.network.CallUploader
import `in`.cashall.caller.utils.PreferenceManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import java.io.File

class CallMonitoringService : Service() {

    // --- Recording state ---
    private var mediaRecorder: MediaRecorder? = null
    private var recordingFile: File? = null
    private var isRecording = false
    private var isCallActive = false
    private var callStartTime = 0L
    private var lastUploadTime = 0L
    private var lastUploadedPhone = ""
    private var silentSpeakerEnabled = false
    private var originalSpeakerOn = false

    companion object {
        const val ACTION_START_RECORDING = "cashall.START_RECORDING"
        const val ACTION_STOP_RECORDING  = "cashall.STOP_RECORDING"
        const val EXTRA_PHONE = "phone"
        private const val TAG = "CashAllMonitor"
        private const val NOTIF_ID = 1001
    }

    // -------------------------------------------------------------------------
    // Service lifecycle
    // -------------------------------------------------------------------------

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // Always ensure foreground notification is present
        ensureForeground()

        when (intent?.action) {
            ACTION_START_RECORDING -> {
                val phone = intent.getStringExtra(EXTRA_PHONE) ?: ""
                startCallRecording(phone)
            }
            ACTION_STOP_RECORDING -> {
                val phone = intent.getStringExtra(EXTRA_PHONE) ?: ""
                stopCallRecording(phone)
            }
        }

        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        stopCallRecording("")
    }

    // -------------------------------------------------------------------------
    // Foreground notification
    // -------------------------------------------------------------------------

    private fun ensureForeground() {
        try {
            val pendingIntent = PendingIntent.getActivity(
                this, 0,
                Intent(this, MainActivity::class.java),
                PendingIntent.FLAG_IMMUTABLE
            )
            val notification: Notification = NotificationCompat.Builder(this, CashAllApplication.CHANNEL_ID)
                .setContentTitle("CashALL Calling Desk Active")
                .setContentText("Call tracking & quality assurance is running")
                .setSmallIcon(R.drawable.ic_notification)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .build()

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIF_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
            } else {
                startForeground(NOTIF_ID, notification)
            }
        } catch (t: Throwable) {
            Log.e(TAG, "startForeground failed: ${t.message}")
        }
    }

    // -------------------------------------------------------------------------
    // Call Recording & Tracking
    // -------------------------------------------------------------------------

    @Synchronized
    private fun startCallRecording(customerPhone: String) {
        if (isCallActive) {
            Log.d(TAG, "Call already marked active, ignoring duplicate start event")
            return
        }
        isCallActive = true
        callStartTime = System.currentTimeMillis()
        Log.i(TAG, "📞 Call connected — starting tracking for $customerPhone at $callStartTime")

        if (isRecording) {
            Log.w(TAG, "Already recording, skipping duplicate start")
            return
        }

        // Prepare output file
        val dir = File(filesDir, "recordings").also { it.mkdirs() }
        recordingFile = File(dir, "rec_${customerPhone}_${System.currentTimeMillis()}.m4a")

        // Optional best-effort audio capture
        for (src in listOf(
            MediaRecorder.AudioSource.VOICE_CALL,
            MediaRecorder.AudioSource.VOICE_DOWNLINK
        )) {
            if (tryRecordWith(src)) {
                Log.i(TAG, "🎙 Recording via ${srcName(src)}")
                return
            }
        }

        for (src in listOf(
            MediaRecorder.AudioSource.MIC,
            MediaRecorder.AudioSource.VOICE_COMMUNICATION,
            MediaRecorder.AudioSource.DEFAULT
        )) {
            if (tryRecordWith(src)) {
                Log.i(TAG, "🎙 Recording via ${srcName(src)}")
                return
            }
        }

        Log.i(TAG, "ℹ️ Audio recording unavailable on this hardware; logging metadata & duration")
    }

    private fun tryRecordWith(source: Int): Boolean {
        return try {
            val mr = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S)
                MediaRecorder(this) else @Suppress("DEPRECATION") MediaRecorder()

            mr.setAudioSource(source)
            mr.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            mr.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            mr.setAudioEncodingBitRate(128_000)
            mr.setAudioSamplingRate(44_100)
            mr.setAudioChannels(1)
            mr.setOutputFile(recordingFile!!.absolutePath)
            mr.prepare()
            mr.start()

            mediaRecorder = mr
            isRecording = true
            true
        } catch (e: Throwable) {
            Log.w(TAG, "  ✗ ${srcName(source)}: ${e.message}")
            false
        }
    }

    /**
     * Stop recording when the call ends, restore audio routing, then upload to Supabase.
     */
    @Synchronized
    fun stopCallRecording(overridePhone: String) {
        deactivateSilentSpeaker()

        if (!isCallActive || callStartTime == 0L) {
            Log.d(TAG, "stopCallRecording ignored: no active call (isCallActive=$isCallActive, callStartTime=$callStartTime)")
            return
        }

        // Immediately mark inactive so duplicate broadcasts are discarded
        isCallActive = false
        val startTime = callStartTime
        val endTime = System.currentTimeMillis()
        callStartTime = 0L

        if (isRecording) {
            try { mediaRecorder?.stop() } catch (e: Throwable) { Log.w(TAG, "stop(): ${e.message}") }
            try { mediaRecorder?.release() } catch (e: Throwable) {}
            mediaRecorder = null
            isRecording = false
        }

        val prefs = PreferenceManager(this)
        val phone = overridePhone.ifBlank { prefs.lastTargetCustomerPhone }.ifBlank { "Unknown" }

        // Fetch exact duration & search for native recording asynchronously
        CoroutineScope(Dispatchers.IO).launch {
            delay(500)
            val exactDuration = getExactDurationFromCallLog(phone)
            val fallbackDuration = ((endTime - startTime) / 1000).toInt()
            val finalDuration = exactDuration ?: fallbackDuration

            val now = System.currentTimeMillis()
            if (now - lastUploadTime < 3000 && phone == lastUploadedPhone) {
                Log.w(TAG, "Duplicate upload suppressed within 3s window for $phone")
                return@launch
            }
            lastUploadTime = now
            lastUploadedPhone = phone

            Log.i(TAG, "📊 Call ended: phone=$phone, duration=${finalDuration}s (exactCallLog=$exactDuration, fallback=$fallbackDuration)")

            // 1. Search for Native System Call Recording (Samsung, Xiaomi, Vivo, OnePlus, Oppo, Realme)
            val nativeRecordingFile = NativeCallRecordFinder.findRecentRecording(
                context = this@CallMonitoringService,
                rawCustomerPhone = phone,
                callStartTime = startTime,
                callEndTime = endTime
            )

            val inAppFile = recordingFile
            val validInAppAudio = if (inAppFile != null && inAppFile.exists() && inAppFile.length() >= 5000) inAppFile else null

            // Delete in-app dummy file if under 5KB or if native file was already found
            if (inAppFile != null && (validInAppAudio == null || nativeRecordingFile != null)) {
                try { inAppFile.delete() } catch (ignored: Exception) {}
            }

            val finalAudioFile: File?
            val callNotes: String

            if (nativeRecordingFile != null && nativeRecordingFile.exists() && nativeRecordingFile.length() >= 5000) {
                finalAudioFile = nativeRecordingFile
                callNotes = "Recorded via Native System Call Recorder (HD 2-Way Audio)"
                Log.i(TAG, "🎉 Using Native System Recording (${finalAudioFile.length()} bytes): ${finalAudioFile.name}")
            } else if (validInAppAudio != null) {
                finalAudioFile = validInAppAudio
                callNotes = "Recorded via CashALL In-App Audio Capture"
                Log.i(TAG, "🎙 Using In-App Recording (${finalAudioFile.length()} bytes): ${finalAudioFile.name}")
            } else {
                finalAudioFile = null
                callNotes = "Logged via CashALL Caller App (Turn on Auto-record in Phone Settings for HD Audio)"
                Log.w(TAG, "⚠️ No valid audio recording found (>=5KB). Uploading call metadata cleanly without blank audio.")
            }

            CallUploader.uploadCallRecording(
                context       = this@CallMonitoringService,
                audioFile     = finalAudioFile,
                customerPhone = phone,
                customerName  = prefs.lastTargetCustomerName,
                deviceName    = prefs.lastTargetDeviceName,
                supportPersonName  = prefs.agentName,
                supportPersonPhone = prefs.agentPhone,
                quoteId       = prefs.lastTargetQuoteId,
                durationSeconds = finalDuration,
                callNotes     = callNotes
            )

            recordingFile = null
        }
    }

    private fun getExactDurationFromCallLog(phone: String): Int? {
        if (checkSelfPermission(android.Manifest.permission.READ_CALL_LOG) != PackageManager.PERMISSION_GRANTED) {
            Log.w(TAG, "READ_CALL_LOG not granted; cannot query CallLog")
            return null
        }
        return try {
            val cleanPhone = phone.replace(Regex("[^0-9]"), "").takeLast(10)
            val cursor = contentResolver.query(
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

                    Log.d(TAG, "CallLog top entry: number=$number, duration=${duration}s, isRecent=$isRecent")

                    if (isRecent && (cleanPhone.isEmpty() || logClean.isEmpty() || logClean == cleanPhone || cleanPhone.endsWith(logClean) || logClean.endsWith(cleanPhone))) {
                        Log.i(TAG, "✅ Found exact CallLog duration: ${duration}s for $number")
                        return duration
                    }
                }
            }
            null
        } catch (e: Throwable) {
            Log.w(TAG, "Failed to query CallLog: ${e.message}")
            null
        }
    }

    // -------------------------------------------------------------------------
    // Silent speakerphone helpers
    // -------------------------------------------------------------------------

    private fun activateSilentSpeaker() {
        try {
            val am = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            @Suppress("DEPRECATION")
            if (am.isSpeakerphoneOn || am.isBluetoothScoOn) {
                Log.d(TAG, "Audio already routed externally — no speakerphone change needed")
                return                          // already on speaker or BT — MIC will work fine
            }
            @Suppress("DEPRECATION")
            originalSpeakerOn = am.isSpeakerphoneOn
            @Suppress("DEPRECATION")
            am.isSpeakerphoneOn = true
            silentSpeakerEnabled = true
            Log.i(TAG, "🔊 Silently routed call to speakerphone for recording")
        } catch (e: Exception) {
            Log.w(TAG, "activateSilentSpeaker: ${e.message}")
        }
    }

    private fun deactivateSilentSpeaker() {
        if (!silentSpeakerEnabled) return
        try {
            val am = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            @Suppress("DEPRECATION")
            am.isSpeakerphoneOn = originalSpeakerOn
            silentSpeakerEnabled = false
            Log.d(TAG, "🔇 Speakerphone restored to: $originalSpeakerOn")
        } catch (e: Exception) {
            Log.w(TAG, "deactivateSilentSpeaker: ${e.message}")
        }
    }

    private fun srcName(src: Int) = when (src) {
        MediaRecorder.AudioSource.VOICE_CALL          -> "VOICE_CALL"
        MediaRecorder.AudioSource.VOICE_DOWNLINK      -> "VOICE_DOWNLINK"
        MediaRecorder.AudioSource.VOICE_UPLINK        -> "VOICE_UPLINK"
        MediaRecorder.AudioSource.VOICE_COMMUNICATION -> "VOICE_COMMUNICATION"
        MediaRecorder.AudioSource.MIC                 -> "MIC"
        MediaRecorder.AudioSource.VOICE_RECOGNITION   -> "VOICE_RECOGNITION"
        MediaRecorder.AudioSource.DEFAULT             -> "DEFAULT"
        else                                          -> "UNKNOWN($src)"
    }
}
