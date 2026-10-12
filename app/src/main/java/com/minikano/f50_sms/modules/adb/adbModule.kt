package com.minikano.f50_sms.modules.adb

import android.content.Context
import com.minikano.f50_sms.ADBService
import com.minikano.f50_sms.utils.KanoLog
import com.minikano.f50_sms.modules.BASE_TAG
import com.minikano.f50_sms.modules.PREFS_NAME
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.request.receiveText
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import org.json.JSONObject
import androidx.core.content.edit

//静态资源
fun Route.adbModule(context: Context) {
    val TAG = "[$BASE_TAG]_adbModule"

    //更新ADMIN_PWD
    post("/api/update_admin_pwd"){
        try {
            // 获取 JSON Body
            val body = call.receiveText()
            val json = JSONObject(body)

            val password = json.optString("password", "")

            val sharedPrefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

            // 保存配置
            sharedPrefs.edit(commit = true) {
                putString("ADMIN_PWD", password)
            }

            // 响应
            call.response.headers.append("Access-Control-Allow-Origin", "*")
            call.respondText(
                """{"result":"success"}""",
                ContentType.Application.Json
            )
        } catch (e: Exception) {
            KanoLog.d(TAG, "解析ADB_WIFI POST 请求出错：${e.message}")
            call.response.headers.append("Access-Control-Allow-Origin", "*")
            call.respondText(
                """{"error":"参数解析失败"}""",
                ContentType.Application.Json,
                HttpStatusCode.InternalServerError
            )
        }
    }

    //获取当前高级后台存储的官方后台密码
    get("/api/get_official_web_password") {
        try {
            val sharedPrefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            // 拼装 JSON 响应
            val resultJson = JSONObject()
                .put("pwd",sharedPrefs.getString("ADMIN_PWD",""))

            call.response.headers.append("Access-Control-Allow-Origin", "*")
            call.respondText(resultJson.toString(), ContentType.Application.Json, HttpStatusCode.OK)
        } catch (e: Exception) {
            KanoLog.d(TAG, "请求出错：${e.message}")
            call.response.headers.append("Access-Control-Allow-Origin", "*")
            call.respondText(
                """{"error":"请求出错"}""",
                ContentType.Application.Json,
                HttpStatusCode.InternalServerError
            )
        }
    }

    // Network ADB is unavailable in the local-only build, including saved settings.
    get("/api/adb_wifi_setting") {
        call.respondText(
            """{"enabled":false,"available":false}""",
            ContentType.Application.Json
        )
    }

    post("/api/adb_wifi_setting") {
        call.respondText(
            """{"error":"Automatic network ADB is disabled in this local-only build"}""",
            ContentType.Application.Json,
            HttpStatusCode.Gone
        )
    }

    //网络ADB启动状态
    get("/api/adb_alive") {
        call.response.headers.append("Access-Control-Allow-Origin", "*")
        call.respondText(
            """{"result":"${ADBService.adbIsReady}"}""".trimIndent(),
            ContentType.Application.Json,
            HttpStatusCode.OK
        )
    }

}