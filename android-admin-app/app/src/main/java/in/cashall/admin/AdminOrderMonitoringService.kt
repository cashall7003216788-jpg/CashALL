package `in`.cashall.admin

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.net.Uri
import android.os.Build
import android.os.IBinder
import android.util.Log
import androidx.core.app.NotificationCompat
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import okhttp3.OkHttpClient
import okhttp3.Request
import org.json.JSONObject
import java.util.concurrent.TimeUnit

class AdminOrderMonitoringService : Service() {

    companion object {
        private const val TAG = "AdminOrderService"
        private const val FOREGROUND_NOTIF_ID = 9001
        private const val REAL_ORDER_NOTIF_ID = 9002
        private const val POLL_INTERVAL_MS = 5000L
        private const val BASE_URL = "https://cashall.in/api/v1/admin/orders/latest-check"
    }

    private val serviceScope = CoroutineScope(Dispatchers.IO + SupervisorJob())
    private lateinit var prefs: SharedPreferences

    private val okHttpClient = OkHttpClient.Builder()
        .connectTimeout(10, TimeUnit.SECONDS)
        .readTimeout(10, TimeUnit.SECONDS)
        .build()

    override fun onCreate() {
        super.onCreate()
        prefs = getSharedPreferences("cashall_admin_prefs", Context.MODE_PRIVATE)
        startForeground(FOREGROUND_NOTIF_ID, createForegroundNotification())
        startOrderPollingLoop()
        Log.i(TAG, "AdminOrderMonitoringService initialized and running 24/7.")
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        Log.i(TAG, "AdminOrderMonitoringService stopped.")
    }

    private fun createForegroundNotification(): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CashAllAdminApplication.CHANNEL_SERVICE)
            .setContentTitle("CashALL Admin Active")
            .setContentText("Monitoring live customer orders 24/7 with 10s buzzer")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .build()
    }

    private fun startOrderPollingLoop() {
        serviceScope.launch {
            while (isActive) {
                try {
                    pollLatestOrder()
                } catch (e: Exception) {
                    Log.w(TAG, "Order check error: ${e.message}")
                }
                delay(POLL_INTERVAL_MS)
            }
        }
    }

    private fun pollLatestOrder() {
        val request = Request.Builder()
            .url(BASE_URL)
            .get()
            .header("Accept", "application/json")
            .build()

        okHttpClient.newCall(request).execute().use { response ->
            if (!response.isSuccessful) return
            val body = response.body?.string() ?: return
            val json = JSONObject(body)
            if (!json.optBoolean("success", false)) return
            val order = json.optJSONObject("order") ?: return

            val orderId = order.optString("id", "")
            if (orderId.isBlank()) return

            val lastAlertedId = prefs.getString("last_alerted_order_id", "")
            if (lastAlertedId.isNullOrEmpty()) {
                // First initialization run: record current newest order so we don't alert on historical orders
                prefs.edit().putString("last_alerted_order_id", orderId).apply()
                return
            }

            if (orderId != lastAlertedId) {
                // Brand new order detected!
                prefs.edit().putString("last_alerted_order_id", orderId).apply()

                val orderNumber = order.optString("orderNumber", "CA-NEW")
                val isRealOrder = order.optBoolean("isRealOrder", false)
                val customerName = order.optString("customerName", "Customer")
                val deviceName = order.optString("deviceName", "Mobile Device")
                val quotedPrice = order.optDouble("quotedPrice", 0.0).toLong()
                val location = order.optString("location", "")

                Log.i(TAG, "New Order detected: #$orderNumber, isRealOrder=$isRealOrder")

                if (isRealOrder) {
                    // Actual real customer order -> trigger 10s loud siren and heads-up alert
                    AlarmSoundManager.startAlarm(this@AdminOrderMonitoringService)
                    showRealOrderAlertNotification(orderNumber, customerName, deviceName, quotedPrice, location)
                } else {
                    // Test / Demo order -> Silent notification without siren
                    showTestOrderNotification(orderNumber, customerName, deviceName)
                }
            }
        }
    }

    private fun showRealOrderAlertNotification(
        orderNumber: String,
        customerName: String,
        deviceName: String,
        quotedPrice: Long,
        location: String
    ) {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("order_number", orderNumber)
        }
        val pendingOpen = PendingIntent.getActivity(
            this,
            101,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val silenceIntent = Intent(this, AlarmActionReceiver::class.java).apply {
            action = AlarmActionReceiver.ACTION_SILENCE_ALARM
        }
        val pendingSilence = PendingIntent.getBroadcast(
            this,
            102,
            silenceIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(this, CashAllAdminApplication.CHANNEL_ALARM)
            .setContentTitle("🚨 NEW REAL ORDER: #$orderNumber")
            .setContentText("$customerName • $deviceName • ₹$quotedPrice")
            .setStyle(NotificationCompat.BigTextStyle().bigText(
                "Customer: $customerName\nDevice: $deviceName\nPayout: ₹$quotedPrice\nPickup: $location"
            ))
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setAutoCancel(true)
            .setContentIntent(pendingOpen)
            .addAction(0, "Silence Alarm", pendingSilence)

        if (location.isNotBlank()) {
            val navIntent = Intent(Intent.ACTION_VIEW, Uri.parse("google.navigation:q=" + Uri.encode(location))).apply {
                setPackage("com.google.android.apps.maps")
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            val pendingNav = PendingIntent.getActivity(
                this,
                103,
                navIntent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            builder.addAction(0, "📍 Navigate", pendingNav)
        }

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
        notificationManager.notify(REAL_ORDER_NOTIF_ID, builder.build())
    }

    private fun showTestOrderNotification(
        orderNumber: String,
        customerName: String,
        deviceName: String
    ) {
        val launchIntent = Intent(this, MainActivity::class.java)
        val pendingOpen = PendingIntent.getActivity(
            this,
            201,
            launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(this, CashAllAdminApplication.CHANNEL_INFO)
            .setContentTitle("[TEST ORDER] #$orderNumber")
            .setContentText("$customerName • $deviceName (Ignored by siren)")
            .setSmallIcon(R.mipmap.ic_launcher)
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .setContentIntent(pendingOpen)
            .build()

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as android.app.NotificationManager
        notificationManager.notify(orderNumber.hashCode(), notification)
    }
}
