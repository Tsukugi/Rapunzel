# Feed Prefill & Persistence

## Goal
- Launch the app with a warm main feed, showing the last fetched latest/trending lists immediately.
- Let network refresh progressively replace hydrated data without flicker.
- Stay resilient: drop invalid entries, cap storage size/age.

## Data to Persist (MMKV)
- Keys: `feed.latest`, `feed.trending`.
- Stored shape: `rendered`, `bookListRecord`, `cachedImagesRecord` (no `page` at the moment).
- Source slices: `LatestBooksState` / `PopularBooksState`.
- Only store what VirtualList render needs; capped to ~80 items.
- Sanity: validate `file://` paths exist; drop missing/invalid entries on load.

## Hydration on Startup
- After `initRapunzelStore` and inside `initRapunzelStorage`, read latest/trending entries separately.
- For each entry:
  - Validate files; rebuild `rendered`, `bookListRecord`, `cachedImagesRecord` from surviving items (capped).
  - Seed `latest` (page remains default if none persisted) and `trending` state without triggering loaders.
  - Keep `initialView = RapunzelMainFeed` unchanged.
- Ensure the main feed’s “Trending” marker insertion still works with hydrated data.

## Refresh Flow (Progressive Replace)
- On focus/refresh:
  - Start network fetches (`getLatestBooks`, `getTrendingBooks`) without clearing hydrated state.
  - Only replace state once a fetch + image downloads finish; keep `rendered` order.
  - Guard against concurrent loads with existing `loading.*` flags.

## Persist After Fetch
- A watcher component (`FeedPersistence`) listens to `latest` / `trending` changes:
  - Immediately persists once on mount, then on every slice update (debounced ~300ms).
  - Serializes only `rendered`, `bookListRecord`, `cachedImagesRecord` and caps them to ~80 entries.
  - Persisted payloads can be empty; hydration treats missing/empty data as “no feed cached”.

## Testing Checklist
- Cold offline launch shows last feed immediately; no crash if storage empty.
- Online launch refreshes and replaces hydrated entries smoothly (no flicker, no duplicates).
- Missing/corrupt image files are pruned during hydration.
- Pagination still works (latest page increments preserved; append from network).
- Storage caps respected; old data evicted on save.
- Automated coverage:
  - `__tests__/storageHydration.test.ts` validates hydration pruning/capping behavior.
  - `__tests__/feedPersistence.test.tsx` ensures persistence serializes the right payload and respects caps.
