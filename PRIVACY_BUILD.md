# UFI-TOOLS 4.1.5 privacy build

Based on kanoqwq/UFI-TOOLS commit `cf83b815efb114ed026f06dc90550845aafbfceb` (http-server-version). Upstream author MiniKano and the upstream MIT statement are retained. This is an independent custom build, not a maintainer release or an exhaustive security audit.

## Behavior and limits

- Removed startup/recurring KanoReport and hardware-ID/UUID developer-message/read-receipt paths.
- Original APK check/download/install is disabled. Updates are manual from this fork after review.
- Promotional images are bundled. No automatic promotional popup, external cloud-game iframe, saved custom HTML/script injection, or remote background image loading. Raster data images and local resources remain.
- No automatic network/persistent ADB setup, adbd restart/retry, vendor FOTA/package removal, boot service activation or battery exemption prompt.
- Autonomous jobs means reporting, SMS/power forwarding, monthly data-limit disconnects, saved command schedules, Samba startup/mounts, AT/VoLTE startup commands, iperf and ADB maintenance. They previously ran inside ADBService. The foreground WebService and local monitoring remain.
- External proxy, downloadable plugin, forwarding and scheduled-command routes/UI are unavailable in this build. These are deliberate limits of the local-only profile; manual general settings, official Web UI, theme, ordinary status monitoring and SMS reads through the official local Web UI remain. The manual wireless ADB port controls remain; they only change firewall access and do not start TCP adbd. They are not invoked during installation or verification. The old ADB auto-start toggle is blocked because it configures recurring automatic activation.
- Server binds only `192.168.0.1:2333`; no wildcard fallback. This requires that existing F50 address. No router/interface/network setting is changed to make it work.
- Host USB ADB is unchanged. Internal privileged controls depended on device TCP ADB and are unavailable without that connection. This fork does not create a bridge or enable TCP ADB.
- Local authentication is retained. User must set a strong local password/token themselves. No blanket SMS/usage/storage permissions or exemption grants. App data backup disabled.
- Manual external links and remaining user-triggered management APIs can still perform network/device actions. Source/static/runtime checks do not prove zero external traffic in every possible configuration. Do not activate root, plugins, forwarding, band/IMEI/port-forward changes as part of this diagnostic.

## Identity and signing

Application ID `com.minikano.f50_sms.privacy`, namespace/classes `com.minikano.f50_sms`, version `4.1.5-privacy.1`, fixed versionCode `20261012`. Manifest component classes resolve via the Android namespace; explicit startup component uses `com.minikano.f50_sms.privacy/com.minikano.f50_sms.MainActivity`. Service broadcasts use the runtime package name and Samba file paths use `context.filesDir`. No custom providers or signature permissions require migration. Separate package prevents overwriting upstream app data; do not run both Web servers on port2333.

Build uses the existing local Android debug keystore through normal Android Gradle debug signing; never commit or distribute that key. This is a debug-signed personal build, not production release signing. Future updates require the same local signing identity.

## Build and verification

Prerequisites: existing JDK17, Node/npm, Google SDK platform35/build-tools35, Gradle8.9. Official Gradle wrapper and distribution SHA256 are pinned. Frontend copy/debug mode keeps packaged JavaScript inspectable; dependency lifecycle scripts are disabled.

```sh
python3 scripts/check_privacy.py
cd app/frontEnd
npm ci --ignore-scripts --no-audit --no-fund
cd ../..
JAVA_HOME=/path/to/existing/jdk17 ANDROID_HOME=/path/to/sdk sh gradlew :app:assembleDebug --no-daemon
```

Check final APK package/version/permissions using Google aapt, signature using apksigner, and removed paths using extracted assets/DEX disassembly before installing. Unit test inherited from upstream is an arithmetic placeholder and is not privacy evidence. Runtime check must confirm startup, local Web UI and unchanged ADB/vendor states; sensitive data and signing material stay local. Verification results are recorded after completion. No upstream PR is created.

SDK35 was installed by the existing Google SDK manager without a new license-acceptance prompt or stdin agreement. That manager delegated to its Google Android CLI; no init/skills setup was run. Dependency resolution uses the declared Google/Maven/npm sources.

## Verified build checkpoint

`assembleDebug` succeeded with JDK17/SDK35. Privacy source regression checks pass. All 26 packaged frontend files match the frozen source bytes. All 15 DEX files were disassembled; removed report/UUID/endpoints, automatic ADB property/restart and vendor-uninstall strings are absent. Selected ADBService, ShellKano and KanoUtils methods are inert. Google aapt verifies the separate app identity, privacy initializer provider/permission, disabled boot receiver, no SMS/usage/storage/battery-exemption permission, and disabled backup. Google apksigner verifies one existing Android Debug RSA2048 signer with v2 signing.

APK SHA256: `79b06c4de54dbd6ac33f6f0411f31ecbc33b69e0209b430011a9cccac9cd254a`. Signer certificate SHA256: `26e214d29355bf8eb6a7d865ad57acc3bfb5757f3f06f84b1187bca349f47296`. Local verification records remain outside this repository; no keys, backups or private device identifiers are included. Installation and runtime checks have not yet occurred at this checkpoint.
