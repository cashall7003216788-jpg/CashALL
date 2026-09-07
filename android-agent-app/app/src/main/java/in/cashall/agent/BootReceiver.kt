package `in`.cashall.agent

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        if (intent?.action == Intent.ACTION_BOOT_COMPLETED || intent?.action == Intent.ACTION_MY_PACKAGE_REPLACED) {
            Log.i("BootReceiver", "Device booted / package replaced. Checking agent session...")
            if (AgentPreferenceManager.isAgentLoggedIn(context)) {
                Log.i("BootReceiver", "Agent session found. Starting AgentLeadMonitoringService...")
                AgentLeadMonitoringService.start(context)
            }
        }
    }
}
