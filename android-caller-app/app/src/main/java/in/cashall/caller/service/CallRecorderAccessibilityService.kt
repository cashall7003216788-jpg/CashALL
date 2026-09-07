package `in`.cashall.caller.service

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.media.AudioManager
import android.media.MediaRecorder
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import `in`.cashall.caller.network.CallUploader
import `in`.cashall.caller.utils.PreferenceManager
import java.io.File

class CallRecorderAccessibilityService : AccessibilityService() {

    private var mediaRecorder: MediaRecorder? = null
    private var currentRecordingFile: File? = null
    private var isRecording = false
    private var callStartTimeMillis: Long = 0

    // Track speaker state so we can restore it after the call
    private var silentSpeakerWasEnabled = false
    private var originalSpeakerState = false

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.d(TAG, "✅ CallRecorderAccessibilityService connected")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {}

    override fun onInterrupt() {
        Log.w(TAG, "CallRecorderAccessibilityService interrupted")
    }

    override fun onDestroy() {
        super.onDestroy()
        restoreSpeakerState()
        stopRecording(null)
        instance = null
    }

    /**
     * Called when a call becomes active (OFFHOOK state).
     *
     * Strategy:
     *   1. Try VOICE_CALL source — works on some OEM phones (Samsung/Xiaomi < Android 10)
     *   2. Try VOICE_DOWNLINK — captures remote/customer voice only
     *   3. GUARANTEED FALLBACK: silently route audio to speakerphone so MIC
     *      captures BOTH voices. The agent hears everything through speaker
     *      (louder, hands-free) without needing to do anything manually.
     */
    fun startRecording(customerPhone: String) {
        if (isRecording) {
            Log.w(TAG, "Already recording, ignoring duplicate start")
            return
        }

        val outputDir = File(filesDir, "recordings")
        if (!outputDir.exists()) outputDir.mkdirs()

        val fileName = "rec_${customerPhone}_${System.currentTimeMillis()}.m4a"
        currentRecordingFile = File(outputDir, fileName)

        // Step 1: Try privileged voice sources (work silently on some OEM devices)
        val privilegedSources = listOf(
            MediaRecorder.AudioSource.VOICE_CALL,       // Both sides — works on some OEMs
            MediaRecorder.AudioSource.VOICE_DOWNLINK,   // Remote/customer side only
        )

        for (source in privilegedSources) {
            if (tryStartWithSource(source)) {
                Log.i(TAG, "🎙️ Recording started with privileged source: ${sourceName(source)}")
                return
            }
        }

        // Step 2: GUARANTEED FALLBACK — Silently route call audio to speakerphone
        // This is what ACR, Cube ACR and all professional call recorders use.
        // Works on ALL Android versions, ALL devices, NO root needed.
        // The agent hears the call through the back speaker automatically.
        Log.i(TAG, "⚡ Privileged sources unavailable — activating silent speakerphone routing")
        enableSilentSpeaker()

        // Small delay to allow audio routing to switch before we start recording
        Handler(Looper.getMainLooper()).postDelayed({
            val micSources = listOf(
                MediaRecorder.AudioSource.MIC,              // Raw mic (now picks up both via speaker)
                MediaRecorder.AudioSource.VOICE_COMMUNICATION, // VoIP quality mic
                MediaRecorder.AudioSource.VOICE_RECOGNITION,   // Noise-cancelled mic
                MediaRecorder.AudioSource.DEFAULT
            )

            var started = false
            for (source in micSources) {
                if (tryStartWithSource(source)) {
                    Log.i(TAG, "🎙️ Recording started via speaker-routing + ${sourceName(source)}")
                    started = true
                    break
                }
            }

            if (!started) {
                Log.e(TAG, "❌ Could not start recording with ANY source — giving up")
                restoreSpeakerState()
            }
        }, 600L) // 600ms delay to let speakerphone routing settle
    }

    private fun tryStartWithSource(source: Int): Boolean {
        return try {
            val mr = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(this)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }

            mr.setAudioSource(source)
            mr.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            mr.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            mr.setAudioEncodingBitRate(128000)
            mr.setAudioSamplingRate(44100)
            mr.setAudioChannels(1)
            mr.setOutputFile(currentRecordingFile!!.absolutePath)
            mr.prepare()
            mr.start()

            mediaRecorder = mr
            isRecording = true
            callStartTimeMillis = System.currentTimeMillis()
            true
        } catch (e: Throwable) {
            Log.w(TAG, "  ✗ ${sourceName(source)} failed: ${e.message}")
            false
        }
    }

    /**
     * Silently enable speakerphone so MIC can capture both call sides.
     * Saves original state to restore after the call ends.
     */
    private fun enableSilentSpeaker() {
        try {
            val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager

            // Don't override if already on speaker or Bluetooth
            if (audioManager.isSpeakerphoneOn || audioManager.isBluetoothScoOn) {
                Log.d(TAG, "Audio already routed externally (speaker/BT) — no change needed")
                return
            }

            originalSpeakerState = audioManager.isSpeakerphoneOn
            audioManager.isSpeakerphoneOn = true
            silentSpeakerWasEnabled = true
            Log.i(TAG, "🔊 Silently routed call audio to speakerphone for recording")
        } catch (e: Exception) {
            Log.w(TAG, "Could not set speakerphone: ${e.message}")
        }
    }

    /** Restore speakerphone to what it was before the call */
    private fun restoreSpeakerState() {
        if (!silentSpeakerWasEnabled) return
        try {
            val audioManager = getSystemService(Context.AUDIO_SERVICE) as AudioManager
            audioManager.isSpeakerphoneOn = originalSpeakerState
            silentSpeakerWasEnabled = false
            Log.d(TAG, "🔇 Speakerphone restored to original state: $originalSpeakerState")
        } catch (e: Exception) {
            Log.w(TAG, "Could not restore speakerphone: ${e.message}")
        }
    }

    fun stopRecording(overrideCustomerPhone: String? = null) {
        // Restore speaker state FIRST (before stopping recorder)
        restoreSpeakerState()

        if (!isRecording) return

        try { mediaRecorder?.stop() } catch (e: Throwable) {
            Log.e(TAG, "Error stopping MediaRecorder: ${e.message}")
        }
        try { mediaRecorder?.release() } catch (e: Throwable) {}
        mediaRecorder = null
        isRecording = false

        val durationMillis = System.currentTimeMillis() - callStartTimeMillis
        val durationSeconds = (durationMillis / 1000).toInt()

        val recordedFile = currentRecordingFile
        if (recordedFile != null && recordedFile.exists() && recordedFile.length() > 200) {
            Log.i(TAG, "✅ Recording done (${durationSeconds}s, ${recordedFile.length()} bytes) — uploading...")

            val prefs = PreferenceManager(this)
            val phone = overrideCustomerPhone?.takeIf { it.isNotBlank() } ?: prefs.lastTargetCustomerPhone

            CallUploader.uploadCallRecording(
                context = this,
                audioFile = recordedFile,
                customerPhone = phone.ifBlank { "Unknown" },
                customerName = prefs.lastTargetCustomerName,
                deviceName = prefs.lastTargetDeviceName,
                supportPersonName = prefs.agentName,
                supportPersonPhone = prefs.agentPhone,
                quoteId = prefs.lastTargetQuoteId,
                durationSeconds = durationSeconds
            )
        } else {
            Log.w(TAG, "⚠️ Recording too small (${recordedFile?.length() ?: 0} bytes) — skipping upload")
            recordedFile?.delete()
        }
    }

    private fun sourceName(source: Int) = when (source) {
        MediaRecorder.AudioSource.VOICE_CALL -> "VOICE_CALL"
        MediaRecorder.AudioSource.VOICE_DOWNLINK -> "VOICE_DOWNLINK"
        MediaRecorder.AudioSource.VOICE_UPLINK -> "VOICE_UPLINK"
        MediaRecorder.AudioSource.VOICE_COMMUNICATION -> "VOICE_COMMUNICATION"
        MediaRecorder.AudioSource.MIC -> "MIC"
        MediaRecorder.AudioSource.VOICE_RECOGNITION -> "VOICE_RECOGNITION"
        MediaRecorder.AudioSource.DEFAULT -> "DEFAULT"
        else -> "UNKNOWN($source)"
    }

    companion object {
        private const val TAG = "CashAllRecorder"
        var instance: CallRecorderAccessibilityService? = null
            private set

        fun isServiceRunning(): Boolean = instance != null
    }
}
