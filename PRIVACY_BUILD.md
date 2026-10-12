# UFI-TOOLS 4.1.5 privacy.2

Based on kanoqwq/UFI-TOOLS commit `cf83b815efb114ed026f06dc90550845aafbfceb` (http-server-version). Upstream author MiniKano and MIT attribution remain. This independent personal build is not a maintainer release or exhaustive security audit.

## Functional dependency and scope

The app uses a bundled ADB client connected to `localhost:5555` on the F50. ADBService tracks devices, detects disconnects and reconnects. Privileged commands use that local transport; host USB ADB alone does not provide an in-app connection. The previous privacy.1 blanket service disable was too broad and was never installed.

Privacy.2 restores ADBService/MainActivity/boot startup, connection tracking/watchdog, optional forwarding, data limits, saved schedules, AT/VoLTE settings, configured SMB maintenance, plugins, customization, backgrounds, themes and speed tests. Forwarding/data-limit flags default off, AT setters require saved per-slot flags, scheduled commands require existing user-created tasks, and recurring SMB work requires a pre-existing advanced socket/configuration. No settings are turned on to test these features. Iperf binds the existing private `192.168.0.1` address.

`ShellKano.runADB()` now contains only the requested port5555 property writes. It no longer mixes network ADB with vendor update HTTP settings, Samba enabling or root wake fallback. Starting TCP adbd and authenticating the app client still depend on the device firmware. ADB security is not disabled, and keys/authorization are not bypassed. Persistent TCP ADB can listen on all device interfaces; firewall scope cannot be assumed. No router, forwarding or firewall changes are part of installation.

## Narrow privacy changes

- Deleted KanoReport and UniqueDeviceIDManager and their startup/recurring calls. Removed developer UUID message fetches, read receipts, direct fallback and old reporting-consent gate.
- Generic proxy retains ordinary functionality but blocks the known developer report host. It is not a guarantee against arbitrary user-configured destinations.
- Promotional images use bundled assets; automatic promotional popup and remote cloud-game iframe removed.
- Original APK check/download/install endpoints and frontend updater disabled. Updates are manual through this privacy fork after review, preserving removed behavior.
- Restored saved custom HTML/plugins with a separate default-off browser opt-in before saved scripts/styles execute. Configured plugins, forwarding, backgrounds and proxies can contact user-chosen services.
- Automatic vendor removal is independent of ADB readiness. Disabled both Kotlin maintenance and bundled `samba_exec.sh` automatic removal. The separate manual frontend removal action remains, clearly identifies all six packages, and requires typing `UNINSTALL` before any operation. No package removal is authorized or tested.
- Removed automatic blanket permission/appops/battery-exemption grants from the advanced script. READ_SMS, usage and applicable legacy storage capabilities remain declared; optional native SMS/usage buttons require human action. Installation does not grant them.
- Local Web service remains authenticated and binds only `192.168.0.1:2333`, with no wildcard fallback. User must set their own strong local password/token. No credentials are collected or configured by this task. App-data backup stays disabled.

Advanced/root functions remain ordinary manual functionality, but this setup does not activate root, unlock, plugins, forwarding, schedules, band/IMEI edits, firewall/port-forwarding changes, vendor removal or extra service configuration. Static/runtime checks do not prove zero external traffic in every configuration.

## Identity and signing

Application ID `com.minikano.f50_sms.privacy`; namespace/classes `com.minikano.f50_sms`; version `4.1.5-privacy.2`; monotonic versionCode `20261013`. Separate package preserves upstream app data. Manifest components use their namespace class names, initializer/provider permissions use the privacy app ID, local broadcasts use runtime packageName and Kotlin file paths use context.filesDir. Bundled shell paths use the privacy app's directory; keepalive component uses privacy package plus original MainActivity class. Do not run both Web servers on port2333.

Build uses the existing local Android debug keystore through normal Android Gradle debug signing. No key is copied, committed or uploaded. This is debug signing, not production-release signing; future updates need the same local identity.

## Build and verification

Existing JDK17, Node/npm, Google SDK35/build-tools35 and Gradle8.9 are used. Official Gradle wrapper/distribution SHA256 are pinned. Npm dependencies come from the existing lockfile with lifecycle scripts disabled. Frontend debug/copy mode keeps packaged JavaScript inspectable.

```sh
python3 scripts/check_privacy.py
cd app/frontEnd
npm ci --ignore-scripts --no-audit --no-fund
cd ../..
JAVA_HOME=/path/to/existing/jdk17 ANDROID_HOME=/path/to/sdk sh gradlew :app:assembleDebug --no-daemon
```

Privacy.2 regression checks verify reporting removal, restored ADB/feature gates, separated ADB property helper, blocked automatic vendor/blanket grants, manual-removal guard, shell path migration, translations, script syntax and build identity. Check the APK with Google aapt/apksigner, compare packaged assets, and inspect all DEX files/selected methods before installation. The inherited arithmetic unit test is not privacy evidence. Local verification receipts contain build/APK and runtime evidence outside this source repository; no device backups, identifiers or signing secrets are published. No upstream PR is created.

## Static build result

Privacy.2 `assembleDebug` succeeded. Source regression checks and packaged frontend comparison (26 files) pass. Google aapt verifies appID, versionCode20261013 and launchable namespace class; apksigner verifies the existing RSA2048 Android Debug signer with APK v2 signing.

APK SHA256: `3add6dbd1477ae62bd11b19f9e7813628bc5efc11a4f589dbac863f6c8bda72a`. Signer certificate SHA256: `26e214d29355bf8eb6a7d865ad57acc3bfb5757f3f06f84b1187bca349f47296`.

Startup broadcast names use lazy getters to respect Android Context attachment. Compiled constructor/getter checks verify this lifecycle fix; the failed initial startup receipt is retained locally.
