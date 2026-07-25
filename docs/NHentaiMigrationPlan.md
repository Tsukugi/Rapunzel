# NHentai API v2 migration

Date: 2026-07-25

## Goal

Keep Rapunzel's existing Lilith interface while moving NHentai content requests from the retired HTML and `/api` v1 contract to NHentai `/api/v2`.

## Plan and status

| Step                                                                    | Status |
| ----------------------------------------------------------------------- | ------ |
| Confirm old endpoint and WebView failure modes                          | Done   |
| Map v2 feed, search, random, detail, and page responses to Lilith types | Done   |
| Replace NHentai methods with v2 JSON requests                           | Done   |
| Preserve HTTP errors for Rapunzel WebView clearance                     | Done   |
| Reject empty WebView validation results                                 | Done   |
| Add mocked and live adapter tests                                       | Done   |
| Build and deploy the Android app                                        | Done   |
| Verify feed, search, book, and reader flows on the emulator             | Done   |

## Endpoint mapping

| Lilith operation | Old request                              | v2 request                                               |
| ---------------- | ---------------------------------------- | -------------------------------------------------------- |
| Latest           | HTML home page plus `/api/galleries/all` | `/api/v2/galleries?page=&per_page=`                      |
| Trending         | HTML home page                           | `/api/v2/galleries/popular`                              |
| Search           | HTML `/search`                           | `/api/v2/search?query=&sort=&page=`                      |
| Random           | HTML `/random` then scrape ID            | `/api/v2/galleries/random` then `/api/v2/galleries/{id}` |
| Book             | `/api/gallery/{id}` plus HTML `/g/{id}`  | `/api/v2/galleries/{id}`                                 |
| Chapter          | `/api/gallery/{id}` plus HTML `/g/{id}`  | `/api/v2/galleries/{id}`                                 |

## Implementation notes

-   Feed and search list records use the v2 cover path on `https://t.nhentai.net`.
-   Detail page paths map to full images on `https://i.nhentai.net`.
-   One NHentai gallery remains one Lilith chapter.
-   Language IDs are mapped for English, Japanese, and Chinese/Mandarin. The requested language is preferred when a gallery has more than one.
-   Search v2 has no `per_page` parameter, so larger requested sizes fetch multiple API pages.
-   Cache filenames use a v2 revision so old low-resolution files are not reused.
-   Local library, cache, import/export, settings, and navigation do not depend on NHentai API changes.
-   HTTP 403 errors remain errors so Rapunzel can start WebView clearance for a real Cloudflare challenge.
-   HTTP 451 is not treated as a clearance challenge; it means the site is unavailable from the current region.
-   WebView validation now requires a non-empty API result.

## Verification evidence

-   NH package tests: 9 suites, 27 tests passed.
-   NH package build: passed.
-   Live built-package v2 check: latest 25, trending 5, search 25.
-   Live detail check: one book, one chapter, 30 pages, cover HTTP 200, page HTTP 200.
-   Deployed APK feed check: latest and trending state populated; visible NH titles and v2 full cover URLs were present.
-   Deployed APK search check: `/api/v2/search` returned 25 results and all 25 cover images loaded into the search cache.
-   Deployed APK reader check: v2 detail request opened Reader and 63 page images were cached without an app error.
-   Cover-path regression check: `.jpg.webp` and `.webp` list records map to matching cover paths and retain thumbnail fallbacks.
-   Pagination regression check: Feed and Browse append pages without changing saved scroll offset or duplicating stable entry IDs.

## Remaining verification

The NH WebView itself remains region-blocked with HTTP 451; the content API works without opening WebView in this environment. A real Cloudflare 403 still needs a separate clearance test from a region that presents a challenge instead of the regulatory block.

Rapunzel currently uses local sibling links for Lilith packages (`file:../...`). This is intentional for the current emulator workspace. A later release step must replace those links with published or pinned Git dependencies before building from a standalone checkout or CI runner.
