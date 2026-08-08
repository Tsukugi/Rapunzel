# Rapunzel resolved backlog

This file records backlog items that were completed. Keep the history concise and do not delete resolved items unless they were recorded by mistake.

## Resolved items

### BL-017: Keep header search within the appbar height

- Status: resolved
- Added: 2026-08-08
- Resolved: 2026-08-08
- Source: user report and focused reproduction test
- Problem or goal: The expanded header search field could fill the whole appbar with inconsistent vertical spacing, overflow the available header height, and render query text above the field center.
- Resolution: The search container now fills the appbar row and centers a fixed 48dp search field. The internal text input minimum height and vertical padding are disabled, with Android text alignment explicitly centered.
- Verification: Focused regression tests failed before each layout fix and passed afterward. Focused search/header tests passed (4 tests), the full Jest suite passed (32 suites, 137 tests), the release APK built and updated the same-signed emulator package, and live emulator screenshots confirmed centered field/text plus successful close interaction without fatal errors. The Android and iOS OTA tests passed, both archives and the Hermes bundle were verified, and the public v0.9.8 manifest plus APK and OTA downloads returned HTTP 200 with matching sizes and SHA-256 hashes. The follow-up type cleanup passes `npx tsc --noEmit` and repository lint with zero errors or warnings. The v0.9.9 release APK was rebuilt from the final cleanup state, installed over v0.9.8 on emulator `emulator-5554` and device `42adce68`, launched to `com.rapunzel/.MainActivity`, and showed no React Native redbox or fatal startup exception. The public v0.9.9 manifest and APK/Android OTA/iOS OTA downloads returned HTTP 200 with matching byte counts and SHA-256 hashes.

### BL-016: Stabilize reader fast scrolling

- Status: resolved
- Added: 2026-08-08
- Resolved: 2026-08-08
- Source: user request and focused reproduction test
- Problem or goal: Fast scrolling in the reader could make variable-height image pages jump and temporarily render in a disordered layout while the native virtualized list measured them.
- Resolution: Reader pages now provide deterministic `VirtualizedList` item lengths and cumulative offsets from their fitted image dimensions. Pages without source dimensions use the same existing fallback ratio, so the native list can jump to a fast-scroll target without estimating row positions while images render.
- Verification: The focused reproduction test failed before the change and passed after it. Reader layout, reader wiring, virtual-list, and image sizing suites passed (11 tests); the full Jest suite passed (32 suites, 136 tests). The release APK built successfully and installed as version 0.9.8/versionCode 14 on emulator `Medium_Phone_API_35` at 1080x2400. The Reader survived 8 fast flings, a 20-swipe burst, and 12 alternating down/up pairs. The immediate and 3-second-settled final screenshots were pixel-identical (0 differing pixels), with no AndroidRuntime or ReactNativeJS errors. The physical Xiaomi phone was also started successfully, but its ADB tap/swipe injection remains blocked.

### BL-014: Publish the OTA manifest with the Android release

- Status: resolved
- Added: 2026-08-06
- Resolved: 2026-08-06
- Source: user-reported manifest 404 and release asset verification
- Problem or goal: Release v0.9.7 contained the APK but not `latest.json`, so the updater manifest URL returned HTTP 404.
- Resolution: Built the 0.9.7 Android Hermes and iOS OTA bundles, generated the schema 2 manifest, and uploaded `latest.json` plus both platform archives to the existing GitHub release.
- Verification: The manifest URL returns HTTP 200 and parses as Android/iOS version 0.9.7. Both archive URLs return HTTP 200, and the release lists all four assets with matching SHA-256 values.

### BL-013: Stop reader header flicker

- Status: resolved
- Added: 2026-08-06
- Resolved: 2026-08-06
- Source: user report and focused reproduction tests
- Problem or goal: The reader header reappeared during progressive page loading and alternated visibility when native scroll offsets jittered by a few pixels.
- Resolution: The header now starts hidden, ignores scroll deltas below 8 pixels, appears only after meaningful upward movement, hides on meaningful downward movement, and still auto-hides after three seconds. Reader image updates no longer reset header visibility because the focus refresh callback is stable and no longer changes a header reset key.
- Verification: Focused reader and header visibility suites passed (5 tests). Focused ESLint passed with no errors, `git diff --check` passed, and the full Jest suite passed (31 suites, 132 tests). Repository-wide lint and TypeScript checks retain existing unrelated diagnostics.

### BL-012: Show newly fetched feed entries at the top

- Status: resolved
- Added: 2026-08-06
- Resolved: 2026-08-06
- Source: user report and focused regression test
- Problem or goal: Main-menu feed refreshes could fetch page one but append new
  entries after the cached list, making fresh books appear to be missing.
- Resolution: Page-one revalidation now places the API order before retained
  entries, while later pages still append. The main feed now follows the
  store's rendered order for both latest and trending images.
- Verification: Focused loader and main-feed lifecycle tests passed (15 tests),
  including a two-fetch regression case that reproduces the stale-looking
  order.

### BL-011: Make Android OTA bundles match the Hermes release format

- Status: resolved
- Added: 2026-08-04
- Resolved: 2026-08-04
- Source: user report and focused OTA artifact check
- Problem or goal: The Android OTA archive carried plain Metro source while
  the release APK carried Hermes bytecode, so the first updated startup could
  fail and roll back to the embedded bundle.
- Resolution: Android OTA generation now compiles the bundle with the
  repository Hermes compiler. Android archive extraction also rejects a
  non-Hermes bundle before activation.
- Verification: Focused OTA tests and the full Jest suite passed (30 suites,
  127 tests). Release `v0.9.6` contains one Android ZIP whose bundle starts
  with the Hermes bytecode header. On Xiaomi device `42adce68`, a same-signed
  0.9.4 baseline downloaded the exact GitHub v0.9.6 ZIP, started the OTA
  bundle without a Hermes or script-load error, marked it current, and started
  successfully again after a clean force-stop.

### BL-010: Publish direct release 0.9.5

- Status: resolved
- Added: 2026-07-27
- Resolved: 2026-07-27
- Source: user request and release verification
- Problem or goal: Publish the next directly distributed Rapunzel APK using
  the single-ZIP OTA format.
- Resolution: Bumped the app to version 0.9.5 and Android versionCode 11,
  built the signed APK, created GitHub release `v0.9.5`, and uploaded one
  Android OTA ZIP, one iOS OTA ZIP, and `latest.json` using manifest schema 2.
- Verification: The APK certificate matches the private release fingerprint.
  Both ZIPs contain their required platform bundle, their local hashes and
  byte counts match `latest.json`, and GitHub release `v0.9.5` has exactly
  four assets with all four remote SHA-256 digests matching the local files.

### BL-009: Package OTA updates as one ZIP per platform

- Status: resolved
- Added: 2026-07-27
- Resolved: 2026-07-27
- Source: user request
- Problem or goal: GitHub releases contained a separate asset for every Metro
  bundle file, making OTA releases unnecessarily noisy.
- Resolution: Added manifest schema 2 with one archive per platform. The
  release tool creates Android and iOS ZIP files, while the updater verifies
  and extracts one archive with safe-path, entry-count, and expanded-size
  checks before activation. Published the ZIP-aware transition APK as release
  `v0.9.4`.
- Verification: Full Jest passed (30 suites, 125 tests), focused OTA tests
  passed (18 tests), OTA-specific lint passed, the Android release APK built
  and verified with versionCode 10 and the private release certificate, and
  GitHub release `v0.9.4` contains exactly four assets with zero manifest
  digest mismatches.

### BL-008: Publish direct release 0.9.3

- Status: resolved
- Added: 2026-07-27
- Resolved: 2026-07-27
- Source: user request and release verification
- Problem or goal: Publish the next directly distributed Rapunzel APK and its
  React Native code update while retaining the private release signing key.
- Resolution: Bumped the app to version 0.9.3 and Android versionCode 9, built
  the release APK with the private release certificate, created GitHub release
  `v0.9.3`, and uploaded the Android and iOS OTA bundles plus their Metro
  assets. Fixed the OTA runner so it waits for bundle output to stabilize
  before creating manifest hashes.
- Verification: The APK reports package `com.rapunzel`, versionCode 9, and
  versionName 0.9.3. Its certificate matches the private release fingerprint.
  The online release has 30 assets, all 29 manifest files are present, the
  manifest has zero digest mismatches, and the APK digest matches GitHub.
  Focused OTA tests passed (5 tests), and the full Jest suite passed (29
  suites, 123 tests).

### BL-007: Use a private release signing keystore

- Status: resolved
- Added: 2026-07-26
- Resolved: 2026-07-26
- Source: user request
- Problem or goal: Release APKs must not use the committed debug keystore, while
  the private release key must remain stable so directly installed APKs can be
  replaced by future releases.
- Resolution: Generated a new private `release.keystore` outside the public
  repository, configured release signing to read its path and credentials from
  ignored `android/local.properties`, and kept debug and emulator variants on
  the debug key. Release Gradle tasks now fail when the private signing values
  are missing instead of falling back to debug signing. Documented the required
  private keystore and its fingerprint in the release and OTA documentation.
- Verification: `assembleRelease` passed. The resulting APK was verified with
  `apksigner` and has certificate SHA-256 fingerprint
  `34:64:ea:f9:60:01:d4:18:19:89:91:87:f9:87:37:09:12:03:b3:38:22:1a:d8:ea:7e:b2:5a:44:7b:af:cb:2c`.
  The private keystore and `android/local.properties` are not tracked by Git;
  the installable APK is ignored under `builds/`.

### BL-005: Add OTA React Native bundle updater

- Status: resolved
- Added: 2026-07-26
- Resolved: 2026-07-26
- Source: user request
- Problem or goal: Directly distributed Rapunzel builds need to download and
  activate new React Native code without installing a new APK or IPA.
- Resolution: Added Android and iOS native bundle selection with a versioned,
  app-private OTA directory, pending activation, startup-attempt tracking, and
  fallback to the embedded or last known-good bundle. Added manifest parsing,
  HTTPS downloads, byte-count and SHA-256 verification, atomic activation,
  Settings update controls, and a Metro release command that writes GitHub
  Release metadata for both platforms and their assets.
- Verification: Focused OTA/App tests passed (16 tests), the full Jest suite
  passed (29 suites, 122 tests), Android Java compilation passed, the real OTA
  release command generated both bundles plus 15 Android and 11 iOS asset
  files and `latest.json`, updater-specific ESLint and `git diff --check`
  passed, and generated output was removed. iOS build verification requires
  macOS/Xcode. Repository-wide lint and TypeScript checks still report
  pre-existing unrelated diagnostics. Published release `v0.9.2` was verified
  with 30 assets: the APK, `latest.json`, and all 28 manifest files. The local
  APK SHA-256 matched GitHub: `4e3254f1bfcd757af8e81b43e34031ea6c7f10f0bdb49e5e7a8c3af2977a646e`.

### BL-006: Replace drawer repository covers with mascots

- Status: resolved
- Added: 2026-07-26
- Resolved: 2026-07-26
- Source: user request
- Problem or goal: The drawer used remote manga cover/page images instead of a consistent repository identity for each Lilith repository.
- Resolution: Added three original adult anime reader mascots with glasses, inspired by the requested Taihou mood without copying her design. Each mascot now uses a full-bleed palette associated with its repository instead of the Rapunzel icon background: charcoal/coral for NHentai, orange/charcoal/cream for MangaDex, and moss/gray/charcoal for E-Hentai. Mapped each `LilithRepo` value to its bundled mascot for both drawer image placements.
- Verification: Inspected all three regenerated PNGs, confirmed 512px output and no app-icon background, passed the focused repository mascot Jest and ESLint checks, passed the full Jest suite (27 suites, 117 tests), and installed/launched `com.rapunzel` on Xiaomi device `42adce68`. The repository-wide lint and TypeScript commands still report pre-existing unrelated diagnostics.

### BL-004: Hide the WebView drawer item

- Status: resolved
- Added: 2026-07-26
- Resolved: 2026-07-26
- Source: user request
- Problem or goal: The WebView is no longer needed as a user-facing destination and should not be shown in the drawer.
- Resolution: Removed the WebView drawer options while keeping its registered route available for the existing internal clearance flow.
- Verification: Reviewed the drawer navigator logic confirming routes without `viewDrawerOptions` receive `display: none` for their drawer item.

### BL-003: Prevent default header search overflow

- Status: resolved
- Added: 2026-07-26
- Resolved: 2026-07-26
- Source: user report and focused layout test
- Problem or goal: The expanded search field reserved a fixed minimum width and then became too small after that width was removed because an empty header content item consumed the remaining space.
- Resolution: Replaced the fixed search width with a shrinkable flex container and removed the empty header content spacer while search is shown, so the search field owns the available middle area.
- Verification: The focused search and header layout tests passed, the full Jest suite passed (23 suites, 102 tests), and the phone UI hierarchy showed the search field expanded from 90px to 472px while staying inside the header bounds.

### BL-002: Reader controls and display settings

- Status: resolved
- Added: 2026-07-26
- Resolved: 2026-07-26
- Source: user request
- Problem or goal: Reader pages had no reader-specific controls, alternate page navigation, or image fit choices.
- Resolution: Added a fixed reader header that appears on upward scroll and hides on downward scroll or after three seconds. The header shows the book title, save/unsave, and reader settings. Reader settings now persist scroll or single-page navigation plus width, height, or automatic image fitting. Single-page mode uses invisible left and right tap areas for page navigation. A phone smoke check found that positioning Paper's Appbar.Header directly made its wrapper zero-sized, so the header now uses a measurable absolute overlay wrapper.
- Verification: Focused reader, reader-header-layout, image-fit, storage, pinchable-image, and virtual-list tests passed; full Jest suite passed (24 suites, 103 tests). The physical phone loaded the reader and 54 pages without React Native or Android errors; Xiaomi ADB input blocked the final manual scroll gesture.

### BL-001: Confirm and show progress for settings actions

- Status: resolved
- Added: 2026-07-26
- Resolved: 2026-07-26
- Source: user request and UX review
- Problem or goal: Important settings actions did not consistently ask for confirmation or show progress while they ran.
- Resolution: Added confirmation dialogs for import, library migration, and both cache-clearing actions. Added loading and disabled states, result messages, cache-size failure feedback, disabled cache selectors during actions, and theme-aware Danger Zone styling. Cache cleanup now reports failures instead of silently treating them as success.
- Verification: Focused `cacheScreen` tests passed; full Jest suite passed with 19 suites and 92 tests. Source checks for the changed settings components passed. Repository-wide lint and TypeScript checks still contain pre-existing errors.

## Item format

Move completed items here from [backlog.md](backlog.md) and preserve their original ID. Add the completion date and a short description of the cause and resolution.

```md
### BL-000: Short title

- Status: resolved
- Added: YYYY-MM-DD
- Resolved: YYYY-MM-DD
- Source: issue, investigation, user request, or test
- Problem or goal: What needed to change and why.
- Resolution: What changed and why it fixes the item.
- Verification: Tests, checks, or manual validation used.
```
