export const FeedFreshnessMs = 15 * 60 * 1000;
export const BrowseFreshnessMs = 30 * 60 * 1000;

export const normalizeSearchQuery = (query: string) =>
    query.trim().replace(/\s+/g, " ").toLowerCase();

export const getEntryUid = (repository: string, sourceId: string | number) =>
    `${repository}:${String(sourceId)}`;

export const getFeedCacheKey = (repository: string) =>
    `${repository}:feed.latest`;

export const getTrendingCacheKey = (repository: string) =>
    `${repository}:feed.trending`;

export const getBrowseCacheKey = (repository: string, query: string) =>
    `${repository}:browse:${normalizeSearchQuery(query)}`;

export const isFresh = (
    fetchedAt: number | null | undefined,
    maxAgeMs: number,
    now = Date.now(),
) =>
    typeof fetchedAt === "number" &&
    fetchedAt > 0 &&
    now - fetchedAt < maxAgeMs;
