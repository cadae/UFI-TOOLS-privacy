package com.minikano.f50_sms

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.minikano.f50_sms.configs.AppMeta
import com.minikano.f50_sms.utils.DeviceModelChecker
import com.minikano.f50_sms.utils.KanoUtils
import com.minikano.f50_sms.utils.ShellKano
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlin.system.exitProcess

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            Log.d("UFI_TOOLS_LOG", "开机广播接收到，准备启动服务")
            //初始化spf
            KanoUtils.initSharedPerfs(context)
            AppMeta.init(context)

            //check
            val isNotUFI = DeviceModelChecker.checkIsNotUFI(context)
            if (isNotUFI){
                Log.d("UFI_TOOLS_LOG", "检测到设备不是UFI/MIFI设备，终结程序")
                exitProcess(-999)
            }

            // 启动协程异步调用 suspend 函数
            CoroutineScope(Dispatchers.Default).launch {
                val isUnSupportDevice = DeviceModelChecker.checkBlackList(context)
                Log.d("UFI_TOOLS_LOG", "黑名单检测结果：$isUnSupportDevice")

                withContext(Dispatchers.Main) {
                    if (isUnSupportDevice) {
                        // 处理不支持设备逻辑
                        Log.d("UFI_TOOLS_LOG", "检测到不受支持的设备，终结程序")
                        exitProcess(-999)
                    }
                }
            }

            val startIntent = Intent(context, WebService::class.java)
            startIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startForegroundService(startIntent)
            Log.d("UFI_TOOLS_LOG", "启动WebService")
            ShellKano.runADB(context.applicationContext)
            context.startForegroundService(Intent(context, ADBService::class.java))

        }
    }
}