# Rapunzel resolved backlog

This file records backlog items that were completed. Keep the history concise and do not delete resolved items unless they were recorded by mistake.

## Resolved items

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
