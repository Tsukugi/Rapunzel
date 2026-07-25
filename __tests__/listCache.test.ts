import { describe, expect, test } from "@jest/globals";
import {
    BrowseFreshnessMs,
    FeedFreshnessMs,
    getBrowseCacheKey,
    getEntryUid,
    isFresh,
} from "../src/cache/listCache";

describe("list cache identity and freshness", () => {
    test("uses repository-scoped stable entry IDs", () => {
        expect(getEntryUid("NHentai", "123")).toBe("NHentai:123");
        expect(getEntryUid("MangaDex", "123")).toBe("MangaDex:123");
        expect(getEntryUid("NHentai", "123")).not.toBe(
            getEntryUid("MangaDex", "123"),
        );
    });

    test("normalizes equivalent search cache keys", () => {
        expect(getBrowseCacheKey("NHentai", "  English   Tag ")).toBe(
            getBrowseCacheKey("NHentai", "english tag"),
        );
    });

    test("uses separate freshness windows for feed and browse", () => {
        const now = BrowseFreshnessMs * 3;
        expect(isFresh(now - FeedFreshnessMs + 1, FeedFreshnessMs, now)).toBe(
            true,
        );
        expect(isFresh(now - FeedFreshnessMs, FeedFreshnessMs, now)).toBe(
            false,
        );
        expect(isFresh(now - BrowseFreshnessMs + 1, BrowseFreshnessMs, now)).toBe(
            true,
        );
    });
});
