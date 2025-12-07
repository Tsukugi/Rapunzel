# Rapunzel Agent Notes

## What this project is
- React Native 0.72 app for reading/downloading books/manga from multiple Lilith repositories (NHentai, HenTag, MangaDex, EHentai via @atsu/lilith* packages).
- Drawer-based navigation with feed, browse, library, reader, settings, and a built-in webview for sites that need cookies/clearance.
- Uses Taihou (`@atsu/taihou`) for global state + effects, Lilith for content APIs, MMKV for persistence, and a custom cache for image downloads.

## Entry points and architecture
- `index.js` boots React Navigation + React Native Paper theming, calls `initRapunzelStore()` and `initRapunzelStorage()` before registering the app.
- `src/App.tsx` starts lifecycle hook `onAppStart`, renders snackbars, and mounts `DrawerNavigator` with the registered views.
- Navigation setup: `src/components/navigators/navigationConfig.ts` declares all views (`RapunzelMainFeed`, `RapunzelBrowse`, `RapunzelLibrary`, `RapunzelSettings`, `RapunzelReader`, `RapunzelWebView`, `RapunzelChapterSelect`) and their drawer/header options.
- State: `src/store/store.ts` initializes Taihou stores (router, config, reader, browse/latest/trending lists, library, loading flags, UI, autoFetchWebview); interfaces in `src/store/interfaces.ts`.
- Lifecycle: `src/lifecycle/onAppStart.ts` auto-switches to WebView when using the NHentai repo (Cloudflare clearance).

## Data + caching
- API loader: `src/api/loader.ts` wraps Lilith API calls for search, latest, trending, book load, chapter load; orchestrates caching and reader state.
- Cache/persistence: `src/cache/*` handles image downloads (`RapunzelCache.downloadImageList`), library persistence, and storage via `react-native-mmkv-storage` (`initRapunzelStorage` hydrates config, router route, library).
- Config defaults (see `src/store/store.ts`): caching enabled, temp vs downloads cache paths, repo `NHentai`, languages [en, es, jp, zh], initial view main feed unless NHentai toggles WebView, optional debug logging (`RapunzelConfig.executeOnlyOnDebug`).

## UI components (high level)
- Virtualized lists and cards live under `src/components/virtualList` and `src/components/paper`.
- Drawer/navigation helpers in `src/components/navigators`.
- Views live under `src/views/` matching the nav registry.
- Theme switching via `themes.ts` (light/dark palettes).

## Running and testing
- Install: `npm i` (Node >=16).
- Dev: `npm run start` (Metro), then `npm run android` or `npm run ios`.
- Tests: `npm test` (Jest), lint: `npm run lint`.

## Quick behaviors to know
- Searching/browse/latest/trending all cache cover images; reader chapter loads fetch pages and cache them, respecting the `enableCache` flag and download destinations.
- WebView view (`RapunzelWebView`) exists mainly to gather cookies/headers when repos need it; config headers live in `config.apiLoaderConfig`.
- Snackbar messages come from the UI store (`ui.snackMessage`) and auto-dismiss after 3s.
- Commit with a Title and a 50+ word summary of the changes, focusing on what has changed and its purpose. 
- Avoid citing filename path in commit messages