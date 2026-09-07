package `in`.cashall.agent

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.net.URLEncoder
import java.util.concurrent.TimeUnit

class AgentLeadMonitoringService : Service() {

    private val serviceJob = Job()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(8, TimeUnit.SECONDS)
        .readTimeout(8, TimeUnit.SECONDS)
        .build()

    companion object {
        private const val TAG = "AgentLeadService"
        const val NOTIF_ID_FOREGROUND = 2001
        const val NOTIF_ID_URGENT_ALARM = 2002

        fun start(context: Context) {
            try {
                val intent = Intent(context, AgentLeadMonitoringService::class.java)
                ContextCompat.startForegroundService(context, intent)
                Log.i(TAG, "Requested start of AgentLeadMonitoringService.")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start AgentLeadMonitoringService: ${e.message}", e)
            }
        }

        fun stop(context: Context) {
            try {
                val intent = Intent(context, AgentLeadMonitoringService::class.java)
                context.stopService(intent)
                Log.i(TAG, "Stopped AgentLeadMonitoringService.")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to stop AgentLeadMonitoringService: ${e.message}", e)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        Log.i(TAG, "AgentLeadMonitoringService onCreate")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        ensureForegroundNotification()
        startPollingLoop()
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        Log.i(TAG, "AgentLeadMonitoringService onDestroy")
        serviceJob.cancel()
        AlarmSoundManager.stopAlarm(this)
    }

    private fun ensureForegroundNotification() {
        try {
            val pendingIntent = PendingIntent.getActivity(
                this, 0,
                Intent(this, MainActivity::class.java),
                PendingIntent.FLAG_IMMUTABLE
            )

            val notification: Notification = NotificationCompat.Builder(this, CashAllApplication.CHANNEL_MONITOR_ID)
                .setContentTitle("CashALL Field Agent Active")
                .setContentText("24/7 Lead Dispatch Listening • Ready for Doorstep Pickups")
                .setSmallIcon(R.drawable.ic_bell)
                .setContentIntent(pendingIntent)
                .setOngoing(true)
                .setPriority(NotificationCompat.PRIORITY_LOW)
                .build()

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                startForeground(NOTIF_ID_FOREGROUND, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC)
            } else {
                startForeground(NOTIF_ID_FOREGROUND, notification)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error starting foreground notification: ${e.message}", e)
        }
    }

    private fun startPollingLoop() {
        serviceScope.launch {
            Log.i(TAG, "Background lead polling loop started.")

            while (isActive) {
                try {
                    val phone = AgentPreferenceManager.getAgentPhone(this@AgentLeadMonitoringService)
                    val name = AgentPreferenceManager.getAgentName(this@AgentLeadMonitoringService)

                    if (!phone.isNullOrBlank()) {
                        pollAgentLeads(phone, name)
                    } else {
                        Log.d(TAG, "No agent logged in yet, waiting...")
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Error in poll loop: ${e.message}")
                }

                // Poll every 6 seconds for instantaneous lead dispatch
                delay(6000)
            }
        }
    }

    private fun pollAgentLeads(phone: String, name: String?) {
        try {
            val encodedPhone = URLEncoder.encode(phone, "UTF-8")
            val encodedName = if (!name.isNullOrBlank()) URLEncoder.encode(name, "UTF-8") else ""
            val url = "https://cashall.in/api/v1/agent/orders?phone=$encodedPhone&name=$encodedName&t=${System.currentTimeMillis()}"

            val request = Request.Builder()
                .url(url)
                .addHeader("Cache-Control", "no-cache")
                .get()
                .build()

            httpClient.newCall(request).execute().use { response ->
                if (!response.isSuccessful) {
                    Log.w(TAG, "Orders API returned code: ${response.code}")
                    return
                }

                val bodyStr = response.body?.string() ?: return
                val json = JSONObject(bodyStr)
                val ordersArray = json.optJSONArray("orders") ?: return

                val knownIds = AgentPreferenceManager.getKnownOrderIds(this)
                val currentIds = mutableSetOf<String>()
                val newlyAssignedOrders = mutableListOf<JSONObject>()

                val isFirstSync = !AgentPreferenceManager.isInitialSyncDone(this)

                for (i in 0 until ordersArray.length()) {
                    val ord = ordersArray.getJSONObject(i)
                    val id = ord.optString("id")
                    val orderNumber = ord.optString("orderNumber")
                    val status = ord.optString("status", "").uppercase()
                    val key = if (orderNumber.isNotBlank()) orderNumber else id

                    if (key.isNotBlank()) {
                        currentIds.add(key)

                        // Check if order is active and newly assigned
                        val isAssigned = status == "PARTNER_ASSIGNED" || status == "ASSIGNED" || status == "PICKUP_SCHEDULED"
                        if (!isFirstSync && isAssigned && !knownIds.contains(key)) {
                            newlyAssignedOrders.add(ord)
                        }
                    }
                }

                if (isFirstSync) {
                    Log.i(TAG, "Initial sync complete. Cached ${currentIds.size} existing orders.")
                    AgentPreferenceManager.saveKnownOrderIds(this, currentIds)
                    AgentPreferenceManager.setInitialSyncDone(this, true)
                } else if (newlyAssignedOrders.isNotEmpty()) {
                    Log.i(TAG, "🚨 NEW LEADS DETECTED: ${newlyAssignedOrders.size} new lead(s) assigned!")
                    // Trigger loud siren and vibration
                    for (newOrd in newlyAssignedOrders) {
                        triggerLeadAlarmAndNotification(newOrd)
                    }

                    // Update known IDs
                    val updatedKnown = knownIds.toMutableSet().apply { addAll(currentIds) }
                    AgentPreferenceManager.saveKnownOrderIds(this, updatedKnown)
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to poll agent leads: ${e.message}")
        }
    }

    private fun triggerLeadAlarmAndNotification(ord: JSONObject) {
        val orderNumber = ord.optString("orderNumber", "NEW")
        val customerName = ord.optString("customerName", "Customer")
        val deviceName = ord.optString("deviceName", "Mobile Device")
        val pickupDate = ord.optString("pickupDate", "Today")
        val pickupSlot = ord.optString("pickupTimeSlot", "")
        val quotedPrice = ord.optDouble("quotedPrice", ord.optDouble("estimatedPrice", 0.0)).toInt()

        Log.i(TAG, "TRIGGERING URGENT ALARM FOR ORDER #$orderNumber: $deviceName for $customerName")

        // 1. Start continuous loud alarm buzzer and phone vibration
        AlarmSoundManager.startAlarm(this)

        // 2. Wake screen
        try {
            val powerManager = getSystemService(Context.POWER_SERVICE) as? PowerManager
            val wakeLock = powerManager?.newWakeLock(
                PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
                "cashall:lead_alarm_wake"
            )
            wakeLock?.acquire(20000)
        } catch (e: Exception) {
            Log.w(TAG, "WakeLock error: ${e.message}")
        }

        // 3. Show Heads-Up Urgent Notification with FullScreenIntent
        try {
            val openAppIntent = PendingIntent.getActivity(
                this,
                orderNumber.hashCode(),
                Intent(this, MainActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
                    putExtra("orderNumber", orderNumber)
                },
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            val silenceIntent = PendingIntent.getBroadcast(
                this,
                orderNumber.hashCode() + 1,
                Intent(this, AlarmActionReceiver::class.java).apply {
                    action = AlarmActionReceiver.ACTION_SILENCE_ALARM
                },
                PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
            )

            val alarmSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)

            val notif = NotificationCompat.Builder(this, CashAllApplication.CHANNEL_URGENT_ALARM_ID)
                .setContentTitle("🚨 NEW LEAD ASSIGNED! Order #$orderNumber")
                .setContentText("$deviceName • ₹$quotedPrice • $customerName ($pickupDate $pickupSlot)")
                .setStyle(NotificationCompat.BigTextStyle().bigText(
                    "Doorstep Pickup Assigned:\n• Device: $deviceName\n• Value: ₹$quotedPrice\n• Customer: $customerName\n• Slot: $pickupDate ($pickupSlot)"
                ))
                .setSmallIcon(R.drawable.ic_bell)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setCategory(NotificationCompat.CATEGORY_ALARM)
                .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
                .setContentIntent(openAppIntent)
                .setFullScreenIntent(openAppIntent, true)
                .setAutoCancel(true)
                .setOngoing(true)
                .setSound(alarmSoundUri)
                .setVibrate(longArrayOf(0, 800, 300, 800, 300, 1000))
                .addAction(R.drawable.ic_bell, "Silence Alarm", silenceIntent)
                .addAction(R.drawable.ic_bell, "Open Lead", openAppIntent)
                .build()

            val notifManager = getSystemService(Context.NOTIFICATION_SERVICE) as? android.app.NotificationManager
            notifManager?.notify(NOTIF_ID_URGENT_ALARM, notif)
        } catch (e: Exception) {
            Log.e(TAG, "Error dispatching urgent lead notification: ${e.message}", e)
        }
    }
}
