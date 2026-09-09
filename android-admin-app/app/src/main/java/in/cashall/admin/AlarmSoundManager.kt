package `in`.cashall.admin

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log

/**
 * 100% In-House Hardware Alarm Siren & Haptic Vibration Engine for CashALL Admin.
 * Rings for STRICTLY 10.0 SECONDS on new real customer orders, then automatically cuts off.
 */
object AlarmSoundManager {
    private const val TAG = "AlarmSoundManager"
    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private var isAlarmPlaying = false

    // Vibration pattern: wait 0ms, vibrate 700ms, pause 250ms, vibrate 700ms, pause 250ms, vibrate 1000ms
    private val VIBRATION_PATTERN = longArrayOf(0, 700, 250, 700, 250, 1000)
    private var autoSilenceHandler: Handler? = null

    // Exact 10-second alarm duration
    private const val ALARM_DURATION_MS = 10_000L

    @Synchronized
    fun isAlarmActive(): Boolean = isAlarmPlaying

    @Synchronized
    fun startAlarm(context: Context) {
        if (isAlarmPlaying) {
            Log.d(TAG, "Alarm already active, skipping duplicate start.")
            return
        }
        isAlarmPlaying = true
        Log.i(TAG, "🚨 Starting loud real-order alarm (STRICT 10.0s auto-silence active)...")

        // Strict 10-second auto-silence timer: stops ringing exactly after 10.0s
        autoSilenceHandler?.removeCallbacksAndMessages(null)
        autoSilenceHandler = Handler(Looper.getMainLooper()).apply {
            postDelayed({
                if (isAlarmPlaying) {
                    Log.i(TAG, "⏰ Auto-silencing real-order alarm after exactly 10s.")
                    stopAlarm(context)
                }
            }, ALARM_DURATION_MS)
        }

        // 1. Play high-decibel emergency siren (R.raw.loud_buzzer) via USAGE_ALARM
        try {
            val audioManager = context.getSystemService(Context.AUDIO_SERVICE) as? AudioManager
            audioManager?.let { am ->
                val maxVol = am.getStreamMaxVolume(AudioManager.STREAM_ALARM)
                am.setStreamVolume(AudioManager.STREAM_ALARM, maxVol, 0)
            }

            mediaPlayer?.release()
            val afd = context.resources.openRawResourceFd(R.raw.loud_buzzer)
            mediaPlayer = MediaPlayer().apply {
                setDataSource(afd.fileDescriptor, afd.startOffset, afd.length)
                afd.close()
                setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_ALARM)
                        .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                        .setFlags(AudioAttributes.FLAG_AUDIBILITY_ENFORCED)
                        .build()
                )
                isLooping = true
                prepare()
                start()
            }
            Log.i(TAG, "Siren playing at full ALARM stream volume.")
        } catch (e: Exception) {
            Log.e(TAG, "Error starting MediaPlayer: ${e.message}", e)
        }

        // 2. Hardware vibration
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibrator = vibratorManager?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }

            vibrator?.let { v ->
                if (v.hasVibrator()) {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                        val effect = VibrationEffect.createWaveform(VIBRATION_PATTERN, 0)
                        v.vibrate(effect)
                    } else {
                        @Suppress("DEPRECATION")
                        v.vibrate(VIBRATION_PATTERN, 0)
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error triggering vibrator: ${e.message}", e)
        }
    }

    @Synchronized
    fun stopAlarm(context: Context? = null) {
        Log.i(TAG, "Stopping alarm sound and vibration.")
        isAlarmPlaying = false

        autoSilenceHandler?.removeCallbacksAndMessages(null)
        autoSilenceHandler = null

        // Stop Audio
        try {
            mediaPlayer?.let { player ->
                try {
                    if (player.isPlaying) {
                        player.stop()
                    }
                } catch (ignored: Exception) {}
                try {
                    player.reset()
                } catch (ignored: Exception) {}
                try {
                    player.release()
                } catch (ignored: Exception) {}
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error releasing MediaPlayer: ${e.message}")
        } finally {
            mediaPlayer = null
        }

        // Stop Vibration
        try {
            vibrator?.cancel()
            context?.let { ctx ->
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                    val vm = ctx.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                    vm?.defaultVibrator?.cancel()
                } else {
                    @Suppress("DEPRECATION")
                    val v = ctx.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                    v?.cancel()
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Error cancelling vibrator: ${e.message}")
        }
    }
}
