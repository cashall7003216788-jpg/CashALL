package `in`.cashall.agent

import android.content.Context
import android.media.AudioManager
import android.media.MediaRecorder
import android.os.Build
import android.util.Log
import java.io.File

/**
 * High-Reliability In-App Audio Call Recorder for CashALL Field Agent App.
 *
 * Employs automatic speakerphone routing and multi-source fallbacks (VOICE_CALL,
 * VOICE_RECOGNITION, MIC) to ensure both agent and customer voices are captured
 * loudly and clearly even when native system call recording is not pre-enabled.
 */
object InAppAudioRecorder {
    private const val TAG = "InAppAudioRecorder"
    private var mediaRecorder: MediaRecorder? = null
    private var currentRecordingFile: File? = null
    private var isRecording = false

    private var silentSpeakerEnabled = false
    private var originalSpeakerOn = false
    private var originalAudioMode = AudioManager.MODE_NORMAL

    @Synchronized
    fun startRecording(context: Context, customerPhone: String) {
        if (isRecording) {
            Log.d(TAG, "Already recording, skipping start.")
            return
        }

        try {
            val dir = File(context.cacheDir, "in_app_recordings").also { it.mkdirs() }
            val cleanPhone = customerPhone.replace(Regex("[^0-9]"), "").takeLast(10)
            val file = File(dir, "rec_${cleanPhone}_${System.currentTimeMillis()}.m4a")
            currentRecordingFile = file

            // 1. Activate speakerphone routing so the microphone physically captures both voices
            activateSilentSpeaker(context)

            // Short pause to allow Android audio HAL routing to switch to speaker
            try { Thread.sleep(400) } catch (ignored: InterruptedException) {}

            // 2. Multi-tier audio sources:
            // - VOICE_CALL: 2-way cellular audio on supported OEM hardware
            // - VOICE_RECOGNITION: High gain, avoids in-call echo-canceller zeroing
            // - MIC: Raw hardware mic, captures loudspeaker output loudly
            // - VOICE_COMMUNICATION: Fallback
            // - DEFAULT: Last resort
            val sources = listOf(
                MediaRecorder.AudioSource.VOICE_CALL,
                MediaRecorder.AudioSource.VOICE_RECOGNITION,
                MediaRecorder.AudioSource.MIC,
                MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                MediaRecorder.AudioSource.DEFAULT
            )

            for (src in sources) {
                if (tryRecordWith(context, src, file)) {
                    isRecording = true
                    Log.i(TAG, "🎙 In-app audio capture active via source ${srcName(src)} for $cleanPhone")
                    return
                }
            }
            Log.w(TAG, "Could not initialize in-app MediaRecorder with any audio source.")
            deactivateSilentSpeaker(context)
        } catch (e: Exception) {
            Log.e(TAG, "Error in startRecording: ${e.message}", e)
            deactivateSilentSpeaker(context)
        }
    }

    private fun tryRecordWith(context: Context, source: Int, outputFile: File): Boolean {
        return try {
            val mr = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                MediaRecorder(context)
            } else {
                @Suppress("DEPRECATION")
                MediaRecorder()
            }

            mr.setAudioSource(source)
            mr.setOutputFormat(MediaRecorder.OutputFormat.MPEG_4)
            mr.setAudioEncoder(MediaRecorder.AudioEncoder.AAC)
            mr.setAudioEncodingBitRate(128_000)
            mr.setAudioSamplingRate(44_100)
            mr.setAudioChannels(1)
            mr.setOutputFile(outputFile.absolutePath)
            mr.prepare()
            mr.start()

            mediaRecorder = mr
            true
        } catch (e: Throwable) {
            Log.w(TAG, "Failed to start MediaRecorder with source ${srcName(source)}: ${e.message}")
            false
        }
    }

    @Synchronized
    fun stopRecording(context: Context? = null): File? {
        // Restore speakerphone immediately before stopping recorder
        deactivateSilentSpeaker(context)

        if (!isRecording && mediaRecorder == null) return null
        isRecording = false

        try {
            mediaRecorder?.stop()
        } catch (e: Exception) {
            Log.w(TAG, "Error stopping MediaRecorder: ${e.message}")
        }
        try {
            mediaRecorder?.release()
        } catch (ignored: Exception) {}
        mediaRecorder = null

        val file = currentRecordingFile
        currentRecordingFile = null

        if (file != null && file.exists() && file.length() >= 5000) {
            Log.i(TAG, "🎙 In-app audio recording finished: ${file.name} (${file.length()} bytes)")
            return file
        } else {
            file?.delete()
            return null
        }
    }

    private fun activateSilentSpeaker(context: Context) {
        try {
            val am = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager ?: return
            @Suppress("DEPRECATION")
            if (am.isSpeakerphoneOn || am.isBluetoothScoOn) {
                Log.d(TAG, "Audio already routed externally — no speakerphone override needed")
                return
            }
            @Suppress("DEPRECATION")
            originalSpeakerOn = am.isSpeakerphoneOn
            originalAudioMode = am.mode
            @Suppress("DEPRECATION")
            am.mode = AudioManager.MODE_IN_COMMUNICATION
            @Suppress("DEPRECATION")
            am.isSpeakerphoneOn = true
            silentSpeakerEnabled = true
            Log.i(TAG, "🔊 Silently routed call audio to speakerphone for clear two-way capture")
        } catch (e: Throwable) {
            Log.w(TAG, "activateSilentSpeaker error: ${e.message}")
        }
    }

    private fun deactivateSilentSpeaker(context: Context?) {
        if (!silentSpeakerEnabled) return
        try {
            val am = context?.getSystemService(Context.AUDIO_SERVICE) as? AudioManager ?: return
            @Suppress("DEPRECATION")
            am.mode = originalAudioMode
            @Suppress("DEPRECATION")
            am.isSpeakerphoneOn = originalSpeakerOn
            silentSpeakerEnabled = false
            Log.d(TAG, "🔇 Speakerphone restored to original state: $originalSpeakerOn")
        } catch (e: Throwable) {
            Log.w(TAG, "deactivateSilentSpeaker error: ${e.message}")
        }
    }

    private fun srcName(source: Int) = when (source) {
        MediaRecorder.AudioSource.VOICE_CALL -> "VOICE_CALL"
        MediaRecorder.AudioSource.VOICE_DOWNLINK -> "VOICE_DOWNLINK"
        MediaRecorder.AudioSource.VOICE_UPLINK -> "VOICE_UPLINK"
        MediaRecorder.AudioSource.VOICE_RECOGNITION -> "VOICE_RECOGNITION"
        MediaRecorder.AudioSource.MIC -> "MIC"
        MediaRecorder.AudioSource.VOICE_COMMUNICATION -> "VOICE_COMMUNICATION"
        MediaRecorder.AudioSource.DEFAULT -> "DEFAULT"
        else -> "UNKNOWN($source)"
    }
}
