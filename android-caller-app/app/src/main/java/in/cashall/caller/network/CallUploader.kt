package in.cashall.caller.network

import android.content.Context
import android.util.Log
import in.cashall.caller.CashAllApplication
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

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(30, TimeUnit.SECONDS)
        .writeTimeout(60, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    fun uploadCallRecording(
        context: Context,
        audioFile: File,
        customerPhone: String,
        supportPersonName: String,
        supportPersonPhone: String,
        quoteId: String,
        durationSeconds: Int
    ) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                Log.d(TAG, "Uploading audio: ${audioFile.name} (${audioFile.length()} bytes) to ${CashAllApplication.BACKEND_URL}")

                val audioBody = audioFile.asRequestBody("audio/m4a".toMediaTypeOrNull())

                val multipartBody = MultipartBody.Builder()
                    .setType(MultipartBody.FORM)
                    .addFormDataPart("audio", audioFile.name, audioBody)
                    .addFormDataPart("supportPersonName", supportPersonName)
                    .addFormDataPart("supportPersonPhone", supportPersonPhone)
                    .addFormDataPart("customerPhone", customerPhone)
                    .addFormDataPart("durationSeconds", durationSeconds.toString())
                    .addFormDataPart("quoteId", quoteId)
                    .addFormDataPart("callOutcome", if (durationSeconds > 10) "CUSTOMER_INTERESTED" else "CALL_ATTEMPTED")
                    .addFormDataPart("callNotes", "Recorded automatically by CashALL Android Calling Desk")
                    .build()

                val request = Request.Builder()
                    .url(CashAllApplication.BACKEND_URL)
                    .post(multipartBody)
                    .build()

                val response = httpClient.newCall(request).execute()

                if (response.isSuccessful) {
                    val responseStr = response.body?.string()
                    Log.i(TAG, "Call recording uploaded successfully! Response: $responseStr")
                    // Clean up local temp file after successful upload
                    try {
                        audioFile.delete()
                    } catch (e: Exception) {
                        Log.w(TAG, "Could not delete temp audio file: ${e.message}")
                    }
                } else {
                    Log.error(TAG, "Call upload failed with HTTP code ${response.code}: ${response.body?.string()}")
                }
            } catch (e: IOException) {
                Log.error(TAG, "Network error uploading call recording: ${e.message}", e)
            } catch (e: Exception) {
                Log.error(TAG, "Unexpected error in CallUploader: ${e.message}", e)
            }
        }
    }
}
