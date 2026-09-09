package `in`.cashall.admin

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.provider.MediaStore
import android.provider.Settings
import android.util.Log
import android.view.View
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
import `in`.cashall.admin.databinding.ActivityMainBinding
import java.io.File
import java.io.IOException
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class MainActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "AdminMainActivity"
        private const val ADMIN_DASHBOARD_URL = "https://cashall.in/admin"
    }

    private lateinit var binding: ActivityMainBinding
    private val mainHandler = Handler(Looper.getMainLooper())

    // File picker / camera callback
    private var fileChooserCallback: ValueCallback<Array<Uri>>? = null
    private var cameraPhotoPath: String? = null

    // UI state poller for native alarm banner
    private val alarmUiPoller = object : Runnable {
        override fun run() {
            val isAlarmActive = AlarmSoundManager.isAlarmActive()
            binding.alarmActiveCard.visibility = if (isAlarmActive) View.VISIBLE else View.GONE
            mainHandler.postDelayed(this, 800L)
        }
    }

    private val requestPermissionsLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) {
        startAdminMonitoringService()
    }

    private val filePickerLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (fileChooserCallback == null) return@registerForActivityResult

        var results: Array<Uri>? = null
        if (result.resultCode == Activity.RESULT_OK) {
            val dataString = result.data?.dataString
            if (dataString != null) {
                results = arrayOf(Uri.parse(dataString))
            } else if (cameraPhotoPath != null) {
                val file = File(cameraPhotoPath!!)
                if (file.exists() && file.length() > 0) {
                    results = arrayOf(Uri.fromFile(file))
                }
            }
        }
        fileChooserCallback?.onReceiveValue(results)
        fileChooserCallback = null
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupBackNavigation()
        setupWebView()
        setupSwipeRefresh()
        setupAlarmControls()
        requestSystemPermissions()
        startAdminMonitoringService()
    }

    override fun onResume() {
        super.onResume()
        mainHandler.post(alarmUiPoller)
    }

    override fun onPause() {
        super.onPause()
        mainHandler.removeCallbacks(alarmUiPoller)
    }

    private fun setupBackNavigation() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (binding.webView.canGoBack()) {
                    binding.webView.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        binding.webView.apply {
            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                databaseEnabled = true
                allowFileAccess = true
                allowContentAccess = true
                useWideViewPort = true
                loadWithOverviewMode = true
                setSupportZoom(true)
                builtInZoomControls = true
                displayZoomControls = false
                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
                userAgentString = "${settings.userAgentString} CashALL-Admin-Android/1.0"
            }

            addJavascriptInterface(CashAllAdminNative(this@MainActivity), "CashAllAdminNative")

            webViewClient = object : WebViewClient() {
                override fun onPageStarted(view: WebView?, url: String?, favicon: Bitmap?) {
                    binding.progressBar.visibility = View.VISIBLE
                }

                override fun onPageFinished(view: WebView?, url: String?) {
                    binding.progressBar.visibility = View.GONE
                    binding.swipeRefresh.isRefreshing = false
                }

                override fun onReceivedError(view: WebView?, request: WebResourceRequest?, error: WebResourceError?) {
                    if (request?.isForMainFrame == true) {
                        binding.progressBar.visibility = View.GONE
                        binding.swipeRefresh.isRefreshing = false
                    }
                }

                override fun shouldOverrideUrlLoading(view: WebView?, request: WebResourceRequest?): Boolean {
                    val url = request?.url?.toString() ?: return false

                    // 1. Google Maps & Turn-by-Turn Navigation
                    if (url.contains("google.com/maps") || url.contains("maps.google.com") || url.startsWith("geo:") || url.startsWith("google.navigation:")) {
                        try {
                            val mapIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
                                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                            }
                            startActivity(mapIntent)
                            return true
                        } catch (e: Exception) {
                            Log.w(TAG, "Failed to launch maps intent: ${e.message}")
                        }
                    }

                    // 2. Phone Dialer & External protocols
                    if (url.startsWith("tel:")) {
                        try {
                            startActivity(Intent(Intent.ACTION_DIAL, Uri.parse(url)))
                            return true
                        } catch (e: Exception) {}
                    }

                    if (url.startsWith("mailto:") || url.startsWith("whatsapp:")) {
                        try {
                            startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                            return true
                        } catch (e: Exception) {}
                    }

                    return false
                }
            }

            webChromeClient = object : WebChromeClient() {
                override fun onProgressChanged(view: WebView?, newProgress: Int) {
                    if (newProgress < 100) {
                        binding.progressBar.visibility = View.VISIBLE
                        binding.progressBar.progress = newProgress
                    } else {
                        binding.progressBar.visibility = View.GONE
                    }
                }

                override fun onShowFileChooser(
                    webView: WebView?,
                    filePathCallback: ValueCallback<Array<Uri>>?,
                    fileChooserParams: FileChooserParams?
                ): Boolean {
                    fileChooserCallback?.onReceiveValue(null)
                    fileChooserCallback = filePathCallback

                    val takePictureIntent = Intent(MediaStore.ACTION_IMAGE_CAPTURE)
                    var photoFile: File? = null
                    try {
                        photoFile = createCapturedImageFile()
                    } catch (ex: IOException) {
                        Log.e(TAG, "Error creating photo file: ${ex.message}")
                    }

                    if (photoFile != null) {
                        cameraPhotoPath = photoFile.absolutePath
                        val photoURI = FileProvider.getUriForFile(
                            this@MainActivity,
                            "${applicationContext.packageName}.fileprovider",
                            photoFile
                        )
                        takePictureIntent.putExtra(MediaStore.EXTRA_OUTPUT, photoURI)
                    }

                    val contentSelectionIntent = Intent(Intent.ACTION_GET_CONTENT).apply {
                        addCategory(Intent.CATEGORY_OPENABLE)
                        type = "*/*"
                    }

                    val intentArray: Array<Intent?> = if (photoFile != null) {
                        arrayOf(takePictureIntent)
                    } else {
                        emptyArray()
                    }

                    val chooserIntent = Intent(Intent.ACTION_CHOOSER).apply {
                        putExtra(Intent.EXTRA_INTENT, contentSelectionIntent)
                        putExtra(Intent.EXTRA_TITLE, "Select Document or Capture Photo")
                        putExtra(Intent.EXTRA_INITIAL_INTENTS, intentArray)
                    }

                    filePickerLauncher.launch(chooserIntent)
                    return true
                }
            }

            loadUrl(ADMIN_DASHBOARD_URL)
        }
    }

    private fun setupSwipeRefresh() {
        binding.swipeRefresh.setColorSchemeResources(R.color.brand_yellow)
        binding.swipeRefresh.setOnRefreshListener {
            binding.webView.reload()
        }
    }

    private fun setupAlarmControls() {
        binding.btnStopNativeAlarm.setOnClickListener {
            AlarmSoundManager.stopAlarm(this)
            binding.alarmActiveCard.visibility = View.GONE
        }
    }

    private fun requestSystemPermissions() {
        val permissions = mutableListOf<String>()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissions.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissions.add(Manifest.permission.CAMERA)
        }

        if (permissions.isNotEmpty()) {
            requestPermissionsLauncher.launch(permissions.toTypedArray())
        }

        // Battery optimization exemption check
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val pm = getSystemService(Context.POWER_SERVICE) as? PowerManager
            if (pm != null && !pm.isIgnoringBatteryOptimizations(packageName)) {
                try {
                    val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS).apply {
                        data = Uri.parse("package:$packageName")
                    }
                    startActivity(intent)
                } catch (e: Exception) {
                    Log.w(TAG, "Cannot request ignore battery optimization directly: ${e.message}")
                }
            }
        }
    }

    private fun startAdminMonitoringService() {
        val serviceIntent = Intent(this, AdminOrderMonitoringService::class.java)
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                startForegroundService(serviceIntent)
            } else {
                startService(serviceIntent)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to start AdminOrderMonitoringService: ${e.message}")
        }
    }

    @Throws(IOException::class)
    private fun createCapturedImageFile(): File {
        val timeStamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.getDefault()).format(Date())
        val storageDir = getExternalFilesDir(Environment.DIRECTORY_PICTURES)
        return File.createTempFile("CASHALL_ADMIN_${timeStamp}_", ".jpg", storageDir)
    }
}
