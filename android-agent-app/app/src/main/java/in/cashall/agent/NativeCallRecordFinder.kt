package `in`.cashall.agent

import android.content.ContentUris
import android.content.Context
import android.net.Uri
import android.os.Build
import android.os.Environment
import android.provider.MediaStore
import android.util.Log
import kotlinx.coroutines.delay
import java.io.File

/**
 * Smart Native Call Recording Detector for CashALL Android Field Agent App.
 *
 * Compatible with Android 10, 11, 12, 13, 14, 15 (Scoped Storage compliant).
 * Uses MediaStore ContentResolver ContentUris to stream audio directly into the app sandbox,
 * bypassing filesystem path restrictions that fail on Vivo, Xiaomi, Oppo, and OnePlus.
 *
 * Scans both Android MediaStore and native OEM directories across multiple polling intervals.
 * Ensures only real, non-blank audio files (>= 5KB) are uploaded.
 */
object NativeCallRecordFinder {
    private const val TAG = "NativeRecordFinder"
    private const val MIN_VALID_AUDIO_BYTES = 5000L // 5 KB minimum to prevent blank/dummy files

    /**
     * Polls the device storage across multiple intervals after a call disconnects,
     * allowing the system dialer to flush, encode, and index the audio file.
     *
     * @param context App context
     * @param rawCustomerPhone The phone number dialed / received
     * @param customerName Optional customer name (for contacts saved in phone dialer)
     * @param callStartTime Time in ms when the call started
     * @param callEndTime Time in ms when the call ended
     * @return A verified, copied non-empty audio File ready for upload, or null if not found.
     */
    suspend fun findRecentRecording(
        context: Context,
        rawCustomerPhone: String,
        customerName: String = "",
        callStartTime: Long,
        callEndTime: Long
    ): File? {
        val cleanDigits = rawCustomerPhone.replace(Regex("[^0-9]"), "").takeLast(10)
        Log.i(TAG, "🔍 Starting native recording scan for phone='$rawCustomerPhone' (digits='$cleanDigits', customer='$customerName')")

        // Polling delays: OEM dialers (especially Vivo / Samsung) take between 1.0s and 3.0s to finish writing
        val pollDelays = listOf(1500L, 2000L, 2500L, 3000L)

        for ((index, waitTime) in pollDelays.withIndex()) {
            delay(waitTime)
            Log.d(TAG, "Attempt ${index + 1}/${pollDelays.size}: searching MediaStore & OEM directories...")

            // 1. Try MediaStore API via ContentResolver (Works 100% on Android 11, 12, 13, 14, 15 without raw path limits)
            val mediaStoreFile = queryMediaStore(context, cleanDigits, customerName, callStartTime, callEndTime)
            if (mediaStoreFile != null && isValidAudio(mediaStoreFile)) {
                Log.i(TAG, "🎯 Found native recording via MediaStore ContentUri: ${mediaStoreFile.name} (${mediaStoreFile.length()} bytes)")
                return mediaStoreFile
            }

            // 2. Try Direct OEM Filesystem Scan (Samsung, Xiaomi/MIUI, Vivo, OnePlus, Oppo, Realme)
            val directFile = scanOemDirectories(cleanDigits, customerName, callStartTime, callEndTime)
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
        customerName: String,
        callStartTime: Long,
        callEndTime: Long
    ): File? {
        val cr = context.contentResolver ?: return null
        val uri: Uri = MediaStore.Audio.Media.EXTERNAL_CONTENT_URI

        // Time window: audio added/modified from 3 minutes before call start until now
        val minTimeSec = (callStartTime - 180_000L) / 1000L

        val projection = mutableListOf(
            MediaStore.Audio.Media._ID,
            MediaStore.Audio.Media.DISPLAY_NAME,
            MediaStore.Audio.Media.SIZE,
            MediaStore.Audio.Media.DATE_ADDED,
            MediaStore.Audio.Media.DATE_MODIFIED
        ).apply {
            @Suppress("DEPRECATION")
            add(MediaStore.Audio.Media.DATA)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                add(MediaStore.Audio.Media.RELATIVE_PATH)
            }
        }.toTypedArray()

        val sortOrder = "${MediaStore.Audio.Media.DATE_MODIFIED} DESC"

        return try {
            cr.query(uri, projection, null, null, sortOrder)?.use { cursor ->
                val idCol = cursor.getColumnIndex(MediaStore.Audio.Media._ID)
                val dataCol = cursor.getColumnIndex(MediaStore.Audio.Media.DATA)
                val nameCol = cursor.getColumnIndex(MediaStore.Audio.Media.DISPLAY_NAME)
                val sizeCol = cursor.getColumnIndex(MediaStore.Audio.Media.SIZE)
                val dateModCol = cursor.getColumnIndex(MediaStore.Audio.Media.DATE_MODIFIED)
                val dateAddCol = cursor.getColumnIndex(MediaStore.Audio.Media.DATE_ADDED)
                val relPathCol = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                    cursor.getColumnIndex(MediaStore.Audio.Media.RELATIVE_PATH)
                } else -1

                // Extract customer name keywords
                val nameKeywords = customerName.lowercase()
                    .split(" ", "_", "-")
                    .filter { it.length >= 3 && it !in listOf("lead", "customer", "unknown", "mobile") }

                var bestCandidateUri: Uri? = null
                var bestCandidateName: String = ""
                var nameCandidateUri: Uri? = null
                var nameCandidateName: String = ""
                var count = 0

                while (cursor.moveToNext() && count < 35) {
                    count++
                    val id = if (idCol != -1) cursor.getLong(idCol) else -1L
                    if (id == -1L) continue

                    val path = if (dataCol != -1) cursor.getString(dataCol) ?: "" else ""
                    val name = if (nameCol != -1) cursor.getString(nameCol) ?: "" else ""
                    val relPath = if (relPathCol != -1) cursor.getString(relPathCol) ?: "" else ""
                    val size = if (sizeCol != -1) cursor.getLong(sizeCol) else 0L
                    val dateMod = if (dateModCol != -1) cursor.getLong(dateModCol) else 0L
                    val dateAdd = if (dateAddCol != -1) cursor.getLong(dateAddCol) else 0L

                    val effectiveTime = if (dateMod > 0) dateMod else dateAdd
                    if (size < MIN_VALID_AUDIO_BYTES) continue
                    if (effectiveTime > 0 && effectiveTime < minTimeSec) continue

                    val contentUri = ContentUris.withAppendedId(MediaStore.Audio.Media.EXTERNAL_CONTENT_URI, id)
                    val lowerName = name.lowercase()
                    val lowerPath = (path + " " + relPath).lowercase()

                    // Extract all continuous digits from filename and path
                    val nameDigits = name.replace(Regex("[^0-9]"), "")
                    val pathDigits = path.replace(Regex("[^0-9]"), "")

                    // Check 1: Filename or path contains the customer's 10 phone digits
                    val phoneMatches = cleanDigits.length >= 7 && (
                        lowerName.contains(cleanDigits) ||
                        lowerPath.contains(cleanDigits) ||
                        nameDigits.contains(cleanDigits) ||
                        pathDigits.contains(cleanDigits)
                    )

                    if (phoneMatches) {
                        Log.i(TAG, "🎯 MediaStore EXACT phone match: '$name' (id=$id, size=$size bytes)")
                        val cachedFile = copyUriToCache(context, contentUri, name, cleanDigits)
                        if (cachedFile != null) return cachedFile
                    }

                    // Check 2: Filename matches customer name saved in phonebook
                    val custNameMatches = nameKeywords.any { kw ->
                        lowerName.contains(kw) || lowerPath.contains(kw)
                    }

                    if (custNameMatches && nameCandidateUri == null) {
                        Log.d(TAG, "Candidate matches customer keyword: $name")
                        nameCandidateUri = contentUri
                        nameCandidateName = name
                    }

                    // Check 3: Check if it's in a known call recorder directory
                    val isCallRecFolder = lowerPath.contains("/call") ||
                            lowerPath.contains("record/call") ||
                            lowerPath.contains("phonerecord") ||
                            lowerPath.contains("/record") ||
                            lowerPath.contains("sound_recorder") ||
                            lowerPath.contains("sounds/call") ||
                            lowerPath.contains("recordings")

                    val isCallRecName = lowerName.contains("call") ||
                            lowerName.contains("rec") ||
                            lowerName.contains("voice") ||
                            lowerName.contains("phone")

                }

                // If customer contact name matched
                if (nameCandidateUri != null) {
                    val cached = copyUriToCache(context, nameCandidateUri, nameCandidateName, cleanDigits)
                    if (cached != null) return cached
                }

                null
            }
        } catch (e: Throwable) {
            Log.w(TAG, "MediaStore query exception: ${e.message}")
            null
        }
    }

    private fun scanOemDirectories(
        cleanDigits: String,
        customerName: String,
        callStartTime: Long,
        callEndTime: Long
    ): File? {
        val baseExternal = Environment.getExternalStorageDirectory() ?: return null

        val candidateDirs = listOf(
            // Vivo / iQOO (Funtouch OS / OriginOS)
            File(baseExternal, "Record/Call"),
            File(baseExternal, "Record/PhoneRecord"),
            File(baseExternal, "Sounds/Call"),
            File(baseExternal, "Record"),
            File(baseExternal, "vivo/record"),
            // Samsung (One UI)
            File(baseExternal, "Recordings/Call"),
            File(baseExternal, "Recordings"),
            File(baseExternal, "Voice Recorder"),
            // Xiaomi / Redmi / POCO (MIUI / HyperOS)
            File(baseExternal, "MIUI/sound_recorder/call_rec"),
            File(baseExternal, "Recordings/call_rec"),
            File(baseExternal, "sound_recorder/call_rec"),
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

        val nameKeywords = customerName.lowercase()
            .split(" ", "_", "-")
            .filter { it.length >= 3 && it !in listOf("lead", "customer", "unknown", "mobile") }

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
                val nameDigits = name.replace(Regex("[^0-9]"), "")

                // Check 1: Filename contains customer's 10 digits
                if (cleanDigits.length >= 7 && (name.contains(cleanDigits) || nameDigits.contains(cleanDigits))) {
                    Log.i(TAG, "OEM Folder EXACT phone match in ${dir.path}: ${file.name}")
                    return file
                }

                // Check 2: Filename contains customer name
                if (nameKeywords.any { name.contains(it) }) {
                    Log.i(TAG, "OEM Folder name match in ${dir.path}: ${file.name}")
                    return file
                }
            }
        }

        return null
    }

    /**
     * Streams an audio item directly from MediaStore ContentUri into the app cache directory.
     * This bypasses Android Scoped Storage filesystem restrictions completely.
     */
    private fun copyUriToCache(context: Context, uri: Uri, originalName: String, phoneTag: String): File? {
        return try {
            val cacheDir = File(context.cacheDir, "recordings_sync").also { it.mkdirs() }
            val ext = originalName.substringAfterLast(".", "m4a").lowercase()
            val safeExt = if (ext in listOf("m4a", "mp3", "amr", "aac", "wav", "3gp", "ogg")) ext else "m4a"
            val destFile = File(cacheDir, "rec_native_${phoneTag}_${System.currentTimeMillis()}.$safeExt")

            context.contentResolver.openInputStream(uri)?.use { input ->
                destFile.outputStream().use { output ->
                    input.copyTo(output)
                }
            }

            if (destFile.exists() && destFile.length() >= MIN_VALID_AUDIO_BYTES) {
                Log.i(TAG, "✅ Successfully copied ContentUri audio to cache: ${destFile.name} (${destFile.length()} bytes)")
                destFile
            } else {
                destFile.delete()
                null
            }
        } catch (e: Throwable) {
            Log.w(TAG, "Failed copying ContentUri audio stream $uri: ${e.message}")
            null
        }
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
