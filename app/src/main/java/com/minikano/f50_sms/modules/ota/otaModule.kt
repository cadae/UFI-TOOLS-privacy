package com.minikano.f50_sms.modules.ota

import android.content.Context
import io.ktor.http.ContentType
import io.ktor.http.HttpStatusCode
import io.ktor.server.application.call
import io.ktor.server.response.respondText
import io.ktor.server.routing.Route
import io.ktor.server.routing.get
import io.ktor.server.routing.post

fun Route.otaModule(context: Context) {
    val disabled = """{"error":"Original APK updates are disabled in this local-only build. Install a reviewed custom build manually over USB."}"""

    get("/api/check_update") {
        call.respondText(disabled, ContentType.Application.Json, HttpStatusCode.Gone)
    }
    post("/api/download_apk") {
        call.respondText(disabled, ContentType.Application.Json, HttpStatusCode.Gone)
    }
    get("/api/download_apk_status") {
        call.respondText("""{"status":"disabled","percent":0}""", ContentType.Application.Json)
    }
    post("/api/install_apk") {
        call.respondText(disabled, ContentType.Application.Json, HttpStatusCode.Gone)
    }
}
