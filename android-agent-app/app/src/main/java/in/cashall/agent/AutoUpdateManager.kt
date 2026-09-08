package `in`.cashall.agent

import android.app.Activity
import android.app.AlertDialog
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import android.view.LayoutInflater
import android.widget.Button
import android.widget.ProgressBar
import android.widget.TextView
import androidx.core.content.FileProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.util.concurrent.TimeUnit

object AutoUpdateManager {
    private const val TAG = "AutoUpdateManager"
    private const val VERSION_URL = "https://cashall.in/api/v1/app/version"
    private const val APK_DOWNLOAD_URL = "https://cashall.in/api/v1/download/agent"

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(60, TimeUnit.SECONDS)
        .build()

    fun checkAndPromptUpdate(activity: Activity) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val currentVersionCode = getAppVersionCode(activity)
                val request = Request.Builder()
                    .url("$VERSION_URL?t=${System.currentTimeMillis()}")
                    .addHeader("Cache-Control", "no-cache")
                    .get()
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) return@launch

                    val bodyStr = response.body?.string() ?: return@launch
                    val json = JSONObject(bodyStr)
                    val agentObj = json.optJSONObject("agent") ?: return@launch

                    val remoteVersionCode = agentObj.optInt("versionCode", 0)
                    val remoteVersionName = agentObj.optString("versionName", "")
                    val releaseNotes = agentObj.optString("releaseNotes", "New performance enhancements and call updates.")

                    Log.i(TAG, "Version Check: local=$currentVersionCode, remote=$remoteVersionCode ($remoteVersionName)")

                    if (remoteVersionCode > currentVersionCode) {
                        withContext(Dispatchers.Main) {
                            showUpdateDialog(activity, remoteVersionName, releaseNotes)
                        }
                    }
                }
            } catch (e: Exception) {
                Log.w(TAG, "Update check skipped: ${e.message}")
            }
        }
    }

    private fun showUpdateDialog(activity: Activity, newVersionName: String, releaseNotes: String) {
        if (activity.isFinishing || activity.isDestroyed) return

        val builder = AlertDialog.Builder(activity)
        builder.setTitle("🚀 New Update Available (v$newVersionName)")
        builder.setMessage("A new version of CashALL Agent App is ready.\n\n• What's New: $releaseNotes\n\nTap 'Update Now' to update without losing your login or session.")
        builder.setPositiveButton("Update Now") { dialog, _ ->
            dialog.dismiss()
            startDownloadAndInstall(activity)
        }
        builder.setNegativeButton("Later") { dialog, _ ->
            dialog.dismiss()
        }
        builder.setCancelable(true)
        builder.show()
    }

    private fun startDownloadAndInstall(activity: Activity) {
        val progressDialog = AlertDialog.Builder(activity)
            .setTitle("Downloading Update...")
            .setMessage("Please wait while the update is downloading...")
            .setCancelable(false)
            .create()

        progressDialog.show()

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val apkFile = File(activity.cacheDir, "CashALL-Agent-Update.apk")
                if (apkFile.exists()) apkFile.delete()

                val request = Request.Builder()
                    .url(APK_DOWNLOAD_URL)
                    .get()
                    .build()

                httpClient.newCall(request).execute().use { response ->
                    if (!response.isSuccessful) {
                        throw Exception("Download failed with HTTP ${response.code}")
                    }

                    val body = response.body ?: throw Exception("Empty response body")
                    val inputStream = body.byteStream()
                    val outputStream = FileOutputStream(apkFile)

                    val buffer = ByteArray(8192)
                    var bytesRead: Int
                    while (inputStream.read(buffer).also { bytesRead = it } != -1) {
                        outputStream.write(buffer, 0, bytesRead)
                    }

                    outputStream.flush()
                    outputStream.close()
                    inputStream.close()
                }

                withContext(Dispatchers.Main) {
                    progressDialog.dismiss()
                    launchPackageInstaller(activity, apkFile)
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed downloading update APK: ${e.message}", e)
                withContext(Dispatchers.Main) {
                    progressDialog.dismiss()
                    AlertDialog.Builder(activity)
                        .setTitle("Download Failed")
                        .setMessage("Could not download update: ${e.message}. You can download manually from https://cashall.in/download/agent")
                        .setPositiveButton("Open Browser") { _, _ ->
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse("https://cashall.in/download/agent"))
                            activity.startActivity(intent)
                        }
                        .setNegativeButton("Close", null)
                        .show()
                }
            }
        }
    }

    private fun launchPackageInstaller(activity: Activity, apkFile: File) {
        try {
            val authority = "${activity.packageName}.fileprovider"
            val apkUri: Uri = FileProvider.getUriForFile(activity, authority, apkFile)

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(apkUri, "application/vnd.android.package-archive")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_GRANT_READ_URI_PERMISSION
            }
            activity.startActivity(intent)
            Log.i(TAG, "Triggered PackageInstaller for update: ${apkFile.name}")
        } catch (e: Exception) {
            Log.e(TAG, "Error launching PackageInstaller: ${e.message}", e)
        }
    }

    private fun getAppVersionCode(activity: Activity): Long {
        return try {
            val pInfo = activity.packageManager.getPackageInfo(activity.packageName, 0)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                pInfo.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                pInfo.versionCode.toLong()
            }
        } catch (e: Exception) {
            1L
        }
    }
}
