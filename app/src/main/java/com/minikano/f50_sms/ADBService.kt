package com.minikano.f50_sms

import android.app.Service
import android.content.Intent
import android.os.IBinder

/**
 * Compatibility service for the local-only build. Device USB ADB is controlled
 * by Android and the user's USB host; this app never enables network ADB.
 * Reporting, SMS forwarding, vendor-package maintenance and autonomous device
 * tasks are intentionally absent.
 */
class ADBService : Service() {
    companion object {
        @Volatile
        var adbIsReady: Boolean = false
            private set
        var isExecutedSambaMount = false
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        stopSelf(startId)
        return START_NOT_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
