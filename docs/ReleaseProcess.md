# Rapunzel release process

This is the Windows process for building and publishing a new Rapunzel version.

## Before starting

Use a clean worktree and make sure the version tag does not already exist.

```powershell
git status --short
git fetch --tags
git tag --list "v0.9.1"
```

Install dependencies if needed:

```powershell
npm i
```

## Configure the signing key

The release build must use one dedicated `release.keystore`. Keep this file
outside the public repository, for example at
`C:/private/rapunzel-release/release.keystore`. Do not commit it, add it to a
release asset, or put it in the public repository. Back it up privately for the
lifetime of the app.

Do not replace it with `debug.keystore` or generate another release key. An APK
signed with a different key cannot update an installed Rapunzel copy.

The release build reads only the signing credentials from
`android/local.properties`. That file is ignored by Git and must not be
committed.

Example:

```properties
MYAPP_UPLOAD_STORE_FILE=C:/private/rapunzel-release/release.keystore
MYAPP_UPLOAD_STORE_PASSWORD=<store-password>
MYAPP_UPLOAD_KEY_ALIAS=rapunzel-release
MYAPP_UPLOAD_KEY_PASSWORD=<key-password>
```

Check the certificate before building:

```powershell
keytool -list -v -keystore C:/private/rapunzel-release/release.keystore
```

The dedicated release certificate fingerprint is:

```text
34:64:EA:F9:60:01:D4:18:19:89:91:87:F9:87:37:09:12:03:B3:38:22:1A:D8:EA:7E:B2:5A:44:7B:AF:CB:2C
```

Compare this fingerprint with every release APK before distributing it. A
release APK signed with a different key cannot update the existing app. Do not
uninstall the old app to work around this; that can remove its data.

The committed `debug.keystore` is not a release key and must never be used for
a release or OTA-compatible APK.

## Run checks

Run the focused release tests first, then the full test suite:

```powershell
npm test -- --runInBand scripts/__tests__/release.test.ts scripts/__tests__/release-github.test.ts
npm test -- --runInBand
npm run lint
npx tsc --noEmit
```

Record any existing lint or TypeScript failures. Do not ignore a new failure in
the release scripts.

## Log in to GitHub

Install GitHub CLI once, then log in:

```powershell
& "C:\Program Files\GitHub CLI\gh.exe" auth login
& "C:\Program Files\GitHub CLI\gh.exe" auth status
$env:Path = "C:\Program Files\GitHub CLI;$env:Path"
```

## Build and publish

Replace `0.9.1` with the new version:

```powershell
npm run release -- --version 0.9.1 --github
```

The script will:

1. Update `package.json`, `package-lock.json`, and Android `versionName`.
2. Increase Android `versionCode` by one.
3. Run the Windows Gradle release build.
4. Move the APK to `builds/Rapunzel-0.9.1.apk`.
5. Commit and push the release metadata.
6. Create GitHub tag `v0.9.1` and upload the APK asset.

Do not run the command a second time after success. It will increase
`versionCode` again, and the GitHub tag already exists.

If the build should not publish yet, omit `--github`:

```powershell
npm run release -- --version 0.9.1
```

Then publish the existing APK later:

```powershell
npm run release-github -- --version 0.9.1
```

After the GitHub release exists, build and upload one direct React Native code
update ZIP per platform:

```powershell
npm run ota-release -- --version 0.9.1 --notes "Direct code update"
npm run ota-release -- --version 0.9.1 --upload
```

The OTA command writes `latest.json`, one Android ZIP, and one iOS ZIP under
the ignored `builds/ota/` directory. The upload command adds those three files
to the existing release. It does not build or install an APK.

The Android OTA bundle is compiled with the React Native Hermes compiler from
`node_modules/react-native/sdks/hermesc`, matching the Hermes format used by
the release APK. Do not upload a plain Metro Android bundle.

## Verify the release

Check the release and asset:

```powershell
gh release view v0.9.1 --repo Tsukugi/Rapunzel --json url,assets
Get-FileHash -Algorithm SHA256 builds\Rapunzel-0.9.1.apk
```

The local hash must match the GitHub asset digest. The APK is intentionally not
committed to Git.

Check the APK certificate:

```powershell
keytool -printcert -jarfile builds\Rapunzel-0.9.1.apk
```

## Check an Android device

List connected devices:

```powershell
adb devices -l
```

For an emulator or device that has the same certificate, install with:

```powershell
adb -s <serial> install -r builds\Rapunzel-0.9.1.apk
```

If you need the installed app certificate, pull the installed APK temporarily:

```powershell
$serial = "<serial>"
$remote = (adb -s $serial shell pm path com.rapunzel).Trim().Replace("package:", "")
$tempApk = Join-Path $env:TEMP "rapunzel-installed.apk"
adb -s $serial pull $remote $tempApk
keytool -printcert -jarfile $tempApk
Remove-Item -LiteralPath $tempApk -Force
```

Compare that fingerprint with the new APK before installing. If they differ,
stop and find the original release keystore.

## Clean up

Keep the private `release.keystore` and local credentials available for the
next release. Do not delete or replace the keystore.

`android/local.properties` remains ignored and must not be committed. Confirm
the local credentials are ignored and no release keystore is tracked:

Check the worktree after the build:

```powershell
git check-ignore -v android/local.properties
git ls-files | Select-String 'release\.keystore'
git status --short
```

Generated APKs should remain outside Git.
