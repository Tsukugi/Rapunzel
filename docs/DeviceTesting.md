# Android emulator and device testing

Use this guide when testing Rapunzel on Android. Use the target serial on
every `adb` command. This prevents commands from going to the wrong device.

## Find the target

```powershell
adb devices -l
```

Example targets:

```text
emulator-5554   Android emulator
42adce68        physical Xiaomi phone
```

Set a target in PowerShell to make commands shorter:

```powershell
$serial = "emulator-5554"
```

Then use `-s $serial`:

```powershell
adb -s $serial shell getprop ro.build.version.release
```

The target must be in the `device` state. If it is `unauthorized`, unlock the
phone and accept the USB debugging prompt.

## Build and install the app

Build the bundled emulator APK from the repository root:

```powershell
Set-Location android
.\gradlew.bat --no-daemon --console=plain assembleEmulator
Set-Location ..
```

Install the current APK on the selected target:

```powershell
adb -s $serial install -r android\app\build\outputs\apk\emulator\app-emulator.apk
```

Check the installed version:

```powershell
adb -s $serial shell dumpsys package com.rapunzel | Select-String "versionName|versionCode|lastUpdateTime"
```

Start the app:

```powershell
adb -s $serial shell am force-stop com.rapunzel
adb -s $serial shell monkey -p com.rapunzel 1
```

Use `pm clear` only for a clean test. It removes the app's local data and
cached settings:

```powershell
adb -s $serial shell pm clear com.rapunzel
```

## Control an emulator

The emulator normally accepts ADB input. Coordinates are in screen pixels.
For the `emulator-5554` target:

```powershell
adb -s emulator-5554 shell input tap 500 900
adb -s emulator-5554 shell input swipe 500 1200 500 300 500
adb -s emulator-5554 shell input keyevent 4       # Back
adb -s emulator-5554 shell am force-stop com.rapunzel
```

Capture the emulator screen directly to the host:

```powershell
adb -s emulator-5554 exec-out screencap -p > screen.png
```

For a UI tree, use:

```powershell
adb -s emulator-5554 shell uiautomator dump /sdcard/window.xml
adb -s emulator-5554 pull /sdcard/window.xml .\window.xml
```

The UI tree is useful for checking image bounds, visible text, and scrollable
containers. The screenshot is the source of truth for visual layout.

## Control a physical phone

Install and capture a physical phone the same way, but use its own serial:

```powershell
$serial = "42adce68"
adb -s $serial install -r android\app\build\outputs\apk\emulator\app-emulator.apk
adb -s $serial exec-out screencap -p > phone-screen.png
adb -s $serial shell uiautomator dump /sdcard/phone-window.xml
adb -s $serial pull /sdcard/phone-window.xml .\phone-window.xml
```

ADB input works on many phones, but some vendors block it. A Xiaomi phone can
return this error:

```text
SecurityException: Injecting input events requires ... INJECT_EVENTS permission
```

When this happens:

1. Do not change phone security settings to bypass the error.
2. Capture the screen and UI tree with ADB.
3. Ask the tester to tap or swipe the phone itself.
4. Capture the next state with ADB.

Do not assume that a failed tap changed the screen. Check a new screenshot
after every attempted action.

## Reader visual check

After installing the current APK:

1. Open a book and enter Reader.
2. Capture the screen.
3. Confirm the first page starts at the left edge or has only the expected
   small margin.
4. Confirm the page width reaches the right edge. The image should be readable
   without pinching first.
5. Scroll to the next page and confirm pages stay in source order.
6. Check that failed downloads do not move later pages into the wrong slot.
7. If a page is blank, check the source image URL before changing the app. A
   source file can be a valid, all-white image.

For a deployed check, keep these files together:

```text
screen.png
window.xml
logcat.txt
```

Also record the target serial, APK version, book ID, chapter ID, page number,
and source URL for any bad page.

## Logs and failure evidence

```powershell
adb -s $serial logcat -c
adb -s $serial logcat -d -s ReactNativeJS:* AndroidRuntime:E > logcat.txt
```

For each failure, save a screenshot and UI tree before restarting the app.
Record whether the failure was a download error, a source-image problem, a
layout problem, or an input-control problem.
