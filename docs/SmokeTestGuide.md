# Smoke-test runbook

Use this with [SmokeTest.md](SmokeTest.md). Smoke tests must use APK installed
on emulator. Metro or older installed APK is not evidence for current checkout.

## Prepare local siblings

Rapunzel uses local links. These directories must exist beside Rapunzel:

```text
G:\dev\Rapunzel
G:\dev\AmagiChan
G:\dev\Lilith
G:\dev\LilithHentag
G:\dev\LilithMangaDex
G:\dev\LilithNHentai
```

Build NH package first because its entry points to `dist`:

```powershell
Set-Location G:\dev\LilithNHentai
npm test -- --runInBand
npm run build
```

Then install Rapunzel dependencies:

```powershell
Set-Location G:\dev\Rapunzel
npm ci --ignore-scripts
```

Do not remove sibling links. Metro watches them through `metro.config.js`.

## Build and deploy

```powershell
Set-Location G:\dev\Rapunzel\android
.\gradlew.bat --no-daemon --console=plain assembleEmulator
Set-Location G:\dev\Rapunzel
adb devices
adb install -r android\app\build\outputs\apk\emulator\app-emulator.apk
adb shell pm clear com.rapunzel       # clean run only
adb shell monkey -p com.rapunzel 1
```

Record APK path, version, Git commit, emulator, and date in `SmokeTest.md`.
Use `app-debug.apk` when debug-only `RapunzelLog` output is needed; those logs
are suppressed when app debug config is off.

## Capture evidence

```powershell
adb logcat -c
adb logcat -d -s ReactNativeJS:* AndroidRuntime:E
adb shell uiautomator dump /sdcard/window.xml
adb shell cat /sdcard/window.xml
```

Save a screenshot for each failed or blocked step. Keep command output, query,
repository, and HTTP status with the test record.

## Pagination test

Use this sequence for Feed and Browse:

1. Record first visible card title and position.
2. Scroll near end once. Wait for loading to finish.
3. Confirm new cards append in API order.
4. Confirm recorded card stays at same screen position.
5. Scroll again only after append finishes. Confirm another page can load.
6. Scroll fast while loading. Confirm no duplicate cards or repeated requests.

Pass condition: list grows below current viewport. It must not reset to top,
jump to a new offset, or grow without another end-of-list crossing.

List restores saved offset once on mount, then leaves native offset uncontrolled.
Stable entry IDs are required for React row identity. Debug logs are
`[getLatestBooks]` for Feed and `[loadSearch]` for Browse.

For a code bug, add a focused failing test before changing code. Run that test
after the fix, then run the full app suite. Current focused examples are
`__tests__/virtualList.test.tsx`, `__tests__/loader.test.ts`,
`__tests__/cacheExtra.test.ts`, and `__tests__/search.test.tsx`.

## NH image test

NH v2 list records provide thumbnail paths. Mapper replaces filename segment
`thumb` with `cover` and preserves compound suffixes:

```text
thumb.webp     -> cover.webp
thumb.jpg.webp -> cover.jpg.webp
```

List covers use `t.nhentai.net`; reader pages use API paths on `i.nhentai.net`.
Failed covers must show thumbnail fallback or `No cover`, never a fake local URI
or an endless retry.

## Blocked-source rules

-   `/api/v2/...` supports feed, search, book, and reader data.
-   NH HTML can return HTTP 451 from a regional block.
-   Old `/api/...` can return HTTP 403 with a v2 migration message.
-   WebView clearance can help with a real Cloudflare challenge, not HTTP 451.

Mark a step `BLOCKED` only with this evidence. Do not call an empty result a
passing feed.

## Finish and commit

```powershell
Set-Location G:\dev\Rapunzel
git diff --check
npx jest --config jest.config.ts --runInBand --testPathIgnorePatterns scripts
git status --short
```

Review Rapunzel and each changed sibling repo separately. A Rapunzel commit
does not contain files from sibling repos; sibling changes need their own
commit.
