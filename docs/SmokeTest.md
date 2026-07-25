# Rapunzel smoke test

Use this checklist on a deployed Android APK in an emulator. It checks the main user flows and the features exposed by the app.

Run [SmokeTestGuide.md](SmokeTestGuide.md) first for local sibling setup, APK
deployment, log capture, pagination checks, and NH image/API notes.

## Test record

Fill this in before starting:

| Field                            | Value |
| -------------------------------- | ----- |
| APK version                      |       |
| Git commit                       |       |
| Emulator name / Android version  |       |
| Repository used for the main run |       |
| Search text                      |       |
| Multi-chapter book used          |       |
| Test date                        |       |
| Tester                           |       |

## Deployment gate

Run this gate before any feature step. Stop the run if a gate item fails.

-   [ ] Install dependencies from the checked-in lockfile with `npm ci`.
-   [ ] Build the APK from the same checkout under test.
-   [ ] Install that APK on the emulator.
-   [ ] Confirm the installed package is `com.rapunzel`.
-   [ ] Confirm the installed version matches the APK under test. Do not use an older installed APK as evidence for this run.
-   [ ] Confirm `adb devices` shows one target emulator in the `device` state.
-   [ ] Record the APK version, Git commit, emulator name, and Android version above.

If the build or install gate fails, mark the run **BLOCKED** and record the exact command output. Do not continue with feature results.

## Pass rules

-   Mark a step **PASS** only when the expected result is visible in the deployed app.
-   Mark a step **FAIL** when the app crashes, shows a blank screen, gets stuck loading, loses saved data, or shows the wrong result.
-   Mark a step **BLOCKED** only when an external dependency is unavailable. Record the exact reason and evidence.
-   Record a screenshot and the app log for every failed or blocked step.
-   Do not silently skip a step. If a live repository has no usable result, record the query, repository, and response as evidence.

## Preconditions

-   [ ] A release or deployed debug APK is installed on the emulator.
-   [ ] The emulator has internet access and enough free storage.
-   [ ] Android back and touch input work.
-   [ ] A test query returns at least one book in the selected repository.
-   [ ] One test book has more than one chapter. Use a second book with one chapter if one is available.
-   [ ] The test user can access the Android file picker for import/export checks.
-   [ ] For the EHentai check, the emulator can reach the configured Zenith server at `192.168.0.248:1313`.

## A. Install, launch, and basic navigation

### A1. Clean launch

1. Clear app data or install the APK on a clean emulator.
2. Launch Rapunzel.

Expected:

-   The app opens without a crash or red error screen.
-   The main screen is **Feed**.
-   The header and menu button are visible.
-   Feed loading finishes or shows a clear network error; there is no endless spinner.

Result: ____  Notes: ______________________________

### A2. Drawer navigation

Open the drawer and visit each item once:

-   [ ] Feed
-   [ ] Browse
-   [ ] Library
-   [ ] Settings
-   [ ] Reader
-   [ ] WebView

Expected for every item:

-   The selected screen opens without a crash.
-   The header is present where expected.
-   The Reader screen can be empty before a chapter is opened, but it must not crash.

Result: ____  Notes: ______________________________

### A3. Header actions

-   [ ] Tap the menu icon and confirm the drawer opens.
-   [ ] On a screen with search, tap the search icon. Confirm the search field opens.
-   [ ] Close the search field. Confirm the header returns to its normal state.
-   [ ] Open the three-dot menu. Confirm **Toggle Theme** and **Settings** are shown.
-   [ ] Tap **Toggle Theme**. Confirm the colors change. Tap it again to restore the prior theme.
-   [ ] Tap **Settings** in the three-dot menu. Confirm Settings opens.
-   [ ] On Chapter Select, confirm the header back button returns to the previous screen.

Result: ____  Notes: ______________________________

## B. Feed

### B1. Feed content

1. Open **Feed**.
2. Wait for loading to finish.

Expected:

-   A **Trending** row is shown when trending data is available.
-   Latest book cards are shown when latest data is available.
-   Cards show covers, language markers, and titles.
-   A failed cover does not crash the screen; a fallback cover or **No cover** view is shown.

Result: ____  Notes: ______________________________

### B2. Feed refresh and pagination

-   [ ] Pull down to refresh Feed. Confirm the list refreshes and the app stays responsive.
-   [ ] Scroll near the end of the latest list. Confirm another page loads once, appends in API order, and does not duplicate cards.
-   [ ] Before the page finishes, note the title at the top of the viewport. After append, confirm the same title stays at the same screen position; content grows below the current viewport instead of jumping or resetting scroll height.
-   [ ] Continue scrolling to the end. Confirm another page loads or a clear no-more-results state is shown.
-   [ ] Scroll quickly while a page is loading. Confirm duplicate requests do not make the list corrupt or crash.

Result: ____  Notes: ______________________________

### B3. Feed book actions

-   [ ] Tap a book with one chapter. Confirm the app loads the chapter and opens Reader.
-   [ ] Return to Feed.
-   [ ] Tap a book with more than one chapter. Confirm Chapter Select opens.
-   [ ] Long-press a book for about three seconds. Confirm the book is saved and the card shows the **Saved** marker.

Result: ____  Notes: ______________________________

## C. Browse and search

### C1. Search from the header

1. Open **Browse** or use the search field from Feed.
2. Enter the recorded test query.
3. Submit the search.

Expected:

-   Search loading is visible while the request is active.
-   Browse opens when the search starts from another screen.
-   Matching result cards appear in stable API order.
-   Each result has a usable cover, fallback cover, or **No cover** view.

Result: ____  Notes: ______________________________

### C2. Browse pagination and actions

-   [ ] Scroll near the end. Confirm the next search page loads once and appends without duplicate or reordered cards.
-   [ ] Note the top visible result before append. Confirm it remains anchored after append and the list does not jump, reset, or grow by repeatedly loading pages without another scroll.
-   [ ] Tap a result and confirm it follows the expected one-chapter or Chapter Select flow.
-   [ ] Long-press a result and confirm it is saved to Library.
-   [ ] Run a query that should return no results. Confirm the app stays usable and does not crash.

Result: ____  Notes: ______________________________

## D. Chapter Select and Reader

### D1. Chapter Select

1. Open Chapter Select using the recorded multi-chapter book.

Expected:

-   The cover, title, author, tags, and available languages are visible.
-   The chapter list is visible.
-   Chapter rows show language and chapter information.
-   Selecting a chapter opens Reader.
-   Scrolling to the end loads more chapters when more chapters exist.

Result: ____  Notes: ______________________________

### D2. Reader

-   [ ] Confirm chapter pages appear as images.
-   [ ] Scroll through the first several pages. Confirm images load progressively.
-   [ ] Confirm the reader remains responsive while pages load.
-   [ ] Pull to refresh. Confirm the reader remains usable and does not clear valid pages unexpectedly.
-   [ ] Use the header/drawer navigation to leave Reader and return to Feed.

Result: ____  Notes: ______________________________

## E. Library

### E1. Save, reload, and open

-   [ ] Open Library and confirm the saved book is present.
-   [ ] Close and relaunch the app without clearing app data.
-   [ ] Open Library again. Confirm the saved book is still present.
-   [ ] Tap the saved book. Confirm it opens Chapter Select or Reader as appropriate.

Result: ____  Notes: ______________________________

### E2. Library search

Use the Library search field with text from the saved book title, author, and one tag.

-   [ ] Title text filters to the matching book.
-   [ ] Author text filters to the matching book.
-   [ ] Tag text filters to the matching book.
-   [ ] Clear the search. Confirm the full saved list returns.
-   [ ] Use text that matches nothing. Confirm the screen shows no matching book and does not show stale results.

Result: ____  Notes: ______________________________

### E3. Remove from Library

-   [ ] Long-press the saved book.
-   [ ] Confirm the book is removed from the Library list.
-   [ ] Relaunch the app and confirm the book is still removed.

Result: ____  Notes: ______________________________

## F. Settings and cache

Open **Settings** and expand both accordions.

### F1. App settings

-   [ ] Toggle **Enable debug app**. Leave and reopen Settings. Confirm the value persists.
-   [ ] Toggle **Enable cache**. Leave and reopen Settings. Confirm the value persists.
-   [ ] Toggle **Use Fallback extensions**. Leave and reopen Settings. Confirm the value persists.
-   [ ] Open **Repository**. Confirm the available choices are NHentai, MangaDex, and EHentai.
-   [ ] Select a different repository. Confirm the selected value persists after leaving and reopening Settings.

Restore the repository used for the main run after this check.

Result: ____  Notes: ______________________________

### F2. Cache controls

Open **Library and Temporary Cache**.

-   [ ] Confirm the current library book count is shown.
-   [ ] Open **Library Images Cache location** and select a valid location.
-   [ ] Open **Temporary Images Cache location** and select a valid location.
-   [ ] Tap **Calculate Cache Size**. Confirm both cache sizes finish with numeric values.
-   [ ] Confirm the cache-size action does not freeze the screen.

Result: ____  Notes: ______________________________

### F3. Cache danger-zone actions

Run these only after the save, reader, and export checks are complete:

-   [ ] Long-press **Clear Temp Images Storage**. Confirm the action finishes without a crash.
-   [ ] Long-press **Clear Library Images Storage**. Confirm the action finishes without a crash.
-   [ ] After clearing, open Library and confirm library metadata is still present unless the test intentionally removed it; only image files should be cleared.
-   [ ] Long-press **Update Library to 0.6.12+ structure** on a test library. Confirm the action finishes without a crash.

Result: ____  Notes: ______________________________

## G. Library JSON import and export

1. Save at least one book.
2. Open Settings > Library and Temporary Cache.
3. Tap **Export Library as JSON**.

Expected:

-   The action finishes without a crash.
-   A JSON file is created in the device download area under `RapunzelMigration`.

4. Remove the saved book from Library.
5. Tap **Import Library from JSON**.
6. Select the exported JSON file.

Expected:

-   The book returns to Library.
-   The app remains usable after the file picker closes.
-   Relaunching the app keeps the imported book.

Result: ____  Notes: ______________________________

## H. WebView and NHentai clearance

Run this section when the selected repository is NHentai or when an API request returns 403.

### H1. Direct WebView

-   [ ] Open **WebView**. Confirm the configured site loads inside the app.
-   [ ] Confirm navigation inside the WebView does not crash the app.
-   [ ] Confirm the WebView can receive a cookie and user-agent update without closing unexpectedly.
-   [ ] With debug enabled, confirm an update message can appear as a snackbar.

Result: ____  Notes: ______________________________

### H2. Clearance flow

1. Start a Feed, Browse, or book request that needs clearance.
2. If a 403 occurs, confirm a message asks the user to refresh cookies and solve the challenge in WebView.
3. Solve the challenge in WebView.

Expected:

-   The app stores the refreshed cookie and user-agent.
-   The app validates the headers with a small request.
-   The app shows a header-refresh message.
-   The app returns to the screen that started the flow.
-   The original request can be tried again without a crash.

Result: ____  Notes: ______________________________

## I. Repository matrix

Run at least Feed, Browse search, book open, Reader, and Library save for each repository that is available in the test environment.

| Repository | Feed     | Search   | Book / reader | Save / library | Notes                                          |
| ---------- | -------- | -------- | ------------- | -------------- | ---------------------------------------------- |
| NHentai    | \_\_\_\_ | \_\_\_\_ | \_\_\_\_      | \_\_\_\_       | WebView clearance may be required              |
| MangaDex   | \_\_\_\_ | \_\_\_\_ | \_\_\_\_      | \_\_\_\_       |                                                |
| EHentai    | \_\_\_\_ | \_\_\_\_ | \_\_\_\_      | \_\_\_\_       | Requires Zenith server at `192.168.0.248:1313` |

## J. Persistence and offline smoke check

Run this after Feed has loaded once and a book is saved.

-   [ ] Force-stop and relaunch the app. Confirm saved Library data remains.
-   [ ] Start with network disabled. Confirm the last valid Feed data appears when cached files are available, or the app shows a usable empty/error state without crashing.
-   [ ] Restore network and refresh Feed. Confirm fresh data replaces cached data without duplicate cards.
-   [ ] Confirm the app does not lose the selected settings after relaunch.

Result: ____  Notes: ______________________________

## Final result

| Area                      | Result                |
| ------------------------- | --------------------- |
| Install and launch        | PASS / FAIL / BLOCKED |
| Navigation and header     | PASS / FAIL / BLOCKED |
| Feed                      | PASS / FAIL / BLOCKED |
| Browse and search         | PASS / FAIL / BLOCKED |
| Chapter Select and Reader | PASS / FAIL / BLOCKED |
| Library                   | PASS / FAIL / BLOCKED |
| Settings and cache        | PASS / FAIL / BLOCKED |
| JSON import/export        | PASS / FAIL / BLOCKED |
| WebView and clearance     | PASS / FAIL / BLOCKED |
| Repository matrix         | PASS / FAIL / BLOCKED |
| Persistence/offline       | PASS / FAIL / BLOCKED |

Overall result: **PASS / FAIL / BLOCKED**

Failed or blocked step IDs: ********************\_\_********************

Evidence locations: ************************\_************************
