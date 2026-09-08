package `in`.cashall.agent

import android.content.Context
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File
import java.io.IOException
import java.util.concurrent.TimeUnit

object CallUploader {
    private const val TAG = "CashAllCallUploader"
    private const val BACKEND_URL = "https://cashall.in/api/v1/support/recordings"

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    fun uploadCallRecording(
        context: Context,
        audioFile: File? = null,
        customerPhone: String,
        customerName: String = "Customer Lead",
        deviceName: String = "Mobile Device",
        supportPersonName: String,
        supportPersonPhone: String,
        quoteId: String,
        durationSeconds: Int,
        callNotes: String = "Logged via CashALL Field Agent App"
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val hasAudio = audioFile != null && audioFile.exists() && audioFile.length() >= 5000
                Log.d(TAG, "Uploading call log (hasAudio=$hasAudio, size=${audioFile?.length() ?: 0} bytes, duration=${durationSeconds}s) to $BACKEND_URL")

                val multipartBuilder = MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("supportPersonName", supportPersonName)
                    .addFormDataPart("supportPersonPhone", supportPersonPhone)
                    .addFormDataPart("customerName", customerName)
                    .addFormDataPart("customerPhone", customerPhone)
                    .addFormDataPart("deviceName", deviceName)
                    .addFormDataPart("durationSeconds", durationSeconds.toString())
                    .addFormDataPart("quoteId", quoteId)
                    .addFormDataPart("callOutcome", "CALL_COMPLETED")
                    .addFormDataPart("callNotes", callNotes)
                    .addFormDataPart("role", "AGENT")
                    .addFormDataPart("actorRole", "AGENT")
                    .addFormDataPart("callType", "AGENT_PICKUP_CALL")

                if (hasAudio && audioFile != null) {
                    val mimeType = when (audioFile.extension.lowercase()) {
                        "mp3" -> "audio/mpeg"
                        "m4a" -> "audio/m4a"
                        "aac" -> "audio/aac"
                        "amr" -> "audio/amr"
                        "wav" -> "audio/wav"
                        "3gp" -> "audio/3gpp"
                        else -> "audio/m4a"
                    }
                    val audioBody = audioFile.asRequestBody(mimeType.toMediaTypeOrNull())
                    multipartBuilder.addFormDataPart("audio", audioFile.name, audioBody)
                }

                val request = Request.Builder()
                    .url(BACKEND_URL)
                    .post(multipartBuilder.build())
                    .build()

                val response = httpClient.newCall(request).execute()

                if (response.isSuccessful) {
                    val responseStr = response.body?.string()
                    Log.i(TAG, "Call log uploaded successfully! Response: $responseStr")
                    if (hasAudio && audioFile != null) {
                        try {
                            audioFile.delete()
                        } catch (e: Exception) {
                            Log.w(TAG, "Could not delete temp audio file: ${e.message}")
                        }
                    }
                } else {
                    Log.e(TAG, "Call upload failed with HTTP code ${response.code}: ${response.body?.string()}")
                }
            } catch (e: IOException) {
                Log.e(TAG, "Network error uploading call recording: ${e.message}", e)
            } catch (e: Exception) {
                Log.e(TAG, "Unexpected error in CallUploader: ${e.message}", e)
            } finally {
                try {
                    audioFile?.delete()
                    File(context.cacheDir, "in_app_recordings").listFiles()?.forEach { f ->
                        if (System.currentTimeMillis() - f.lastModified() > 60_000) f.delete()
                    }
                    File(context.cacheDir, "recordings_sync").listFiles()?.forEach { f ->
                        if (System.currentTimeMillis() - f.lastModified() > 60_000) f.delete()
                    }
                } catch (ignored: Exception) {}
            }
        }
    }
}
