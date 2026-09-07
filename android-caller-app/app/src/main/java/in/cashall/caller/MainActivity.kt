package `in`.cashall.caller

import android.Manifest
import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.view.View
import android.webkit.*
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import `in`.cashall.caller.databinding.ActivityMainBinding
import `in`.cashall.caller.service.CallMonitoringService
import `in`.cashall.caller.service.CallRecorderAccessibilityService
import `in`.cashall.caller.utils.PreferenceManager

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var prefs: PreferenceManager
    private var isMonitoringServiceStarted = false

    private val requiredPermissions: Array<String>
        get() {
            val list = mutableListOf(
                Manifest.permission.READ_PHONE_STATE,
                Manifest.permission.READ_CALL_LOG,
                Manifest.permission.CALL_PHONE
            )
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                list.add(Manifest.permission.POST_NOTIFICATIONS)
                list.add(Manifest.permission.READ_MEDIA_AUDIO)
            } else {
                list.add(Manifest.permission.READ_EXTERNAL_STORAGE)
            }
            return list.toTypedArray()
        }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.all { it.value }
        if (allGranted) {
            checkSetupAndProceed()
        } else {
            Toast.makeText(
                this,
                "Phone, Audio & Call Log permissions are required to record & sync calls",
                Toast.LENGTH_LONG
            ).show()
            updatePermissionUi()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = PreferenceManager(this)

        try {
            binding = ActivityMainBinding.inflate(layoutInflater)
            setContentView(binding.root)
        } catch (t: Throwable) {
            Log.e(TAG, "Error inflating layout: ${t.message}", t)
            finish()
            return
        }

        setupListeners()
        setupWebView()
    }

    override fun onResume() {
        super.onResume()
        if (::binding.isInitialized) {
            checkSetupAndProceed()
            if (prefs.lastTargetQuoteId.isNotBlank()) {
                val qId = prefs.lastTargetQuoteId
                val phone = prefs.lastTargetCustomerPhone
                binding.webView.postDelayed({
                    binding.webView.evaluateJavascript(
                        "if (typeof window.__cashall_onCallFinished === 'function') { window.__cashall_onCallFinished('$qId', '$phone'); }",
                        null
                    )
                }, 600)
            }
        }
    }

    private fun setupListeners() {
        binding.btnGrantPermissions.setOnClickListener {
            permissionLauncher.launch(requiredPermissions)
        }

        binding.btnOpenDialerSettings.setOnClickListener {
            openDialerCallSettings()
        }

        binding.btnOpenAccessibility.setOnClickListener {
            try {
                val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                startActivity(intent)
                Toast.makeText(
                    this,
                    "Find 'CashALL Caller' in the list and switch it ON",
                    Toast.LENGTH_LONG
                ).show()
            } catch (t: Throwable) {
                Log.e(TAG, "Error opening accessibility settings: ${t.message}", t)
            }
        }

        binding.swipeRefresh.setOnRefreshListener {
            binding.webView.reload()
        }
    }

    fun openDialerCallSettings() {
        val intents = listOf(
            Intent("com.android.phone.settings.CallRecordSetting"),
            Intent(android.telecom.TelecomManager.ACTION_SHOW_CALL_SETTINGS),
            Intent(Intent.ACTION_DIAL)
        )
        for (intent in intents) {
            try {
                intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                startActivity(intent)
                Toast.makeText(
                    this,
                    "In Phone settings, tap 'Call recording' ➔ turn ON 'Auto-record calls'",
                    Toast.LENGTH_LONG
                ).show()
                return
            } catch (ignored: Throwable) {}
        }
        Toast.makeText(
            this,
            "Open your Phone dialer app ➔ Settings ➔ Call Recording ➔ Turn ON Auto-record calls",
            Toast.LENGTH_LONG
        ).show()
    }

    private fun hasRuntimePermissions(): Boolean {
        return requiredPermissions.all {
            ContextCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun isAccessibilityEnabled(): Boolean {
        try {
            if (CallRecorderAccessibilityService.isServiceRunning()) return true

            val expectedServiceName = "${packageName}/${CallRecorderAccessibilityService::class.java.canonicalName}"
            val enabledServices = Settings.Secure.getString(
                contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false

            return enabledServices.contains(packageName) || enabledServices.contains(expectedServiceName)
        } catch (t: Throwable) {
            Log.w(TAG, "Unable to query ENABLED_ACCESSIBILITY_SERVICES: ${t.message}")
            return CallRecorderAccessibilityService.isServiceRunning()
        }
    }

    private fun checkSetupAndProceed() {
        val runtimeOk = hasRuntimePermissions()

        if (runtimeOk) {
            // Recording is now handled by CallMonitoringService — no Accessibility required
            binding.permissionOverlay.visibility = View.GONE
            startCallMonitoringService()
            if (binding.webView.url == null) {
                binding.webView.loadUrl("https://cashall.in/support/dashboard")
            }
        } else {
            binding.permissionOverlay.visibility = View.VISIBLE
            updatePermissionUi()
        }
    }

    private fun updatePermissionUi() {
        val runtimeOk = hasRuntimePermissions()
        if (!runtimeOk) {
            binding.btnGrantPermissions.visibility = View.VISIBLE
            binding.btnOpenAccessibility.visibility = View.GONE
        } else {
            binding.btnGrantPermissions.visibility = View.GONE
            binding.btnOpenAccessibility.visibility = View.GONE
        }
    }

    private fun startCallMonitoringService() {
        if (isMonitoringServiceStarted) return
        try {
            val intent = Intent(this, CallMonitoringService::class.java)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(intent)
            } else {
                startService(intent)
            }
            isMonitoringServiceStarted = true
            Log.d(TAG, "CallMonitoringService started successfully")
        } catch (t: Throwable) {
            Log.e(TAG, "Failed to start CallMonitoringService: ${t.message}", t)
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        try {
            binding.webView.settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                allowFileAccess = true
                cacheMode = WebSettings.LOAD_DEFAULT
            }

            // Injected Javascript Bridge for web-to-native communication
            binding.webView.addJavascriptInterface(WebAppBridge(this, prefs), "CashAllNative")

            binding.webView.webViewClient = object : WebViewClient() {
                override fun onPageFinished(view: WebView?, url: String?) {
                    super.onPageFinished(view, url)
                    binding.progressBar.visibility = View.GONE
                    binding.swipeRefresh.isRefreshing = false

                    // Inject session sniffer with periodic polling to catch client-side logins
                    view?.evaluateJavascript(
                        """
                        (function() {
                            function sync() {
                                try {
                                    const sess = localStorage.getItem('cashall_support_session');
                                    if (sess && window.CashAllNative) {
                                        const parsed = JSON.parse(sess);
                                        const user = parsed.supportUser || {};
                                        if (user.name) {
                                            window.CashAllNative.setAgentInfo(user.name, user.phone || '');
                                        }
                                    }
                                } catch(e) {}
                            }
                            sync();
                            if (!window.__cashall_sync_active) {
                                window.__cashall_sync_active = true;
                                setInterval(sync, 1500);
                                window.addEventListener('storage', sync);
                            }
                        })();
                        """.trimIndent(),
                        null
                    )
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false

                    if (url.startsWith("tel:")) {
                        val phone = url.removePrefix("tel:").trim()
                        prefs.lastTargetCustomerPhone = phone
                        val dialIntent = Intent(Intent.ACTION_CALL, Uri.parse(url))
                        if (ContextCompat.checkSelfPermission(this@MainActivity, Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                            startActivity(dialIntent)
                        } else {
                            val viewIntent = Intent(Intent.ACTION_DIAL, Uri.parse(url))
                            startActivity(viewIntent)
                        }
                        return true
                    }
                    return false
                }
            }

            binding.webView.webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    if (newProgress < 100) {
                        binding.progressBar.visibility = View.VISIBLE
                        binding.progressBar.progress = newProgress
                    } else {
                        binding.progressBar.visibility = View.GONE
                    }
                }
            }
        } catch (t: Throwable) {
            Log.e(TAG, "Failed to initialize WebView: ${t.message}", t)
        }
    }

    @Deprecated("Deprecated in Java")
    override fun onBackPressed() {
        if (::binding.isInitialized && binding.webView.canGoBack()) {
            binding.webView.goBack()
        } else {
            @Suppress("DEPRECATION")
            super.onBackPressed()
        }
    }

    class WebAppBridge(private val context: Context, private val prefs: PreferenceManager) {
        @JavascriptInterface
        fun setAgentInfo(name: String, phone: String) {
            Log.i("WebAppBridge", "setAgentInfo called: name='$name', phone='$phone'")
            if (name.isNotBlank()) prefs.agentName = name
            if (phone.isNotBlank()) prefs.agentPhone = phone
        }

        @JavascriptInterface
        fun setTargetQuote(quoteId: String, customerPhone: String) {
            prefs.lastTargetQuoteId = quoteId
            if (customerPhone.isNotBlank()) prefs.lastTargetCustomerPhone = customerPhone
        }

        @JavascriptInterface
        fun setTargetQuote(quoteId: String, customerPhone: String, customerName: String, deviceName: String) {
            prefs.lastTargetQuoteId = quoteId
            if (customerPhone.isNotBlank()) prefs.lastTargetCustomerPhone = customerPhone
            if (customerName.isNotBlank()) prefs.lastTargetCustomerName = customerName
            if (deviceName.isNotBlank()) prefs.lastTargetDeviceName = deviceName
        }

        @JavascriptInterface
        fun setTargetQuote(quoteId: String, customerPhone: String, customerName: String, deviceName: String, agentName: String) {
            prefs.lastTargetQuoteId = quoteId
            if (customerPhone.isNotBlank()) prefs.lastTargetCustomerPhone = customerPhone
            if (customerName.isNotBlank()) prefs.lastTargetCustomerName = customerName
            if (deviceName.isNotBlank()) prefs.lastTargetDeviceName = deviceName
            if (agentName.isNotBlank()) {
                prefs.agentName = agentName
                Log.i("WebAppBridge", "Saved agentName from target quote: $agentName")
            }
        }
    }

    companion object {
        private const val TAG = "MainActivity"
    }
}
