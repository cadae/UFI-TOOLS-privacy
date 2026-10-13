package com.minikano.f50_sms.utils

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AdbPortPolicyTest {
    @Test fun automaticStartupPreservesWorkingSessionAndClearedPersistence() {
        assertTrue(adbPortChanges("5555").isEmpty())
    }

    @Test fun automaticStartupRequestsOnlyTheTemporaryPortWhenNeeded() {
        for (currentPort in listOf("", "0", "-1")) {
            assertEquals(listOf("service.adb.tcp.port" to "5555"), adbPortChanges(currentPort))
        }
    }

    @Test fun failedAutomaticReadDoesNotGuessOrWriteProperties() {
        assertTrue(adbPortChanges(null).isEmpty())
    }

    @Test fun explicitManualEnableUsesTheRecognizedPersistentKey() {
        assertEquals(listOf("persist.adb.tcp.port" to "5555"), adbPortChanges("5555", true))
        assertEquals(listOf("persist.adb.tcp.port" to "5555", "service.adb.tcp.port" to "5555"),
            adbPortChanges("", true))
    }

    @Test fun explicitManualDisableClearsPersistenceWithoutClosingTheSession() {
        for (currentPort in listOf("5555", "", null)) {
            assertEquals(listOf("persist.adb.tcp.port" to ""), adbPortChanges(currentPort, false))
        }
    }
}
