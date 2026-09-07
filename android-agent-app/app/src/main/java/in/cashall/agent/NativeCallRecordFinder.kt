package `in`.cashall.agent

import android.content.Context
import android.net.Uri
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import kotlinx.coroutines.delay
import java.io.File

/**
 * Smart Native Call Recording Detector for CashALL Android Field Agent App.
 *
 * Scans both Android MediaStore and native OEM directories (Samsung, Xiaomi/MIUI,
 * Vivo, OnePlus, Oppo, Realme) across multiple polling attempts after an agent calls a customer.
 *
 * Ensures only real, non-blank audio files (>= 5KB) are uploaded to prevent blank audio.
 */
object NativeCallRecordFinder {
    private const val TAG = "NativeRecordFinder"
    private const val MIN_VALID_AUDIO_BYTES = 5000L // 5 KB minimum to prevent blank/dummy files

    /**
     * Polls the device storage across multiple intervals after a call disconnects,
     * allowing the system dialer to flush and close the audio file.
     */
    suspend fun findRecentRecording(
        context: Context,
        rawCustomerPhone: String,
        callStartTime: Long,
        callEndTime: Long
    ): File? {
        val cleanDigits = rawCustomerPhone.replace(Regex("[^0-9]"), "").takeLast(10)
        Log.i(TAG, "🔍 Starting native recording scan for phone='$rawCustomerPhone' (digits='$cleanDigits')")

        // Polling delays: native dialers take between 1.0s and 2.5s to finish encoding & writing
        val pollDelays = listOf(1500L, 2000L, 2500L, 3000L)

        for ((index, waitTime) in pollDelays.withIndex()) {
            delay(waitTime)
            Log.d(TAG, "Attempt ${index + 1}/${pollDelays.size}: searching MediaStore & OEM directories...")

            // 1. Try MediaStore API (Works across Android 10, 11, 12, 13, 14, 15)
            val mediaStoreFile = queryMediaStore(context, cleanDigits, callStartTime, callEndTime)
            if (mediaStoreFile != null && isValidAudio(mediaStoreFile)) {
                Log.i(TAG, "🎯 Found native recording via MediaStore: ${mediaStoreFile.name} (${mediaStoreFile.length()} bytes)")
                return copyToCache(context, mediaStoreFile, cleanDigits)
            }

            // 2. Try Direct OEM Filesystem Scan (Samsung, Xiaomi/MIUI, Vivo, OnePlus, Oppo, Realme)
            val directFile = scanOemDirectories(cleanDigits, callStartTime, callEndTime)
            if (directFile != null && isValidAudio(directFile)) {
                Log.i(TAG, "🎯 Found native recording via Direct OEM Scan: ${directFile.name} (${directFile.length()} bytes)")
                return copyToCache(context, directFile, cleanDigits)
            }
        }

        Log.w(TAG, "⚠️ No valid native call recording found after full polling period for '$cleanDigits'")
        return null
    }

    private fun isValidAudio(file: File?): Boolean {
        return file != null && file.exists() && file.isFile && file.length() >= MIN_VALID_AUDIO_BYTES
    }

    private fun queryMediaStore(
        context: Context,
        cleanDigits: String,
        callStartTime: Long,
        callEndTime: Long
    ): File? {
        val cr = context.contentResolver ?: return null
        val uri: Uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI

        // Time window: audio added/modified within 3 minutes before call start until now
        val minTimeSec = (callStartTime - 180_000L) / 1000L

        val projection = arrayOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.DATA,
            MediaStore.Audio.Media.DISPLAY_NAME,
            MediaStore.Audio.Media.SIZE,
            MediaStore.Audio.Media.DATE_ADDED,
            MediaStore.Audio.Media.DATE_MODIFIED
        )

        val sortOrder = "${MediaStore.Audio.Media.DATE_MODIFIED} DESC"

        return try {
            cr.query(uri, projection, null, null, sortOrder)?.use { cursor ->
                val dataCol = cursor.getColumnIndex(MediaStore.Audio.Media.DATA)
                val nameCol = cursor.getColumnIndex(MediaStore.Audio.Media.DISPLAY_NAME)
                val sizeCol = cursor.getColumnIndex(MediaStore.Audio.Media.SIZE)
                val dateModCol = cursor.getColumnIndex(MediaStore.Audio.Media.DATE_MODIFIED)
                val dateAddCol = cursor.getColumnIndex(MediaStore.Audio.Media.DATE_ADDED)

                var bestCandidate: File? = null
                var count = 0

                while (cursor.moveToNext() && count < 25) {
                    count++
                    val path = if (dataCol != -1) cursor.getString(dataCol) ?: "" else ""
                    val name = if (nameCol != -1) cursor.getString(nameCol) ?: "" else ""
                    val size = if (sizeCol != -1) cursor.getLong(sizeCol) else 0L
                    val dateMod = if (dateModCol != -1) cursor.getLong(dateModCol) else 0L
                    val dateAdd = if (dateAddCol != -1) cursor.getLong(dateAddCol) else 0L

                    val effectiveTime = if (dateMod > 0) dateMod else dateAdd
                    if (size < MIN_VALID_AUDIO_BYTES) continue
                    if (effectiveTime > 0 && effectiveTime < minTimeSec) continue

                    val candidate = if (path.isNotBlank()) File(path) else null
                    if (candidate == null || !candidate.exists()) continue

                    val lowerName = name.lowercase()
                    val lowerPath = path.lowercase()

                    // Match 1: Filename or path contains the customer's 10 phone digits
                    if (cleanDigits.length >= 7 && (lowerName.contains(cleanDigits) || lowerPath.contains(cleanDigits))) {
                        Log.d(TAG, "MediaStore EXACT phone match: $name")
                        return candidate
                    }

                    // Match 2: Contains call keywords and is in a call recording directory
                    val isCallRecFolder = lowerPath.contains("/call") ||
                            lowerPath.contains("/record") ||
                            lowerPath.contains("phone") ||
                            lowerPath.contains("sound_recorder")

                    val isCallRecName = lowerName.contains("call") ||
                            lowerName.contains("rec") ||
                            lowerName.contains("voice")

                    if (isCallRecFolder && isCallRecName && bestCandidate == null) {
                        bestCandidate = candidate
                    }
                }
                bestCandidate
            }
        } catch (e: Throwable) {
            Log.w(TAG, "MediaStore query exception: ${e.message}")
            null
        }
    }

    private fun scanOemDirectories(
        cleanDigits: String,
        callStartTime: Long,
        callEndTime: Long
    ): File? {
        val baseExternal = Environment.getExternalStorageDirectory() ?: return null

        val candidateDirs = listOf(
            // Samsung
            File(baseExternal, "Recordings/Call"),
            File(baseExternal, "Recordings"),
            File(baseExternal, "Voice Recorder"),
            // Xiaomi / Redmi / POCO (MIUI / HyperOS)
            File(baseExternal, "MIUI/sound_recorder/call_rec"),
            File(baseExternal, "Recordings/call_rec"),
            File(baseExternal, "sound_recorder/call_rec"),
            // Vivo / iQOO
            File(baseExternal, "Record/Call"),
            File(baseExternal, "Record"),
            // OnePlus / Oppo / Realme (ColorOS / OxygenOS)
            File(baseExternal, "Recordings/Call Recordings"),
            File(baseExternal, "Record/PhoneRecord"),
            File(baseExternal, "Music/Recordings"),
            // Standard Android / Pixel / Moto
            File(baseExternal, "Recordings"),
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_RECORDINGS),
            Environment.getExternalStoragePublicDirectory(Environment.DIRECTORY_MUSIC)
        ).distinct()

        val minTime = callStartTime - 180_000L // last 3 minutes

        var bestRecentFile: File? = null
        var newestModifiedTime = 0L

        for (dir in candidateDirs) {
            if (!dir.exists() || !dir.isDirectory) continue

            val files = dir.listFiles() ?: continue
            for (file in files) {
                if (!file.isFile) continue
                val ext = file.extension.lowercase()
                if (ext !in listOf("m4a", "mp3", "amr", "aac", "wav", "3gp", "ogg")) continue

                val size = file.length()
                if (size < MIN_VALID_AUDIO_BYTES) continue

                val modTime = file.lastModified()
                if (modTime < minTime) continue

                val name = file.name.lowercase()

                // Check 1: Filename contains customer's 10 digits
                if (cleanDigits.length >= 7 && name.contains(cleanDigits)) {
                    Log.d(TAG, "OEM Folder EXACT phone match in ${dir.path}: ${file.name}")
                    return file
                }

                // Check 2: Keep track of newest file in a known call folder
                if (modTime > newestModifiedTime) {
                    newestModifiedTime = modTime
                    bestRecentFile = file
                }
            }
        }

        return bestRecentFile
    }

    private fun copyToCache(context: Context, sourceFile: File, phoneTag: String): File {
        return try {
            val cacheDir = File(context.cacheDir, "recordings_sync").also { it.mkdirs() }
            val ext = sourceFile.extension.ifBlank { "m4a" }
            val destFile = File(cacheDir, "rec_native_${phoneTag}_${System.currentTimeMillis()}.$ext")

            sourceFile.inputStream().use { input ->
                destFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }
            Log.d(TAG, "Copied native file to cache: ${destFile.absolutePath} (${destFile.length()} bytes)")
            destFile
        } catch (e: Throwable) {
            Log.e(TAG, "Error copying native recording to cache: ${e.message}")
            sourceFile
        }
    }
}
