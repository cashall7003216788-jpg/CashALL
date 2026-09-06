package in.cashall.caller.service

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.media.MediaRecorder
import android.os.Build
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import in.cashall.caller.network.CallUploader
import in.cashall.caller.utils.PreferenceManager
import java.io.File
import java.io.IOException

class CallRecorderAccessibilityService : AccessibilityService() {

    private var mediaRecorder: MediaRecorder? = null
    private var currentRecordingFile: File? = null
    private var isRecording = false
    private var callStartTimeMillis: Long = 0

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.d(TAG, "CallRecorderAccessibilityService connected successfully")
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        // Can optionally detect dialer / phone app UI events
    }

    override fun onInterrupt() {
        Log.w(TAG, "CallRecorderAccessibilityService interrupted")
    }

    override fun onDestroy() {
        super.onDestroy()
        stopRecording(null)
        instance = null
    }

    fun startRecording(customerPhone: String) {
        if (isRecording) {
            Log.w(TAG, "Already recording, ignoring duplicate start")
            return
        }

        try {
            val fileName = "rec_${customerPhone}_${System.currentTimeMillis()}.m4a"
            val outputDir = File(filesDir, "recordings")
            if (!outputDir.exists()) outputDir.mkdirs()

            currentRecordingFile = File(outputDir, fileName)

            mediaRecorder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(this)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }.apply {
                // VOICE_COMMUNICATION captures echo-cancelled 2-way call audio on modern Android
                try {
                    setAudioSource(MediaRecorder.AudioSource.VOICE_COMMUNICATION)
                } catch (e: Exception) {
                    setAudioSource(MediaRecorder.AudioSource.MIC)
                }
                setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
                setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
                setAudioEncodingBitRate(64000)
                setAudioSamplingRate(44100)
                setOutputFile(currentRecordingFile?.absolutePath)
                prepare()
                start()
            }

            isRecording = true
            callStartTimeMillis = System.currentTimeMillis()
            Log.i(TAG, "Audio recording started for customer: $customerPhone")
        } catch (e: IOException) {
            Log.error(TAG, "Failed to start MediaRecorder: ${e.message}", e)
            mediaRecorder?.release()
            mediaRecorder = null
            isRecording = false
        }
    }

    fun stopRecording(overrideCustomerPhone: String? = null) {
        if (!isRecording) return

        try {
            mediaRecorder?.apply {
                stop()
                release()
            }
        } catch (e: Exception) {
            Log.error(TAG, "Error stopping MediaRecorder: ${e.message}")
        } finally {
            mediaRecorder = null
            isRecording = false
        }

        val durationMillis = System.currentTimeMillis() - callStartTimeMillis
        val durationSeconds = (durationMillis / 1000).toInt()

        val recordedFile = currentRecordingFile
        if (recordedFile != null && recordedFile.exists() && recordedFile.length() > 0) {
            Log.i(TAG, "Recording finished (${durationSeconds}s, ${recordedFile.length()} bytes). Dispatching upload...")

            val prefs = PreferenceManager(this)
            val customer = overrideCustomerPhone?.takeIf { it.isNotBlank() } ?: prefs.lastTargetCustomerPhone

            CallUploader.uploadCallRecording(
                context = this,
                audioFile = recordedFile,
                customerPhone = customer.ifBlank { "Customer" },
                supportPersonName = prefs.agentName,
                supportPersonPhone = prefs.agentPhone,
                quoteId = prefs.lastTargetQuoteId,
                durationSeconds = durationSeconds
            )
        }
    }

    companion object {
        private const val TAG = "CashAllAccessibility"
        var instance: CallRecorderAccessibilityService? = null
            private set

        fun isServiceRunning(): Boolean = instance != null
    }
}
