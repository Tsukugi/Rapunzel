import { jest, describe, test, expect, afterEach } from "@jest/globals";

import { StorageEntries } from "../src/cache/interfaces";
import { MaxFeedItems } from "../src/cache/feedConstants";
import { ViewNames } from "../src/components/navigators/interfaces";
import {
    ConfigState,
    HeaderState,
    LatestBooksState,
    LibraryState,
    LilithRepo,
    PopularBooksState,
    RouterState,
} from "../src/store/interfaces";

jest.mock("react-native-fs", () => ({
    DocumentDirectoryPath: "",
    DownloadDirectoryPath: "",
    TemporaryDirectoryPath: "",
    exists: jest.fn(),
}));

const flushAsync = () => new Promise((resolve) => setImmediate(resolve));

describe("initRapunzelStorage feed hydration", () => {
    afterEach(() => {
        jest.resetModules();
        jest.clearAllMocks();
    });

    test("hydrates feed lists with valid cached files and caps payload size", async () => {
        const config: ConfigState = {
            debug: false,
            enableCache: true,
            useFallbackExtensionOnDownload: false,
            apiLoaderConfig: { "User-Agent": "", cookie: "" },
            apiLoaderTimestamps: { cookie: null, userAgent: null },
            webviewUrl: "",
            initialView: ViewNames.RapunzelMainFeed,
            repository: LilithRepo.NHentai,
            languages: [],
            cachelibraryLocation: "",
            cacheTempImageLocation: "",
        };

        const header: HeaderState = { searchValue: "" };
        const library: LibraryState = { saved: {}, rendered: [] };
        const router: RouterState = {
            currentRoute: ViewNames.RapunzelBrowse,
            history: [],
        };

        const latestState: LatestBooksState = {
            activeProcessId: "",
            page: 1,
            rendered: [],
            bookListRecord: {},
            cachedImagesRecord: {},
        };

        const trendingState: PopularBooksState = {
            activeProcessId: "",
            rendered: [],
            bookListRecord: {},
            cachedImagesRecord: {},
        };

        const mockStore = {
            config: [config],
            header: [header],
            library: [library],
            router: [router],
            latest: [latestState],
            trending: [trendingState],
        };

        const validIds = Array.from(
            { length: MaxFeedItems + 2 },
            (_, idx) => `valid-${idx}`,
        );

        const latestSnapshot: LatestBooksState = {
            activeProcessId: "",
            page: 1,
            rendered: ["missing-file", "missing-book", ...validIds],
            bookListRecord: {
                "missing-file": { id: "missing-file" } as any,
                ...Object.fromEntries(validIds.map((id) => [id, { id }])),
            },
            cachedImagesRecord: {
                "missing-file": {
                    id: "missing-file",
                    value: "file:///missing-file",
                },
                ...Object.fromEntries(
                    validIds.map((id) => [
                        id,
                        { id, value: `file:///cache/${id}` },
                    ]),
                ),
            },
        };

        const trendingSnapshot: PopularBooksState = {
            activeProcessId: "",
            rendered: ["missing-file", "trending-valid"],
            bookListRecord: {
                "missing-file": { id: "missing-file" } as any,
                "trending-valid": { id: "trending-valid" } as any,
            },
            cachedImagesRecord: {
                "missing-file": {
                    id: "missing-file",
                    value: "file:///missing-file",
                },
                "trending-valid": {
                    id: "trending-valid",
                    value: "file:///cache/trending-valid",
                },
            },
        };

        const mmkvInstance = {
            getBool: jest.fn((_key: string, cb?: any) => cb?.(null, null)),
            getString: jest.fn((_key: string, cb?: any) => cb?.(null, null)),
            getInt: jest.fn((_key: string, cb?: any) => cb?.(null, null)),
            getArray: jest.fn((_key: string, cb?: any) => cb?.(null, null)),
            getMap: jest.fn((key: string, cb?: any) => {
                if (key === StorageEntries.feedLatest) return latestSnapshot;
                if (key === StorageEntries.feedTrending)
                    return trendingSnapshot;
                return null;
            }),
            getItem: jest.fn(),
            getMapAsync: jest.fn((key: StorageEntries) => {
                if (key === StorageEntries.feedLatest)
                    return Promise.resolve(latestSnapshot);
                if (key === StorageEntries.feedTrending)
                    return Promise.resolve(trendingSnapshot);
                return Promise.resolve(null);
            }),
            setBool: jest.fn(),
            setString: jest.fn(),
            setInt: jest.fn(),
            setArray: jest.fn(),
            setMap: jest.fn(),
        };

        jest.doMock("react-native-mmkv-storage", () => ({
            MMKVLoader: jest.fn(() => ({
                initialize: () => mmkvInstance,
            })),
        }));

        const existsMock = require("react-native-fs").exists as jest.Mock;
        existsMock.mockImplementation(
            ((path: string) => !path.includes("missing")) as any,
        );

        jest.doMock("../src/store/store", () => ({
            useRapunzelStore: () => mockStore,
        }));

        jest.doMock("../src/config/log", () => ({
            RapunzelLog: { warn: jest.fn(), log: jest.fn() },
        }));

        let initRapunzelStorage: () => void = () => undefined;
        jest.isolateModules(() => {
            initRapunzelStorage =
                require("../src/cache/storage").initRapunzelStorage;
        });

        initRapunzelStorage();
        await flushAsync();
        await flushAsync();

        expect(latestState.rendered).toHaveLength(MaxFeedItems);
        expect(latestState.rendered[0]).toBe("valid-0");
        expect(latestState.rendered[MaxFeedItems - 1]).toBe("valid-79");
        expect(latestState.rendered).not.toContain("missing-file");
        expect(latestState.rendered).not.toContain("missing-book");
        expect(latestState.bookListRecord).not.toHaveProperty("missing-book");
        expect(Object.keys(latestState.bookListRecord)).toHaveLength(
            MaxFeedItems,
        );

        expect(trendingState.rendered).toEqual(["trending-valid"]);
        expect(trendingState.bookListRecord).toEqual({
            "trending-valid": { id: "trending-valid" },
        });
    });
});
