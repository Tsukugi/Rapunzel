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

The release build reads its signing values from `android/local.properties`.
That file is ignored by Git. Keep the keystore and passwords outside the repo.

Example:

```properties
MYAPP_UPLOAD_STORE_FILE=C:/private/rapunzel-release.jks
MYAPP_UPLOAD_STORE_PASSWORD=<store-password>
MYAPP_UPLOAD_KEY_ALIAS=<key-alias>
MYAPP_UPLOAD_KEY_PASSWORD=<key-password>
```

Check the certificate before building:

```powershell
keytool -list -v -keystore C:/private/rapunzel-release.jks
```

The certificate fingerprint must match the app already installed on devices that
will receive an update. A release APK signed with a different key cannot update
the existing app. Do not uninstall the old app to work around this; that can
remove its data.

For a test-only build, the Android debug key can be used. It is not a production
release key and must not be used for a public release.

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

After the GitHub release exists, build and upload the direct React Native code
update assets:

```powershell
npm run ota-release -- --version 0.9.1 --notes "Direct code update"
npm run ota-release -- --version 0.9.1 --upload
```

The OTA command writes `latest.json`, Android and iOS bundles, and their Metro
assets under the ignored `builds/ota/` directory. The upload command adds them
to the existing `v0.9.1` release. It does not build or install an APK.

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

If a temporary signing file was used, remove it after the build:

```powershell
Remove-Item -LiteralPath android\local.properties -Force
git status --short
```

The worktree should contain no temporary signing files or generated APKs.
