package `in`.cashall.agent

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.PowerManager
import android.provider.MediaStore
import android.provider.Settings
import android.util.Log
import android.view.View
import android.webkit.GeolocationPermissions
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebResourceError
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.core.content.ContextCompat
import androidx.core.content.FileProvider
import `in`.cashall.agent.databinding.ActivityMainBinding
import `in`.cashall.agent.R
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    private lateinit var binding: ActivityMainBinding
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private var cameraImageUri: Uri? = null

    companion object {
        private const val TAG = "CashAllAgentApp"
        const val AGENT_DASHBOARD_URL = "https://cashall.in/agent/dashboard"
        var instance: MainActivity? = null
    }

    // Activity result launcher for camera / file chooser
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (fileUploadCallback == null) return@registerForActivityResult

        val results: Array<Uri>? = if (result.resultCode == Activity.RESULT_OK) {
            val intent = result.data
            if (intent != null && intent.data != null) {
                arrayOf(intent.data!!)
            } else if (cameraImageUri != null) {
                arrayOf(cameraImageUri!!)
            } else {
                null
            }
        } else {
            null
        }

        fileUploadCallback?.onReceiveValue(results)
        fileUploadCallback = null
    }

    // Permission launcher for mandatory permissions
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ ->
        checkAndEnforcePermissions()
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        instance = this
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        handleIntentAlarm(intent)
        setupBackPressHandler()
        setupUI()
        setupWebView()
        checkAndEnforcePermissions()
        requestIgnoreBatteryOptimizations()

        if (AgentPreferenceManager.isAgentLoggedIn(this) && areAllPermissionsGranted()) {
            AgentLeadMonitoringService.start(this)
        }

        binding.webView.loadUrl(AGENT_DASHBOARD_URL)
    }

    override fun onNewIntent(intent: Intent?) {
        super.onNewIntent(intent)
        handleIntentAlarm(intent)
    }

    private fun handleIntentAlarm(intent: Intent?) {
        if (intent?.getBooleanExtra("stopAlarm", false) == true || intent?.hasExtra("orderNumber") == true) {
            Log.i(TAG, "Silencing alarm and cancelling notification immediately upon opening.")
            AlarmSoundManager.stopAlarm(this)
            updateAlarmCard(false)
            try {
                val notifManager = getSystemService(Context.NOTIFICATION_SERVICE) as? NotificationManager
                notifManager?.cancel(AgentLeadMonitoringService.NOTIF_ID_URGENT_ALARM)
            } catch (ignored: Exception) {}
        }
    }

    override fun onResume() {
        super.onResume()
        updateAlarmCard(AlarmSoundManager.isAlarmActive())
        checkAndEnforcePermissions()
    }

    override fun onDestroy() {
        super.onDestroy()
        if (instance == this) instance = null
    }

    private fun setupBackPressHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (AlarmSoundManager.isAlarmActive()) {
                    AlarmSoundManager.stopAlarm(this@MainActivity)
                    updateAlarmCard(false)
                    return
                }

                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    private fun setupUI() {
        binding.swipeRefresh.setColorSchemeResources(R.color.yellow_primary, R.color.yellow_dark)
        binding.swipeRefresh.setOnRefreshListener {
            binding.webView.reload()
        }

        binding.btnStopNativeAlarm.setOnClickListener {
            AlarmSoundManager.stopAlarm(this)
            updateAlarmCard(false)
        }

        binding.btnAutoRecordSettings.setOnClickListener {
            openDialerCallSettings()
        }

        binding.btnGrantPermissions.setOnClickListener {
            requestMandatoryPermissions()
        }
    }

    fun updateAlarmCard(isActive: Boolean) {
        runOnUiThread {
            binding.alarmActiveCard.visibility = if (isActive) View.VISIBLE else View.GONE
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        with(binding.webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            allowFileAccess = true
            allowContentAccess = true
            loadWithOverviewMode = true
            useWideViewPort = true
            cacheMode = WebSettings.LOAD_DEFAULT
            mediaPlaybackRequiresUserGesture = false
            setGeolocationEnabled(true)
            mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
        }

        // Expose Native Alarm, Session, Haptics & Calling Bridge to JavaScript
        val nativeBridge = CashAllAgentNative(this) { active ->
            updateAlarmCard(active)
        }
        binding.webView.addJavascriptInterface(nativeBridge, "CashAllAgentNative")

        // Custom ChromeClient for Camera Capture, Gallery Picker & Geolocation
        binding.webView.webChromeClient = object : WebChromeClient() {
            override fun onProgressChanged(view: WebView?, newProgress: Int) {
                if (newProgress < 100) {
                    binding.progressBar.visibility = View.VISIBLE
                    binding.progressBar.progress = newProgress
                } else {
                    binding.progressBar.visibility = View.GONE
                }
            }

            override fun onGeolocationPermissionsShowPrompt(
                origin: String?,
                callback: GeolocationPermissions.Callback?
            ) {
                callback?.invoke(origin, true, false)
            }

            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                openCameraOrGalleryChooser()
                return true
            }
        }

        // Custom WebViewClient for External Navigation (Maps, Calls, WhatsApp)
        binding.webView.webViewClient = object : WebViewClient() {
            override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                super.onPageStarted(view, url, favicon)
                binding.progressBar.visibility = View.VISIBLE
            }

            override fun onPageFinished(view: WebView?, url: String?) {
                super.onPageFinished(view, url)
                binding.progressBar.visibility = View.GONE
                binding.swipeRefresh.isRefreshing = false
            }

            override fun onReceivedError(
                view: WebView?,
                request: WebResourceRequest?,
                error: WebResourceError?
            ) {
                super.onReceivedError(view, request, error)
                if (request?.isForMainFrame == true) {
                    binding.progressBar.visibility = View.GONE
                    binding.swipeRefresh.isRefreshing = false
                }
            }

            override fun shouldOverrideUrlLoading(
                view: WebView?,
                request: WebResourceRequest?
            ): Boolean {
                val url = request?.url?.toString() ?: return false

                if (url.startsWith("tel:")) {
                    val rawPhone = url.substringAfter("tel:")
                    val targetName = AgentPreferenceManager.getLastTargetName(this@MainActivity)
                    val targetDevice = AgentPreferenceManager.getLastTargetDevice(this@MainActivity)
                    val targetOrder = AgentPreferenceManager.getLastTargetOrder(this@MainActivity)
                    AgentPreferenceManager.setLastTargetCall(this@MainActivity, rawPhone, targetName, targetDevice, targetOrder)

                    try {
                        val hasCallPhone = checkSelfPermission(Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED
                        val intent = if (hasCallPhone) {
                            Intent(Intent.ACTION_CALL, Uri.parse(url))
                        } else {
                            Intent(Intent.ACTION_DIAL, Uri.parse(url))
                        }
                        startActivity(intent)
                        return true
                    } catch (e: Exception) {
                        Log.e(TAG, "Cannot launch dialer: ${e.message}")
                    }
                }

                if (url.contains("maps.google.com") || url.contains("google.com/maps")) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        return true
                    } catch (e: Exception) {
                        Log.e(TAG, "Cannot open Maps: ${e.message}")
                    }
                }

                if (url.startsWith("whatsapp:") || url.contains("api.whatsapp.com") || url.contains("wa.me")) {
                    try {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        return true
                    } catch (e: Exception) {
                        Log.e(TAG, "Cannot open WhatsApp: ${e.message}")
                    }
                }

                return false
            }
        }
    }

    private fun openCameraOrGalleryChooser() {
        val intentsList = mutableListOf<Intent>()

        val captureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
        try {
            val photoFile = createTempImageFile()
            cameraImageUri = FileProvider.getUriForFile(
                this,
                "${applicationContext.packageName}.fileprovider",
                photoFile
            )
            captureIntent.putExtra(MediaStore.EXTRA_OUTPUT, cameraImageUri)
            captureIntent.addFlags(Intent.FLAG_GRANT_WRITE_URI_PERMISSION or Intent.FLAG_GRANT_READ_URI_PERMISSION)
            if (captureIntent.resolveActivity(packageManager) != null) {
                intentsList.add(captureIntent)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to create temp photo file: ${e.message}")
        }

        val galleryIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
            type = "image/*"
            addCategory(Intent.CATEGORY_OPENABLE)
        }

        val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
            putExtra(Intent.EXTRA_INTENT, galleryIntent)
            putExtra(Intent.EXTRA_TITLE, "Select Photo or Take Picture")
            if (intentsList.isNotEmpty()) {
                putExtra(Intent.EXTRA_INITIAL_INTENTS, intentsList.toTypedArray())
            }
        }

        fileChooserLauncher.launch(chooserIntent)
    }

    private fun createTempImageFile(): File {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("CashALL_Doorstep_${timeStamp}_", ".jpg", storageDir)
    }

    // ── Mandatory Permissions Gatekeeper ──

    private fun getRequiredPermissions(): List<String> {
        val list = mutableListOf(
            Manifest.permission.CAMERA,
            Manifest.permission.CALL_PHONE,
            Manifest.permission.READ_PHONE_STATE,
            Manifest.permission.READ_CALL_LOG,
            Manifest.permission.RECORD_AUDIO
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            list.add(Manifest.permission.POST_NOTIFICATIONS)
            list.add(Manifest.permission.READ_MEDIA_AUDIO)
            list.add(Manifest.permission.READ_MEDIA_IMAGES)
        } else {
            list.add(Manifest.permission.READ_EXTERNAL_STORAGE)
        }
        return list
    }

    private fun areAllPermissionsGranted(): Boolean {
        return getRequiredPermissions().all {
            ContextCompat.checkSelfPermission(this, it) == PackageManager.PERMISSION_GRANTED
        }
    }

    private fun checkAndEnforcePermissions() {
        if (!areAllPermissionsGranted()) {
            binding.permissionOverlay.visibility = View.VISIBLE
            binding.swipeRefresh.visibility = View.GONE
            binding.tvPermissionWarning.visibility = View.VISIBLE
        } else {
            binding.permissionOverlay.visibility = View.GONE
            binding.swipeRefresh.visibility = View.VISIBLE
            binding.tvPermissionWarning.visibility = View.GONE

            if (AgentPreferenceManager.isAgentLoggedIn(this)) {
                AgentLeadMonitoringService.start(this)
            }
        }
    }

    private fun requestMandatoryPermissions() {
        val missing = getRequiredPermissions().filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }

        if (missing.isNotEmpty()) {
            permissionLauncher.launch(missing.toTypedArray())
        } else {
            checkAndEnforcePermissions()
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
            "Open Phone dialer ➔ Settings ➔ Call Recording ➔ Turn ON Auto-record calls",
            Toast.LENGTH_LONG
        ).show()
    }

    private fun requestIgnoreBatteryOptimizations() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = getSystemService(Context.POWER_SERVICE) as? PowerManager
            if (pm != null && !pm.isIgnoringBatteryOptimizations(packageName)) {
                try {
                    @SuppressLint("BatteryLife")
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:$packageName")
                    }
                    startActivity(intent)
                } catch (e: Exception) {
                    Log.w(TAG, "Battery opt intent error: ${e.message}")
                }
            }
        }
    }
}
