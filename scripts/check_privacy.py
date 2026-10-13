#!/usr/bin/env python3
"""Privacy regressions that preserve the required local ADB and ordinary features."""
from pathlib import Path
import hashlib, json, re, subprocess, xml.etree.ElementTree as ET
ROOT = Path(__file__).resolve().parents[1]
JAVA = ROOT / 'app/src/main/java/com/minikano/f50_sms'
WEB = ROOT / 'app/frontEnd/public'
all_java = '\n'.join(p.read_text() for p in JAVA.rglob('*.kt'))
for removed in ('KanoReport', 'UniqueDeviceIDManager', 'ufi_tools_report', 'sprd_uid/uid'):
    assert removed not in all_java, removed
service = (JAVA/'ADBService.kt').read_text()
assert '"connect"' in service and '"localhost"' in service and '"track-devices"' in service
for removed in ('reportToServer', 'runnableRPT', 'disableFota(', 'handleAdbReady(', 'tryWakeAdbd'):
    assert removed not in service, removed
for restored in ('runnableSMSAndDataFlowCheck', 'runnableAT', 'runnableSMB', 'TaskSchedulerManager.init', 'startIperfTask', 'adbWatchdogExecutor'):
    assert restored in service, restored
assert 'sharedPrefs.getString("kano_sms_forward_enabled", "0") == "1"' in service
assert 'sharedPrefs.getString("kano_data_flow_limit_enabled", "0") == "1"' in service
assert 'enabledKeys.none' in service
assert 'File(applicationContext.filesDir, "kano_root_shell.sock").exists()' in service
shell = (JAVA/'utils/ShellKano.kt').read_text()
run_adb = shell.split('fun runADB(context: Context)',1)[1].split('fun openSMB',1)[0]
assert 'listOf("persist.adb.tcp.port", "service.adb.tcp.port")' in run_adb
assert 'setprop $property 5555' in run_adb
assert 'persist.service.adb.tcp.port' not in '\n'.join(
    line for line in all_java.splitlines() if not line.strip().startswith('//'))
assert '== null' in run_adb and 'Network ADB property request failed: $property' in run_adb
# Startup and watchdog must configure/probe without daemon restart loops.
for restart in ('restart adbd', 'stop adbd', 'start adbd', 'tcpip', 'kill-server'):
    assert restart not in run_adb, restart
    assert restart not in service, restart
# Auto-start disable changes its preference only; advanced port buttons are
# separate firewall controls and must not acquire property/daemon side effects.
adb_module = (JAVA/'modules/adb/adbModule.kt').read_text()
assert 'if (enabled) ShellKano.runADB(context.applicationContext)' in adb_module
assert 'putString("ADB_IP_ENABLED", "false")' in adb_module
assert 'setprop' not in adb_module
for unrelated in ('SAMBA_SETTING', 'SetUpgAutoSetting', 'RootShell', 'req.login', 'disableFota'):
    assert unrelated not in run_adb, unrelated
for component in ('MainActivity.kt','WebService.kt'):
    text=(JAVA/component).read_text()
    assert 'private val SERVER_INTENT get()' in text and 'private val UI_INTENT get()' in text, component
    assert 'private val SERVER_INTENT = "${packageName}' not in text, component
for startup in ('MainActivity.kt','BootReceiver.kt'):
    assert 'ADBService::class.java' in (JAVA/startup).read_text()
for prohibited in ('com.zte.zdmdaemon', 'pm uninstall -k --user 0'):
    assert prohibited not in all_java, prohibited
module = (JAVA/'modules/mainModule.kt').read_text()
for restored in ('anyProxyModule(context)', 'pluginsModule(context)', 'smsModule(context)', 'scheduledTaskModule(context)'):
    assert restored in module, restored
proxy = (JAVA/'modules/anyProxy/anyProxyModule.kt').read_text()
assert '"api.kanokano.cn"' in proxy.split('val forbiddenDomains',1)[1].split(')',1)[0]
assert 'host = "192.168.0.1"' in (JAVA/'KanoWebServer.kt').read_text()
manifest = ET.parse(ROOT/'app/src/main/AndroidManifest.xml').getroot()
A = '{http://schemas.android.com/apk/res/android}'
permissions = {x.get(A+'name') for x in manifest.findall('uses-permission')}
for restored in ('READ_SMS','PACKAGE_USAGE_STATS','RECEIVE_BOOT_COMPLETED'):
    assert 'android.permission.'+restored in permissions, restored
for removed in ('REQUEST_IGNORE_BATTERY_OPTIMIZATIONS','CHANGE_NETWORK_STATE'):
    assert 'android.permission.'+removed not in permissions, removed
assert manifest.find('application').get(A+'allowBackup') == 'false'
script = (ROOT/'app/src/main/assets/shell/samba_exec.sh').read_text()
for prohibited in ('pm grant ', 'appops set ', 'pm uninstall ', 'pm disable ', 'deviceidle whitelist'):
    assert prohibited not in script, prohibited
assert not re.search(r'^\s+disable_fota\s*$',script,re.M)
for name in ('samba_exec.sh','login.sh','ufi_keep_alive.sh'):
    p=ROOT/'app/src/main/assets/shell'/name
    subprocess.run(['sh','-n',str(p)],check=True)
    assert '/data/data/com.minikano.f50_sms/files' not in p.read_text()
assert 'PKG="com.minikano.f50_sms.privacy"' in (ROOT/'app/src/main/assets/shell/ufi_keep_alive.sh').read_text()
assert 'ACT="com.minikano.f50_sms.MainActivity"' in (ROOT/'app/src/main/assets/shell/ufi_keep_alive.sh').read_text()
for source in WEB.rglob('*.json'): json.loads(source.read_text())
js = (WEB/'script/main.js').read_text()
for removed in ('api.kanokano.cn','initMessage','/device_id','/check_update','/download_apk','/install_apk'):
    assert removed not in js, removed
assert "if (localStorage.getItem('privacy_load_custom_head') === 'true')" in js
assert 'getCustomHead().then' in js
manual = js.split('const handleDisableFOTA = async () => {',1)[1].split('const ',1)[0]
assert js.index("!== 'UNINSTALL'") < js.index('runShellWithRoot("pm disable')
assert 'privacy_vendor_removal_confirm' in js
for source in ('main.js','utils.js','requests.js','theme.js'):
    subprocess.run(['node','--check',str(WEB/'script'/source)],check=True)
wrapper = ROOT/'gradle/wrapper/gradle-wrapper.jar'
assert hashlib.sha256(wrapper.read_bytes()).hexdigest() == '498495120a03b9a6ab5d155f5de3c8f0d986a449153702fb80fc80e134484f17'
props = (ROOT/'gradle/wrapper/gradle-wrapper.properties').read_text()
assert 'distributionSha256Sum=d725d707bfabd4dfdc958c624003b3c80accc03f7037b5122c4b1d0ef15cecab' in props
build = (ROOT/'app/build.gradle.kts').read_text()
assert 'applicationId = "com.minikano.f50_sms.privacy"' in build
assert 'versionName = "4.1.5-privacy.3"' in build
print('Privacy.3 regressions passed: reporting/vendor removal absent; local ADB and settings-gated features preserved; no blanket grants.')
