package `in`.cashall.agent

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log

/**
 * 100% In-House Hardware Alarm Buzzer & High-Intensity Haptic Vibration Engine.
 * Utilizes STREAM_ALARM / AudioAttributes.USAGE_ALARM to ensure the alarm sounds
 * at maximum volume even if the phone is on Silent/Do-Not-Disturb mode.
 */
object AlarmSoundManager {
    private const val TAG = "AlarmSoundManager"
    private var mediaPlayer: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private var isAlarmPlaying = false

    // Vibration pattern: wait 0ms, vibrate 800ms, pause 300ms, vibrate 800ms, pause 300ms, vibrate 1000ms
    private val VIBRATION_PATTERN = longArrayOf(0, 800, 300, 800, 300, 1000)

    @Synchronized
    fun isAlarmActive(): Boolean = isAlarmPlaying

    @Synchronized
    fun startAlarm(context: Context) {
        if (isAlarmPlaying) {
            Log.d(TAG, "Alarm already active, skipping duplicate start.")
            return
        }
        isAlarmPlaying = true
        Log.i(TAG, "Starting loud lead buzzer and phone vibration...")

        // 1. Play loud alarm sound via USAGE_ALARM
        try {
            var alarmUri: Uri? = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            if (alarmUri == null) {
                alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)
            }
            if (alarmUri == null) {
                alarmUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            }

            mediaPlayer?.release()
            mediaPlayer = MediaPlayer().apply {
                setDataSource(context.applicationContext, alarmUri!!)
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
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing MediaPlayer for alarm: ${e.message}", e)
        }

        // 2. Continuous high-intensity haptic vibration
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
        if (!isAlarmPlaying) return
        Log.i(TAG, "Stopping loud lead buzzer and phone vibration.")
        isAlarmPlaying = false

        // Stop Audio
        try {
            mediaPlayer?.let { player ->
                if (player.isPlaying) {
                    player.stop()
                }
                player.release()
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

    fun triggerOneShotHaptic(context: Context) {
        try {
            val v = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager)?.defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                v?.vibrate(VibrationEffect.createOneShot(150, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                @Suppress("DEPRECATION")
                v?.vibrate(150)
            }
        } catch (e: Exception) {}
    }
}
