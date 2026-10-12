#!/usr/bin/env python3
"""Regression checks for removed reporting and unattended modification paths."""
from pathlib import Path
import hashlib, json, re, subprocess, xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
JAVA = ROOT / "app/src/main/java/com/minikano/f50_sms"
WEB = ROOT / "app/frontEnd/public"
all_java = "\n".join(p.read_text() for p in JAVA.rglob("*.kt"))
for removed in ("KanoReport", "UniqueDeviceIDManager", "ufi_tools_report", "sprd_uid/uid", "api.kanokano.cn"):
    assert removed not in all_java, removed
startup = "\n".join((JAVA/p).read_text() for p in ("MainActivity.kt", "WebService.kt", "ADBService.kt", "BootReceiver.kt"))
for prohibited in ("disableFota(", "runADB(", "tryWake", "SmsPoll", "ScheduledTaskExecutor", "SmbThrottledRunner", "ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS"):
    assert prohibited not in startup, prohibited
for prohibited in ("persist.service.adb.tcp.port", "service.adb.tcp.port", "ctl.restart adbd", "com.zte.zdmdaemon", "pm uninstall -k --user 0"):
    assert prohibited not in all_java, prohibited
module = (JAVA/"modules/mainModule.kt").read_text()
for disabled in ("anyProxyModule(context)", "pluginModule(context)", "smsModule(context)", "scheduledTaskModule(context)"):
    assert disabled not in module, disabled
assert 'host = "192.168.0.1"' in (JAVA/"KanoWebServer.kt").read_text()
manifest = ET.parse(ROOT/"app/src/main/AndroidManifest.xml").getroot()
A = "{http://schemas.android.com/apk/res/android}"
permissions = {x.get(A+"name") for x in manifest.findall("uses-permission")}
for removed in ("READ_SMS", "PACKAGE_USAGE_STATS", "WRITE_EXTERNAL_STORAGE", "REQUEST_IGNORE_BATTERY_OPTIMIZATIONS", "CHANGE_NETWORK_STATE"):
    assert "android.permission."+removed not in permissions, removed
assert manifest.find("application").get(A+"allowBackup") == "false"
for source in WEB.rglob("*.json"):
    json.loads(source.read_text())
js = (WEB/"script/main.js").read_text()
for removed in ("api.kanokano.cn", "initMessage", "/device_id", "/check_update", "/download_apk", "/install_apk", "getCustomHead().then"):
    assert removed not in js, removed
for source in ("main.js", "utils.js", "requests.js"):
    subprocess.run(["node", "--check", str(WEB/"script"/source)], check=True)
# Execute only the background URL validator in an isolated Node VM.
validator = (WEB/"script/utils.js").read_text().split("const isArray", 1)[0]
cases = {"/img/zsm.png": True, "http://192.168.0.1:2333/img/zsm.png": True,
         "data:image/png;base64,AAAA": True, "https://outside.example/a.png": False,
         "//outside.example/a.png": False, "javascript:alert(1)": False,
         "data:image/svg+xml;base64,AAAA": False, "/img/zsm.png?external=1": False,
         "/img/zsm.png#fragment": False, "/api/proxy": False, "": False}
node_test = "const vm=require('node:vm');const context={URL,window:{location:{href:'http://192.168.0.1:2333/',origin:'http://192.168.0.1:2333'}}};vm.createContext(context);vm.runInContext(" + json.dumps(validator+"\nthis.check=getSafeLocalBackgroundUrl") + ",context);for(const [input,want] of Object.entries(" + json.dumps(cases) + ")) {if(Boolean(context.check(input))!==want)throw Error('Background validation failed: '+input)}"
subprocess.run(["node", "-e", node_test], check=True)
wrapper = ROOT/"gradle/wrapper/gradle-wrapper.jar"
assert hashlib.sha256(wrapper.read_bytes()).hexdigest() == "498495120a03b9a6ab5d155f5de3c8f0d986a449153702fb80fc80e134484f17"
props = (ROOT/"gradle/wrapper/gradle-wrapper.properties").read_text()
assert "distributionSha256Sum=d725d707bfabd4dfdc958c624003b3c80accc03f7037b5122c4b1d0ef15cecab" in props
build = (ROOT/"app/build.gradle.kts").read_text()
assert 'applicationId = "com.minikano.f50_sms.privacy"' in build
assert 'versionName = "4.1.5-privacy.1"' in build
print("Privacy source regressions passed (reporting, unattended changes, routes, permissions, JS, build identity).")
