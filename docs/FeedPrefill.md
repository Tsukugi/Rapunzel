# List cache lifecycle

## Identity

Every book entry uses a stable UID:

```text
<repository>:<book id>
```

The UID is used by `rendered`, `bookListRecord`, and `cachedImagesRecord`. A
book returned by two pages is therefore one entry, not two entries.

## Two cache layers

- The list cache stores order, loaded pages, freshness, page state, and scroll
  position.
- The entry cache stores book data, the remote cover URL, the local cover URI,
  and first/last loaded timestamps.

The API page is complete as soon as its metadata is merged. Cover downloads run
after that and do not block list rendering or the next page request.

## Back navigation

Returning from a reader keeps the current list, loaded pages, and scroll
position. Focus does not clear a list. If the list is stale, page one is
revalidated in the background and merged without removing existing entries.

Pull-to-refresh is the explicit refresh action. It also merges results and
keeps existing entries, so the visible list does not jump because of a cache
reset.

## Persistence

Feed and Browse list snapshots are stored in MMKV. Browse also stores the
current search text. On startup, list metadata is restored even when a local
cover file is missing. The list is restored immediately; local file checks run
in the background. Missing files fall back to the remote cover URL and can
download again without delaying API requests.

Feed data is fresh for 15 minutes. Browse data is fresh for 30 minutes. Feed
snapshots are capped at 80 entries and Browse snapshots at 100 entries.

All cover lists share `RapunzelLibrary/BookCovers/<repository>`, so the same
book cover can be reused by Feed and Browse.
