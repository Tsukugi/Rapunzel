import { jest, describe, beforeEach, test, expect } from "@jest/globals";

import React from "react";
import renderer, { act } from "react-test-renderer";
import { StorageEntries } from "../src/cache/interfaces";
import { MaxFeedItems } from "../src/cache/feedConstants";
import { LatestBooksState, PopularBooksState } from "../src/store/interfaces";

let mockLatestState: LatestBooksState;
let mockTrendingState: PopularBooksState;
let mockLatestEffectHandlers: Array<(state: LatestBooksState) => void> = [];
let mockTrendingEffectHandlers: Array<(state: PopularBooksState) => void> = [];

const mockSetItem = jest.fn();

jest.mock("react-native-fs", () => ({
    DocumentDirectoryPath: "",
    DownloadDirectoryPath: "",
    TemporaryDirectoryPath: "",
    exists: jest.fn(),
}));

jest.mock("use-debounce", () => ({
    useDebouncedCallback:
        (fn: (...args: any[]) => void) =>
        (...args: any[]) =>
            fn(...args),
}));

jest.mock("../src/cache/storage", () => ({
    useRapunzelStorage: () => ({
        setItem: mockSetItem,
        instance: {},
    }),
}));

jest.mock("../src/store/store", () => ({
    useRapunzelStore: () => ({
        latest: [mockLatestState, (cb: any) => mockLatestEffectHandlers.push(cb)],
        trending: [
            mockTrendingState,
            (cb: any) => mockTrendingEffectHandlers.push(cb),
        ],
    }),
}));

describe("FeedPersistence", () => {
    beforeEach(() => {
        mockSetItem.mockClear();
        mockLatestEffectHandlers = [];
        mockTrendingEffectHandlers = [];
    });

    test("persists filtered latest/trending payloads on mount and updates on change", () => {
        mockLatestState = {
            activeProcessId: "",
            page: 1,
            rendered: ["keep", "missing-image", "missing-book"],
            bookListRecord: {
                keep: { id: "keep" } as any,
                "missing-image": { id: "missing-image" } as any,
            },
            cachedImagesRecord: {
                keep: { id: "keep", value: "file://keep" },
                "missing-book": {
                    id: "missing-book",
                    value: "file://missing",
                },
            },
        };

        mockTrendingState = {
            activeProcessId: "",
            rendered: ["t0", "t1"],
            bookListRecord: {
                t0: { id: "t0" } as any,
                t1: { id: "t1" } as any,
            },
            cachedImagesRecord: {
                t0: { id: "t0", value: "file://t0" },
                t1: { id: "t1", value: "file://t1" },
            },
        };

        const FeedPersistence =
            require("../src/lifecycle/FeedPersistence").default;

        act(() => {
            renderer.create(<FeedPersistence />);
        });

        expect(mockSetItem).toHaveBeenCalledWith(
            StorageEntries.feedLatest,
            expect.objectContaining({
                rendered: ["keep", "missing-image", "missing-book"],
                bookListRecord: {
                    keep: { id: "keep" },
                    "missing-image": { id: "missing-image" },
                },
                cachedImagesRecord: {
                    keep: { id: "keep", value: "file://keep" },
                    "missing-book": { id: "missing-book", value: "file://missing" },
                },
            }),
        );
        expect(mockSetItem).toHaveBeenCalledWith(
            StorageEntries.feedTrending,
            expect.objectContaining({
                rendered: ["t0", "t1"],
                bookListRecord: {
                    t0: { id: "t0" },
                    t1: { id: "t1" },
                },
                cachedImagesRecord: {
                    t0: { id: "t0", value: "file://t0" },
                    t1: { id: "t1", value: "file://t1" },
                },
            }),
        );

        const nextLatest: LatestBooksState = {
            ...mockLatestState,
            rendered: ["missing-book", "keep"],
            cachedImagesRecord: {
                ...mockLatestState.cachedImagesRecord,
                keep: { id: "keep", value: "file://keep-2" },
            },
        };

        mockLatestEffectHandlers.forEach((cb) => cb(nextLatest));

        expect(mockSetItem).toHaveBeenLastCalledWith(
            StorageEntries.feedLatest,
            expect.objectContaining({
                rendered: ["missing-book", "keep"],
                bookListRecord: { keep: { id: "keep" } },
                cachedImagesRecord: {
                    keep: { id: "keep", value: "file://keep-2" },
                    "missing-book": { id: "missing-book", value: "file://missing" },
                },
            }),
        );
    });

    test("caps persisted payloads to MaxFeedItems", () => {
        const longRendered = Array.from(
            { length: MaxFeedItems + 5 },
            (_, idx) => `id-${idx}`,
        );

        const books = Object.fromEntries(
            longRendered.map((id) => [id, { id } as any]),
        );
        const images = Object.fromEntries(
            longRendered.map((id) => [id, { id, value: `file://${id}` }]),
        );

        mockLatestState = {
            activeProcessId: "",
            page: 1,
            rendered: longRendered,
            bookListRecord: books,
            cachedImagesRecord: images,
        };

        mockTrendingState = {
            activeProcessId: "",
            rendered: longRendered,
            bookListRecord: books,
            cachedImagesRecord: images,
        };

        const FeedPersistence =
            require("../src/lifecycle/FeedPersistence").default;

        act(() => {
            renderer.create(<FeedPersistence />);
        });

        expect(mockSetItem).toHaveBeenCalledWith(
            StorageEntries.feedLatest,
            expect.objectContaining({
                rendered: longRendered.slice(0, MaxFeedItems),
            }),
        );
        expect(mockSetItem).toHaveBeenCalledWith(
            StorageEntries.feedTrending,
            expect.objectContaining({
                rendered: longRendered.slice(0, MaxFeedItems),
            }),
        );
    });
});
