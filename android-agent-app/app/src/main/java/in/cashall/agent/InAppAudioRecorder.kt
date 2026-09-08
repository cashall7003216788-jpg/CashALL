package `in`.cashall.agent

import android.content.Context
import android.media.MediaRecorder
import android.os.Build
import android.util.Log
import java.io.File

object InAppAudioRecorder {
    private const val TAG = "InAppAudioRecorder"
    private var mediaRecorder: MediaRecorder? = null
    private var currentRecordingFile: File? = null
    private var isRecording = false

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

            val sources = listOf(
                MediaRecorder.AudioSource.VOICE_COMMUNICATION,
                MediaRecorder.AudioSource.MIC,
                MediaRecorder.AudioSource.DEFAULT
            )

            for (src in sources) {
                if (tryRecordWith(context, src, file)) {
                    isRecording = true
                    Log.i(TAG, "🎙 In-app audio capture active via source $src for $cleanPhone")
                    return
                }
            }
            Log.w(TAG, "Could not initialize in-app MediaRecorder with any audio source.")
        } catch (e: Exception) {
            Log.e(TAG, "Error in startRecording: ${e.message}", e)
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
            Log.w(TAG, "Failed to start MediaRecorder with source $source: ${e.message}")
            false
        }
    }

    @Synchronized
    fun stopRecording(): File? {
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
}
