# NHentai investigation

Date: 2026-07-25

## Result

The empty NHentai feed has two causes:

1. The local `@atsu/lilith-nhentai` implementation still uses the old `/api` v1 contract.
2. The NHentai HTML site is blocked from this test environment by a regional regulatory response.

The first cause can be fixed in the Lilith implementation. The second means HTML scraping and the NHentai WebView will still fail in this region even after the API update.

## Reproduction

The deployed Rapunzel APK was launched with its default repository, NHentai.

Observed in the app log:

-   `feed.latest` stayed empty.
-   `feed.trending` stayed empty.
-   Requests returned HTTP 403 and HTTP 451.
-   The app did not crash.

Direct requests from the same test environment produced the same result:

| Request                                        | Status | Response                                                                      |
| ---------------------------------------------- | -----: | ----------------------------------------------------------------------------- |
| `https://nhentai.net/`                         |    451 | `Regulatory Blocked - nhentai`; direct access is unavailable from this region |
| `https://nhentai.net/api/galleries/all?page=1` |    403 | `Use new API https://nhentai.net/api/v2/docs`                                 |
| `https://nhentai.net/api/galleries/popular`    |    403 | `Use new API https://nhentai.net/api/v2/docs`                                 |

Changing the User-Agent, adding a Referer, and adding an `Accept: application/json` header did not change these results.

## Current NH implementation

The local package uses these old values:

-   `baseUrl = https://nhentai.net`
-   `apiUrl = https://nhentai.net/api`

The latest feed calls `/api/galleries/all?page=...` and also scrapes the HTML home page. It uses `Promise.all`, so either failed request makes the result empty. Trending only scrapes the HTML home page. Both methods catch the error and return an empty list.

Rapunzel then receives an empty result and renders an empty feed. Because the NH package catches the error first, Rapunzel cannot show the real HTTP status to the user.

The mocked NH package tests pass, but they do not make live requests:

-   9 test suites passed.
-   20 tests passed.

The upstream `main` branch checked during this investigation still uses the same old API and HTML selectors. Its newer commit only changes fetch/build dependencies; it does not update the NH endpoints.

## New NH API check

The new API is reachable from this environment:

| Request                                              | Status | Result                                |
| ---------------------------------------------------- | -----: | ------------------------------------- |
| [`/api/v2/docs`](https://nhentai.net/api/v2/docs)    |    200 | Swagger API documentation             |
| `/api/v2/openapi.json`                               |    200 | OpenAPI document                      |
| `/api/v2/galleries?page=1&per_page=3`                |    200 | Latest gallery records and pagination |
| `/api/v2/galleries/popular`                          |    200 | Popular gallery records               |
| `/api/v2/search?query=english&page=1`                |    200 | Search records                        |
| `/api/v2/galleries/667077`                           |    200 | Full gallery data and page paths      |
| `https://t.nhentai.net/galleries/4075880/thumb.webp` |    200 | Cover thumbnail from the v2 record    |
| `https://i.nhentai.net/galleries/4075880/1.webp`     |    200 | Page image from the v2 record         |

The v2 list shape is different from the old API. Lists use a `result` array with fields such as `id`, `media_id`, `english_title`, `thumbnail`, and `num_pages`. Detail responses use `title`, `cover`, `pages`, and typed `tags`.

## Required implementation work

The NH implementation needs a v2 adapter:

1. Change the API base to `https://nhentai.net/api/v2`.
2. Use `/galleries?page=...&per_page=...` for latest.
3. Use `/galleries/popular` for trending.
4. Use `/search?query=...&sort=...&page=...` for search.
5. Use `/galleries/{id}` for book and chapter data.
6. Map v2 records to Lilith `BookBase`, `Book`, and `Chapter` types.
7. Build cover and page URLs from the v2 CDN paths.
8. Remove the HTML home-page dependency from feed loading.
9. Preserve the real HTTP error so Rapunzel can show a useful message when the API is unavailable.

The HTML WebView cannot be repaired in this environment by changing headers. It needs a reachable region/network. MangaDex remains the working repository for the deployed smoke test.

## WebView clearance check

The WebView mechanism is present and is intended for a real Cloudflare challenge. It stores:

-   the WebView User-Agent;
-   the `cf_clearance` cookie and other cookies from the NHentai domain.

However, the feed did not start that process during the NH test. The deployed log showed the 451 responses and empty feed state, but no `useAutoFetchWebviewData.startProcess` entry. The reason is in the error path:

1. Lilith's NH feed methods catch request errors and return `[]`.
2. Rapunzel's 403 handler only runs when a request error reaches `withLilithRequest`.
3. Therefore the feed error never reaches the WebView trigger.

There is a second weakness: WebView validation calls `getTrendingBooks()` and only checks whether it throws. If the NH method returns an empty array after catching an error, validation can treat the failed clearance as successful.

This WebView path is useful for a Cloudflare challenge, but it cannot fix the responses observed here:

-   HTTP 403 from `/api/galleries/*` is the retired API response, which explicitly directs clients to `/api/v2`.
-   HTTP 451 from the HTML site is a regional regulatory block, not a visible Cloudflare clearance challenge.

## WebView-related fix requirements

After the v2 adapter is implemented:

1. Preserve HTTP 403 errors in Lilith so Rapunzel can start WebView clearance when a real Cloudflare challenge occurs.
2. Do not turn HTTP 451 into a clearance attempt; show that the source is unavailable in the current region.
3. Make WebView validation require a usable API result, not only the absence of a thrown error.
4. Add tests for a propagated 403 and for an empty validation result.

## v2 coverage of Rapunzel features

The v2 API can support the content features Rapunzel currently uses, but it needs an adapter:

| Rapunzel feature                              | v2 support | Adapter notes                                                                                                                               |
| --------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Latest feed                                   | Yes        | `/galleries?page=...&per_page=...` returns results and pagination.                                                                          |
| Trending feed                                 | Yes        | `/galleries/popular` returns popular gallery summaries.                                                                                     |
| Search                                        | Yes        | `/search?query=...&sort=...&page=...` supports the current search flow and sort values.                                                     |
| Random book                                   | Yes        | `/galleries/random` returns an ID; fetch `/galleries/{id}` for the full book.                                                               |
| Book details                                  | Yes        | `/galleries/{id}` includes title, tags, cover, and page data.                                                                               |
| Reader pages                                  | Yes        | The detail response includes ordered page paths and dimensions. NHentai still maps to one chapter per gallery.                              |
| Covers and images                             | Yes        | The response paths work with the NHentai image CDN and WebP files.                                                                          |
| Languages and tags                            | Partial    | List results contain `tag_ids`; resolve them through `/tags/ids` or cache the language tag IDs. Detail responses contain typed tags.        |
| Local library, cache, import/export, settings | Yes        | These are Rapunzel-local features and do not need NH API support.                                                                           |
| Browser/WebView clearance                     | No         | This is separate from the API. The WebView can handle a real Cloudflare challenge, but it cannot bypass the current regional HTTP 451 page. |

So v2 supports the app's main feed, browse, search, book, and reader workflows. It does not support them through the current code without mapping changes. The API also advertises HTTP 429 rate-limit responses, so the adapter should preserve and report those instead of returning an empty list.

The implementation plan and verification status are tracked in [NHentaiMigrationPlan.md](G:/dev/Rapunzel/docs/NHentaiMigrationPlan.md).

The v2 migration is now implemented and deployed. The emulator verified a populated NH feed, v2 search results, a v2 book detail request, Reader navigation, and page image caching. The only NH path still blocked is the HTML WebView, which returns the regional HTTP 451 page.

## Cover paths and image quality follow-up

The API does not use one fixed cover suffix. List records provide the thumbnail
path, and the path must be transformed by replacing filename segment `thumb`
with `cover`:

```text
galleries/4076373/thumb.jpg.webp -> galleries/4076373/cover.jpg.webp
galleries/4076386/thumb.webp     -> galleries/4076386/cover.webp
```

The old mapper hardcoded `cover.webp.webp`. That caused 404s for galleries with
JPEG source files and made cache try wrong candidates. Mapper now preserves API
suffix and stores thumbnail as `fallbackUri`.

List covers use `t.nhentai.net`; reader pages use full API paths on
`i.nhentai.net`. Reader downloads were checked with API dimensions and full
page URLs; no reader downsampling bug was reproduced. Soft feed cards are
expected when a small cover is displayed much larger than its source image.
The fix keeps normal cover path and uses thumbnail only after cover failure.

Cache failure now returns `null`, so Rapunzel does not publish a `file://` URI
for a file that was never created.
