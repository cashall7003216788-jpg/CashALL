package in.cashall.caller

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.view.View
import android.webkit.*
import android.widget.Toast
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import in.cashall.caller.databinding.ActivityMainBinding
import in.cashall.caller.service.CallMonitoringService
import in.cashall.caller.service.CallRecorderAccessibilityService
import in.cashall.caller.utils.PreferenceManager

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private lateinit var prefs: PreferenceManager

    private val requiredPermissions = arrayOf(
        Manifest.permission.READ_PHONE_STATE,
        Manifest.permission.READ_CALL_LOG,
        Manifest.permission.RECORD_AUDIO,
        Manifest.permission.CALL_PHONE
    )

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val allGranted = permissions.all { it.value }
        if (allGranted) {
            checkSetupAndProceed()
        } else {
            Toast.makeText(
                this,
                "Calling & Audio Permissions are required to start shifts",
                Toast.LENGTH_LONG
            ).show()
            updatePermissionUi()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        prefs = PreferenceManager(this)

        setupListeners()
        setupWebView()
    }

    override fun onResume() {
        super.onResume()
        checkSetupAndProceed()
    }

    private fun setupListeners() {
        binding.btnGrantPermissions.setOnClickListener {
            permissionLauncher.launch(requiredPermissions)
        }

        binding.btnOpenAccessibility.setOnClickListener {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(intent)
            Toast.makeText(
                this,
                "Find 'CashALL Caller' in the list and switch it ON",
                Toast.LENGTH_LONG
            ).show()
        }

        binding.swipeRefresh.setOnRefreshListener {
            binding.webView.reload()
        }
    }

    private fun hasRuntimePermissions(): Boolean {
        return requiredPermissions.all {
            ContextCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun isAccessibilityEnabled(): Boolean {
        // Quick check if service instance is active
        if (CallRecorderAccessibilityService.isServiceRunning()) return true

        val expectedServiceName = "${packageName}/${CallRecorderAccessibilityService::class.java.canonicalName}"
        val enabledServices = Settings.Secure.getString(
            contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false

        return enabledServices.contains(packageName) || enabledServices.contains(expectedServiceName)
    }

    private fun checkSetupAndProceed() {
        val runtimeOk = hasRuntimePermissions()
        val accessibilityOk = isAccessibilityEnabled()

        if (runtimeOk && accessibilityOk) {
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
        val accessibilityOk = isAccessibilityEnabled()

        if (!runtimeOk) {
            binding.btnGrantPermissions.visibility = View.VISIBLE
            binding.btnOpenAccessibility.visibility = View.GONE
        } else if (!accessibilityOk) {
            binding.btnGrantPermissions.visibility = View.GONE
            binding.btnOpenAccessibility.visibility = View.VISIBLE
        }
    }

    private fun startCallMonitoringService() {
        val intent = Intent(this, CallMonitoringService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            startForegroundService(intent)
        } else {
            startService(intent)
        }
    }

    private fun setupWebView() {
        val settings = binding.webView.settings
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        settings.allowFileAccess = true
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        // Injected Javascript Bridge for web-to-native communication
        binding.webView.addJavascriptInterface(WebAppBridge(this, prefs), "CashAllNative")

        binding.webView.webViewClient = object : WebViewClient() {
            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.progressBar.visibility = View.GONE
                binding.swipeRefresh.isRefreshing = false

                // Inject session sniffer to sync current support staff name & phone
                view?.evaluateJavascript(
                    """
                    (function() {
                        try {
                            const sess = localStorage.getItem('cashall_support_session');
                            if (sess) {
                                const parsed = JSON.parse(sess);
                                const user = parsed.supportUser || {};
                                if (window.CashAllNative) {
                                    window.CashAllNative.setAgentInfo(user.name || '', user.phone || '');
                                }
                            }
                        } catch(e) {}
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
    }

    override fun onBackPressed() {
        if (binding.webView.canGoBack()) {
            binding.webView.goBack()
        } else {
            super.onBackPressed()
        }
    }

    class WebAppBridge(private val context: Context, private val prefs: PreferenceManager) {
        @JavascriptInterface
        fun setAgentInfo(name: String, phone: String) {
            if (name.isNotBlank()) prefs.agentName = name
            if (phone.isNotBlank()) prefs.agentPhone = phone
        }

        @JavascriptInterface
        fun setTargetQuote(quoteId: String, customerPhone: String) {
            prefs.lastTargetQuoteId = quoteId
            if (customerPhone.isNotBlank()) prefs.lastTargetCustomerPhone = customerPhone
        }
    }
}
