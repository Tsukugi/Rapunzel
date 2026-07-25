# Rapunzel smoke-test run — 2026-07-25

## Scope

This run attempted to deploy the current checkout and execute `docs/SmokeTest.md` against it.

## Environment evidence

| Field | Result |
| --- | --- |
| Checkout | `G:\dev\Rapunzel` |
| Git HEAD | `1ea3976` (`Standardize repository agent guidance`) |
| Emulator | `emulator-5554`, AVD `Medium_Phone_API_35` |
| Android display | 1080x2400, density 420 |
| Emulator boot | Complete |
| APK found for this checkout | No |
| APK installed before this run | Rapunzel 0.7.1, versionCode 1 |
| Target repo version | 0.8.5, versionCode 4 |

The installed 0.7.1 APK was not used for feature results because it does not match the current checkout.

## Deployment gate result

**BLOCKED — no valid current APK was deployed.**

`npm ci` was run three times:

1. The default npm cache failed while preparing the `Amagi` git dependency with git error 128.
2. A direct retry failed with the same error.
3. A fresh isolated npm cache failed with the same error.

The checked-in lockfile pins `@atsu/amagi` to commit `02015c9ae9aae5deceb4f18b5dbde0567caa9cff`. The following checks show that the commit is no longer available:

- `git ls-remote https://github.com/Tsukugi/Amagi.git 02015c9ae9aae5deceb4f18b5dbde0567caa9cff` returned no ref.
- The GitHub commit API returned HTTP 404.
- The GitHub archive URL for the commit returned HTTP 404.
- No local cached or workspace copy of the package was found.

## Feature results

Not run. No feature step is marked PASS or FAIL because the current app was not deployed.

| Area | Result |
| --- | --- |
| Install and launch | BLOCKED |
| Navigation and header | NOT RUN |
| Feed | NOT RUN |
| Browse and search | NOT RUN |
| Chapter Select and Reader | NOT RUN |
| Library | NOT RUN |
| Settings and cache | NOT RUN |
| JSON import/export | NOT RUN |
| WebView and clearance | NOT RUN |
| Repository matrix | NOT RUN |
| Persistence/offline | NOT RUN |

## Required next input

Provide a build made from the current checkout, or authorize changing the pinned dependency to a reachable compatible revision. After that, rerun the deployment gate before testing features.

## Follow-up run: local sibling implementations

The deployment blocker was fixed for this local emulator run by linking the sibling repositories requested for the project:

| Package | Local path | Build result |
| --- | --- | --- |
| `@atsu/amagi` | `G:\dev\AmagiChan` | PASS |
| `@atsu/lilith` | `G:\dev\Lilith` | PASS |
| `@atsu/lilith-hentag` | `G:\dev\LilithHentag` | PASS |
| `@atsu/lilith-mangadex` | `G:\dev\LilithMangaDex` | PASS |
| `@atsu/lilith-nhentai` | `G:\dev\LilithNHentai` | PASS |

Rapunzel now uses `file:../...` dependencies for these siblings. Metro also maps and watches the sibling packages so the React Native bundle can resolve them.

## Current deployment evidence

| Check | Result |
| --- | --- |
| `npm install --ignore-scripts` | PASS |
| `npm ci --ignore-scripts` from the new lockfile | PASS |
| `npx tsc --noEmit` app source | PASS for app source; existing test and `@atsu/taihou` typing errors remain |
| `npm run lint` | Reaches lint; existing 150 errors and 170 warnings remain |
| `npm test -- --runInBand` | 12 suites pass; existing `scripts/__tests__/release.test.ts` fails 8 Windows-path assertions |
| `assembleDebug` | PASS |
| `assembleEmulator` | PASS |
| Bundled JS present | PASS: `assets/index.android.bundle` |
| `__tests__/cache.test.tsx` | PASS: 8/8 after declaring Lilith's `@babel/runtime` dependency |
| APK package | `com.rapunzel` |
| APK version | `0.8.5`, versionCode `4` |
| Install on `emulator-5554` | PASS |
| Launch without Metro | PASS; no redbox or fatal exception |

APK used for the feature run:

`G:\dev\Rapunzel\android\app\build\outputs\apk\emulator\app-emulator.apk`

## Feature results

| Area | Result | Evidence / limit |
| --- | --- | --- |
| Launch and navigation | PASS | Feed, Browse, Library, Settings, Reader, and WebView routes rendered on the deployed APK |
| Browse and search | PASS | Search field accepted text and submit; NHentai returned HTTP 451 in this emulator region |
| Settings | PASS | Repository selector, cache toggle, fallback toggle, and accordion rendered; repository selection persisted |
| JSON import/export | PASS | Export action returned to the app; Import opened Android DocumentsUI |
| WebView | PASS | Embedded WebView rendered the NHentai regulatory-block page |
| Reader | PASS | Reader route rendered without a crash; no chapter data was available for a page assertion |
| Repository matrix | PARTIAL | NHentai, HenTag, MangaDex, and EHentai could be selected and queried; external responses were 403/451 or network failure |
| Persistence | PASS | Selected repository survived force-stop and relaunch; app process stayed alive |
| Feed data and book actions | BLOCKED | External source responses prevented a real book card, save, chapter, or image assertion |

The earlier blocked section is retained as history. This follow-up is the current deployment and feature result for the local sibling setup.

## Feed follow-up

The feed was reproduced empty on a clean launch with the app's default repository, NHentai.

- `https://nhentai.net/` returned HTTP 451 from the test environment.
- `https://nhentai.net/api/galleries/popular` returned HTTP 403.
- `https://nhentai.net/api/galleries/all?page=1` returned HTTP 403.
- The deployed app logged the same 403/451 responses and kept `feed.latest` and `feed.trending` empty.

As a control test, Settings was changed to MangaDex. After a force-stop and relaunch, the same APK received populated latest book records and cover URLs, with no blocking error or crash. The emulator is left on MangaDex so the feed can be tested with a reachable repository.

Conclusion: the empty feed is caused by NHentai being blocked from this environment, not by the feed list or Metro/local sibling wiring. NHentai remains selectable, but it cannot provide feed data until its service is reachable from the emulator.

Detailed endpoint and implementation findings are in [NHentaiInvestigation-2026-07-25.md](G:/dev/Rapunzel/docs/NHentaiInvestigation-2026-07-25.md). That investigation also found that the current NH package uses retired `/api` v1 endpoints, while the new `/api/v2` API is reachable.

The WebView clearance path was also checked. It did not start automatically because the NH implementation catches the feed errors before Rapunzel's 403 handler sees them. The observed 451 response is a regional block, not a Cloudflare challenge that a `cf_clearance` cookie can solve.

## Follow-up run: NHentai v2 migration

The local NH sibling was migrated to the v2 JSON API and the APK was rebuilt and installed on `emulator-5554`.

| Check | Result | Evidence |
| --- | --- | --- |
| Clean launch with default NH repository | PASS | Feed route opened with no crash or API error. |
| Latest and trending feed | PASS | Latest and trending state populated; visible cards contained NH titles and `t.nhentai.net` thumbnail URLs. |
| NH search | PASS | Deployed app called `/api/v2/search?query=english&sort=date&page=1`; 25 cover images loaded into `SearchResults`. |
| NH book open | PASS | Tapping a feed card called `/api/v2/galleries/666903`. |
| Reader | PASS | Reader opened and cached 63 `i.nhentai.net` page images. |
| NH WebView | BLOCKED | The HTML page still returns the regional HTTP 451 response. |

No `FATAL`, `Network request failed`, HTTP 403, or HTTP 451 errors occurred during the v2 feed, search, book, or reader checks.
