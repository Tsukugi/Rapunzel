import AsyncStorage from "@react-native-async-storage/async-storage";
import { LilithLanguage } from "@atsu/lilith";
import {
    ConfigState,
    LatestBooksState,
    LibraryBook,
    LilithRepo,
    PopularBooksState,
    ViewNames,
} from "../store";
import { RapunzelStorage, StoredFeedCache } from "./rapunzelStorage";
import { LibraryUtils } from "../tools/library";

const createConfig = (): ConfigState => ({
    debug: true,
    enableCache: true,
    useFallbackExtensionOnDownload: false,
    cachelibraryLocation: "Downloads",
    cacheTempImageLocation: "Temp",
    apiLoaderConfig: {
        "User-Agent": "jest-agent",
        cookie: "cf_token",
    },
    initialView: ViewNames.RapunzelMainFeed,
    webviewUrl: "https://nhentai.net/",
    repository: LilithRepo.NHentai,
    languages: [LilithLanguage.english],
});

const createLibraryBook = (id: string, savedAt: number): LibraryBook => ({
    id,
    title: `Book ${id}`,
    author: "Test Author",
    cover: { uri: `https://example.com/${id}.jpg`, width: 300, height: 400 },
    availableLanguages: [LilithLanguage.english],
    tags: [],
    chapters: [
        {
            id: `${id}-c1`,
            title: "Chapter 1",
            language: LilithLanguage.english,
            chapterNumber: 1,
            pages: [],
            savedAt,
        },
    ],
    savedAt,
});

beforeEach(async () => {
    await AsyncStorage.clear();
});

describe("RapunzelStorage", () => {
    test("persists config", async () => {
        const config = createConfig();
        await RapunzelStorage.saveConfig(config);

        const loaded = await RapunzelStorage.loadConfig();
        expect(loaded).toEqual(config);
    });

    test("persists library entries", async () => {
        const library = {
            "NHentai.1": createLibraryBook("1", 100),
            "NHentai.2": createLibraryBook("2", 200),
        };

        await RapunzelStorage.saveLibrary(library);
        expect(await RapunzelStorage.loadLibrary()).toEqual(library);

        await RapunzelStorage.clearLibrary();
        expect(await RapunzelStorage.loadLibrary()).toEqual({});
    });

    test("persists feed cache snapshots", async () => {
        const latest: LatestBooksState = {
            activeProcessId: "latest",
            bookListRecord: {
                a: {
                    id: "a",
                    title: "Latest",
                    cover: { uri: "https://example.com/a.jpg" },
                    availableLanguages: [LilithLanguage.english],
                    savedAt: 1,
                },
            },
            cachedImagesRecord: {
                a: { id: "a", value: "https://example.com/a.jpg" },
            },
            page: 2,
        };
        const trending: PopularBooksState = {
            activeProcessId: "trending",
            bookListRecord: {
                b: {
                    id: "b",
                    title: "Trending",
                    cover: { uri: "https://example.com/b.jpg" },
                    availableLanguages: [LilithLanguage.english],
                    savedAt: 2,
                },
            },
            cachedImagesRecord: {
                b: { id: "b", value: "https://example.com/b.jpg" },
            },
        };

        const feed: StoredFeedCache = { latest, trending };

        await RapunzelStorage.saveFeed(feed);
        expect(await RapunzelStorage.loadFeed()).toEqual(feed);

        await RapunzelStorage.clearFeed();
        expect(await RapunzelStorage.loadFeed()).toEqual({});
    });
});

describe("LibraryUtils", () => {
    test("filters rendered ids by repo and sorts by savedAt desc", () => {
        const config = createConfig();
        config.repository = LilithRepo.NHentai;

        const library = {
            "NHentai.1": createLibraryBook("1", 100),
            "MangaDex.2": createLibraryBook("2", 300),
            "NHentai.3": createLibraryBook("3", 200),
        };

        const state = LibraryUtils.buildLibraryState(library, config);
        expect(state.saved).toBe(library);
        expect(state.rendered).toEqual(["NHentai.3", "NHentai.1"]);
    });
});
