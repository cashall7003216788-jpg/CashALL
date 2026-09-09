package `in`.cashall.admin

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.util.Log

object GoogleNavigationHelper {
    private const val TAG = "GoogleNavigationHelper"

    fun startNavigation(context: Context, locationQuery: String) {
        if (locationQuery.isBlank()) {
            Log.w(TAG, "Cannot start navigation: location query is empty")
            return
        }

        val encodedQuery = Uri.encode(locationQuery)
        val gmmIntentUri = Uri.parse("google.navigation:q=$encodedQuery")
        val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri).apply {
            setPackage("com.google.android.apps.maps")
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }

        try {
            if (mapIntent.resolveActivity(context.packageManager) != null) {
                context.startActivity(mapIntent)
                Log.i(TAG, "Launched native Google Maps turn-by-turn navigation for: $locationQuery")
                return
            }
        } catch (e: Exception) {
            Log.w(TAG, "Native Google Maps not available: ${e.message}")
        }

        // Fallback to universal browser / web maps
        try {
            val fallbackUri = Uri.parse("https://www.google.com/maps/search/?api=1&query=$encodedQuery")
            val browserIntent = Intent(Intent.ACTION_VIEW, fallbackUri).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(browserIntent)
            Log.i(TAG, "Launched web Google Maps fallback for: $locationQuery")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to launch navigation fallback: ${e.message}", e)
        }
    }
}
