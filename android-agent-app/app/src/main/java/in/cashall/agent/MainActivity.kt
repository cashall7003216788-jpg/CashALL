package `in`.cashall.agent

import android.Manifest
import android.annotation.SuppressLint
import android.app.Activity
import android.content.ClipData
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.Bitmap
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Environment
import android.provider.MediaStore
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
    }

    // Activity result launcher for camera / file chooser
    private val fileChooserLauncher = registerForActivityResult(
        ActivityResultContracts.StartActivityForResult()
    ) { result ->
        if (fileUploadCallback == null) return@registerForActivityResult

        val results: Array<Uri>? = if (result.resultCode == Activity.RESULT_OK) {
            val intent = result.data
            if (intent != null && intent.data != null) {
                // User picked an existing image from gallery
                arrayOf(intent.data!!)
            } else if (cameraImageUri != null) {
                // User took a fresh camera photo
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

    // Permission launcher for Camera and Notifications
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val cameraGranted = permissions[Manifest.permission.CAMERA] ?: false
        Log.i(TAG, "Permissions updated: Camera granted = $cameraGranted")
        binding.permissionOverlay.visibility = View.GONE
        binding.swipeRefresh.visibility = View.VISIBLE
    }

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        setupBackPressHandler()
        setupUI()
        setupWebView()
        checkAndRequestPermissions()

        binding.webView.loadUrl(AGENT_DASHBOARD_URL)
    }

    private fun setupBackPressHandler() {
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                // If alarm is ringing, stop alarm on back press
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

        binding.btnGrantPermissions.setOnClickListener {
            requestRequiredPermissions()
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

        // Expose Native Alarm and Haptics Bridge to JavaScript
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

                // 1. Phone Dialing
                if (url.startsWith("tel:")) {
                    try {
                        val dialIntent = Intent(Intent.ACTION_DIAL, Uri.parse(url))
                        startActivity(dialIntent)
                        return true
                    } catch (e: Exception) {
                        Log.e(TAG, "Cannot launch dialer for $url: ${e.message}")
                    }
                }

                // 2. Google Maps Navigation
                if (url.contains("maps.google.com") || url.contains("google.com/maps")) {
                    try {
                        val mapIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(mapIntent)
                        return true
                    } catch (e: Exception) {
                        Log.e(TAG, "Cannot open Google Maps for $url: ${e.message}")
                    }
                }

                // 3. WhatsApp Direct Chat
                if (url.startsWith("whatsapp:") || url.contains("api.whatsapp.com") || url.contains("wa.me")) {
                    try {
                        val waIntent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                        startActivity(waIntent)
                        return true
                    } catch (e: Exception) {
                        Log.e(TAG, "Cannot open WhatsApp for $url: ${e.message}")
                    }
                }

                return false
            }
        }
    }

    /**
     * Creates an Intent Chooser containing both Camera (to take doorstep defect / barcode photos)
     * and Gallery (to upload UPI payment screenshots for Tesseract.js OCR).
     */
    private fun openCameraOrGalleryChooser() {
        val intentsList = mutableListOf<Intent>()

        // 1. Camera Intent
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

        // 2. Gallery / File Picker Intent
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

    private fun checkAndRequestPermissions() {
        val neededPermissions = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            neededPermissions.add(Manifest.permission.CAMERA)
        }

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                neededPermissions.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        if (neededPermissions.isNotEmpty()) {
            binding.permissionOverlay.visibility = View.VISIBLE
            binding.swipeRefresh.visibility = View.GONE
        } else {
            binding.permissionOverlay.visibility = View.GONE
            binding.swipeRefresh.visibility = View.VISIBLE
        }
    }

    private fun requestRequiredPermissions() {
        val permissions = mutableListOf(Manifest.permission.CAMERA)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        permissionLauncher.launch(permissions.toTypedArray())
    }

    override fun onDestroy() {
        super.onDestroy()
        AlarmSoundManager.stopAlarm(this)
    }
}
