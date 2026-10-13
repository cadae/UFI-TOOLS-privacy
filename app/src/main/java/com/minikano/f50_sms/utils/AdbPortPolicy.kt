package com.minikano.f50_sms.utils

/** null means automatic startup; only an explicit manual choice changes persistence. */
internal fun adbPortChanges(
    currentRuntimePort: String?,
    persistOnBoot: Boolean? = null,
): List<Pair<String, String>> = buildList {
    if (persistOnBoot != null) {
        add("persist.adb.tcp.port" to if (persistOnBoot) "5555" else "")
    }
    // Disabling auto-start preserves the current TCP session. A failed automatic
    // property read also leaves it alone, rather than guessing its state.
    if (persistOnBoot != false && currentRuntimePort != "5555" &&
        (currentRuntimePort != null || persistOnBoot == true)) {
        add("service.adb.tcp.port" to "5555")
    }
}
