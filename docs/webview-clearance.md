# NHentai / Cloudflare Clearance Flow

This document captures everything we currently know about handling `403` responses that require the in-app WebView to refresh cookies for NHentai (or any repo behind Cloudflare).

## When the WebView is Needed

- NHentai requests need two headers: a `cookie` string that includes `cf_clearance` (and whatever other cookies the browser has) plus a modern `User-Agent`.
- If either header is missing or expired, Lilith calls return `403`. The loader detects this by looking at the error status/message and immediately kicks off the auto-fetch WebView process so the user can solve the Cloudflare challenge again.
- Even if a previous clearance run is “in progress”, we force the WebView to open because the loader might retry after a long time and still be blocked.

## How Cookies Are Harvested

File: `src/cache/useWebviewCache.ts`

1. Every time the WebView navigates, we read cookies via `@react-native-cookies/cookies`.
2. We build a proper `cookie` header (`name=value; name=value`) and store it under `config.apiLoaderConfig.cookie`.
3. We also read the injected `navigator.userAgent` and save it under `config.apiLoaderConfig['User-Agent']`.
4. Config writes go through `useRapunzelStorage` so the headers survive app restarts.
5. Each header update stamps `config.apiLoaderTimestamps` so we know when the cookie and `User-Agent` were last refreshed (used for stale warnings).

The loader passes `config.apiLoaderConfig` straight into `useLilithAPI()`, so any subsequent API call uses the updated headers.

## Auto-Fetch WebView Flow

File: `src/process/autoFetchWebviewData.ts`

1. `useAutoFetchWebviewData.startProcess` records the current route (so we can return later) and first checks if headers are already valid. If so, it never shows the WebView and immediately returns you to your previous screen (fallback: Main Feed). Otherwise it navigates to `RapunzelWebView`.
2. The WebView runs a small JS snippet to remove ads (`tryRemoveAds`, now re-injected on every load) and report the user agent, while we poll cookies on navigation changes.
3. Once both headers are present, `onDataSuccess` validates them by calling `Lilith.getTrendingBooks()`. If validation succeeds, we mark the clearance as `ValidData` and trigger a Snackbar so the user knows we’re headed back.
4. After a 1s delay (to make sure headers settle), we navigate back either to the stored route or, failing that, the previous entry in the router history (defaulting to the main feed).

The 1s delay prevents the loader’s retry from racing ahead of the cookie persistence.

## Integrating with the Loader

File: `src/api/loader.ts`

- Every Lilith request (book, chapter, search, latest, trending) goes through `withLilithRequest`. On error, we inspect the object/string for `403`.
- When detected, `startWebviewClearance()` uses the global `NavigationContainer` ref (`src/components/navigators/navigationRef.ts`) and calls `startProcess(config, true)` to open the WebView regardless of the clearance state. We set a Snackbar message (“Refreshing cookies…”) so the user understands the context switch.
- Requests return `null` when the call fails, which keeps UI state machines from hanging (loading flags are still cleared, promises resolved).

## Manual Troubleshooting Checklist

1. **Confirm headers** – in Settings (or logs), check `config.apiLoaderConfig.cookie` and `User-Agent`. If either is blank or obviously old, tap the WebView entry in the drawer to refresh manually.
2. **Trigger WebView from anywhere** – any 403 will automatically jump to the WebView; if it doesn’t, ensure the global `NavigationContainer` ref is wired up in `index.js`.
3. **Check validation logs** – enable `config.debug` to see `[useAutoFetchWebviewData.validateData]` output in the console.
4. **Cache delays** – after solving the challenge, wait ~1 second before retrying if you manually navigate out of the WebView; the loader already does this when it auto-navigates back.
5. **Unsupported repositories** – auto-fetch is limited to `LilithRepo.NHentai`. Other repos simply surface the error; add them to `SupportedSources` if they ever require a similar workflow.
6. **Pay attention to snackbars** – the loader notifies you when it forces the WebView or when clearance succeeded so you know why navigation changed.
