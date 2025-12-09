import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { useRapunzelLoader } from "../src/api/loader";
import { ViewNames } from "../src/components/navigators/interfaces";
import { LilithRepo } from "../src/store/interfaces";

jest.mock("@atsu/lilith", () => ({
    LilithImageExtension: { webp: "webp" },
}));

let mockStoreState: any;
let mockApiClient: any;
let mockDownloadImageList: any;
let mockRandomId = "id-0";

jest.mock("../src/store/store", () => ({
    useRapunzelStore: () => mockStoreState,
}));

jest.mock("../src/api/api", () => ({
    useLilithAPI: () => mockApiClient,
}));

jest.mock("../src/cache/useRapunzelCache", () => ({
    RapunzelCache: {
        downloadImageList: (...args: any[]) => mockDownloadImageList(...args),
    },
    StaticLibraryPaths: {
        SearchResults: "cache/search",
        MainFeed: "cache/main",
        Trending: "cache/trending",
        ReadBooks: "cache/read",
    },
}));

jest.mock("../src/components/cache/library", () => ({
    useRapunzelLibrary: () => ({
        getLibraryId: (bookId: string) => `library-${bookId}`,
    }),
}));

jest.mock("../src/config/log", () => ({
    RapunzelLog: {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

jest.mock("../src/tools/random", () => ({
    RandomTools: {
        generateRandomId: () => mockRandomId,
    },
}));

const createStoreState = () => ({
    loading: [
        { browse: false, reader: false, trending: false, latest: false },
        jest.fn(),
    ],
    reader: [
        {
            activeProcessId: "",
            book: null,
            chapter: null,
            cachedImages: [],
            chapterPage: 1,
        },
        jest.fn(),
    ],
    browse: [
        {
            activeProcessId: "",
            bookListRecord: {},
            cachedImagesRecord: {},
            rendered: [],
            page: 1,
        },
        jest.fn(),
    ],
    config: [
        {
            debug: false,
            enableCache: true,
            useFallbackExtensionOnDownload: false,
            cachelibraryLocation: "Downloads",
            cacheTempImageLocation: "Temp",
            apiLoaderConfig: {},
            webviewUrl: "https://example.com",
            initialView: ViewNames.RapunzelMainFeed,
            repository: LilithRepo.NHentai,
            languages: [],
        },
        jest.fn(),
    ],
    latest: [
        {
            activeProcessId: "",
            bookListRecord: {},
            cachedImagesRecord: {},
            rendered: [],
            page: 1,
        },
        jest.fn(),
    ],
    library: [{ saved: {}, rendered: [] }, jest.fn()],
    trending: [
        {
            activeProcessId: "",
            bookListRecord: {},
            cachedImagesRecord: {},
            rendered: [],
        },
        jest.fn(),
    ],
    ui: [{ snackMessage: "" }, jest.fn()],
});

beforeEach(() => {
    mockStoreState = createStoreState();
    mockApiClient = {
        search: jest.fn(),
        getBook: jest.fn(),
        getChapter: jest.fn(),
        getLatestBooks: jest.fn(),
        getTrendingBooks: jest.fn(),
    };
    mockDownloadImageList = jest.fn(async (options: any) => {
        const results: string[] = [];
        for (let i = 0; i < options.data.length; i++) {
            const url = `cached-${i}`;
            if (!options.shouldCancelLoad || !options.shouldCancelLoad(options.id)) {
                if (options.onImageLoaded) {
                    await options.onImageLoaded(url, i);
                }
                results.push(url);
            }
        }
        return results;
    });
    mockRandomId = "id-" + Math.random().toString(36).slice(2, 7);
});

describe("useRapunzelLoader search and feeds", () => {
    test("loadSearch caches covers and updates browse state", async () => {
        const results = [
            { id: "book-1", cover: { uri: "cover-1" } },
            { id: "book-2", cover: { uri: "cover-2" } },
        ];
        mockApiClient.search.mockResolvedValue({ results });

        const loader = useRapunzelLoader();
        const cached = await loader.loadSearch("query", { page: 2 });

        expect(mockApiClient.search).toHaveBeenCalledWith("query", { page: 2 });
        expect(mockDownloadImageList).toHaveBeenCalledTimes(1);

        const downloadArgs = mockDownloadImageList.mock.calls[0][0];
        expect(downloadArgs.imagesPath).toBe("cache/search");
        expect(downloadArgs.deviceDownloadPath).toBe("Temp");
        expect(downloadArgs.forceDownload).toBe(false);
        expect(downloadArgs.id).toBeDefined();

        expect(mockStoreState.browse[0].bookListRecord["book-1"].cover.uri).toBe(
            "cover-1",
        );
        expect(mockStoreState.browse[0].cachedImagesRecord["book-1"].value).toBe(
            "cached-0",
        );
        expect(mockStoreState.browse[0].page).toBe(2);
        expect(mockStoreState.loading[0].browse).toBe(false);
        expect(cached).toEqual(["cached-0", "cached-1"]);
    });

    test("loadSearch preserves result order even if downloads finish out of order", async () => {
        const results = [
            { id: "book-1", cover: { uri: "cover-1" } },
            { id: "book-2", cover: { uri: "cover-2" } },
            { id: "book-3", cover: { uri: "cover-3" } },
        ];
        mockApiClient.search.mockResolvedValue({ results });
        mockDownloadImageList = jest.fn(async (options: any) => {
            const urls: string[] = [];
            // Simulate images finishing from last to first.
            for (let i = options.data.length - 1; i >= 0; i--) {
                const url = `cached-reverse-${i}`;
                if (options.onImageLoaded) {
                    await options.onImageLoaded(url, i);
                }
                urls.push(url);
            }
            return urls;
        });

        const loader = useRapunzelLoader();
        await loader.loadSearch("query");

        const { cachedImagesRecord } = mockStoreState.browse[0];
        expect(Object.keys(cachedImagesRecord)).toEqual([
            "book-1",
            "book-2",
            "book-3",
        ]);
        expect(Object.values(cachedImagesRecord).map((v) => v.id)).toEqual([
            "book-1",
            "book-2",
            "book-3",
        ]);
        expect(cachedImagesRecord["book-3"].value).toBe("cached-reverse-2");
    });

    test("loadSearch appends render order when paging", async () => {
        const pageOne = [
            { id: "101", cover: { uri: "cover-101" } },
            { id: "105", cover: { uri: "cover-105" } },
        ];
        const pageTwo = [
            { id: "099", cover: { uri: "cover-099" } },
            { id: "120", cover: { uri: "cover-120" } },
        ];

        mockApiClient.search
            .mockResolvedValueOnce({ results: pageOne })
            .mockResolvedValueOnce({ results: pageTwo });

        const loader = useRapunzelLoader();
        await loader.loadSearch("query", { page: 1 });
        await loader.loadSearch("query", { page: 2 }, false);

        expect(mockStoreState.browse[0].rendered).toEqual([
            "101",
            "105",
            "099",
            "120",
        ]);
    });

    test("getLatestBooks caches feed and tracks page", async () => {
        const results = [{ id: "latest-1", cover: { uri: "latest-cover" } }];
        mockApiClient.getLatestBooks.mockResolvedValue({ page: 3, results });

        const loader = useRapunzelLoader();
        const cached = await loader.getLatestBooks(3);

        expect(mockApiClient.getLatestBooks).toHaveBeenCalledWith(3);
        const downloadArgs = mockDownloadImageList.mock.calls[0][0];
        expect(downloadArgs.imagesPath).toBe("cache/main");
        expect(downloadArgs.deviceDownloadPath).toBe("Temp");
        expect(mockStoreState.latest[0].bookListRecord["latest-1"].cover.uri).toBe(
            "latest-cover",
        );
        expect(mockStoreState.latest[0].page).toBe(3);
        expect(mockStoreState.loading[0].latest).toBe(false);
        expect(cached).toEqual(["cached-0"]);
    });

    test("getTrendingBooks caches feed", async () => {
        const results = [
            { id: "trend-1", cover: { uri: "trend-cover-1" } },
            { id: "trend-2", cover: { uri: "trend-cover-2" } },
        ];
        mockApiClient.getTrendingBooks.mockResolvedValue(results);

        const loader = useRapunzelLoader();
        const cached = await loader.getTrendingBooks();

        expect(mockApiClient.getTrendingBooks).toHaveBeenCalled();
        const downloadArgs = mockDownloadImageList.mock.calls[0][0];
        expect(downloadArgs.imagesPath).toBe("cache/trending");
        expect(downloadArgs.deviceDownloadPath).toBe("Temp");
        expect(mockStoreState.trending[0].bookListRecord["trend-1"].cover.uri).toBe(
            "trend-cover-1",
        );
        expect(mockStoreState.loading[0].trending).toBe(false);
        expect(cached).toEqual(["cached-0", "cached-1"]);
    });
});

describe("useRapunzelLoader book and chapter flows", () => {
    test("loadBook resets reader when clean", async () => {
        mockApiClient.getBook.mockResolvedValue({
            id: "book-123",
            chapters: [{ id: "c1" }, { id: "c2" }],
        });

        const loader = useRapunzelLoader();
        const book = await loader.loadBook("book-123");

        expect(mockApiClient.getBook).toHaveBeenCalledWith("book-123", {});
        expect(mockStoreState.reader[0].book?.chapters.length).toBe(2);
        expect(mockStoreState.reader[0].chapterPage).toBe(1);
        expect(mockStoreState.loading[0].browse).toBe(false);
        expect(book?.id).toBe("book-123");
    });

    test("loadBook appends chapters when not clean and keeps page", async () => {
        mockStoreState.reader[0].book = {
            id: "book-123",
            chapters: [{ id: "c1" }],
        };
        mockApiClient.getBook.mockResolvedValue({
            id: "book-123",
            chapters: [{ id: "c2" }],
        });

        const loader = useRapunzelLoader();
        const book = await loader.loadBook(
            "book-123",
            { chapterList: { page: 3 } },
            false,
        );

        expect(book?.chapters.length).toBe(1); // original API result unchanged
        expect(mockStoreState.reader[0].book?.chapters.length).toBe(2);
        expect(mockStoreState.reader[0].chapterPage).toBe(3);
        expect(mockStoreState.loading[0].browse).toBe(false);
    });

    test("loadBook returns null when no chapters", async () => {
        mockApiClient.getBook.mockResolvedValue({ id: "book-empty", chapters: [] });
        const loader = useRapunzelLoader();

        const book = await loader.loadBook("book-empty");

        expect(book).toBeNull();
        expect(mockStoreState.reader[0].book).toBe(null);
        expect(mockStoreState.loading[0].browse).toBe(false);
    });

    test("loadChapter downloads images and updates reader cache", async () => {
        mockStoreState.library[0].saved["library-book-abc"] = {
            id: "library-book-abc",
            savedAt: Date.now(),
        };
        mockApiClient.getChapter.mockResolvedValue({
            id: "chapter-1",
            pages: [{ uri: "img-1" }, { uri: "img-2" }],
        });
        mockRandomId = "chapter-id";

        const loader = useRapunzelLoader();
        const images = await loader.loadChapter("book-abc", "chapter-1");

        expect(mockApiClient.getChapter).toHaveBeenCalledWith("chapter-1");
        const downloadArgs = mockDownloadImageList.mock.calls[0][0];
        expect(downloadArgs.imagesPath).toBe(
            "cache/read/NHentai/book-abc/chapter-1",
        );
        expect(downloadArgs.deviceDownloadPath).toBe("Downloads");
        expect(mockStoreState.reader[0].chapter?.id).toBe("chapter-1");
        expect(mockStoreState.reader[0].cachedImages.length).toBe(2);
        expect(mockStoreState.reader[0].cachedImages[0].value.uri).toBe("cached-0");
        expect(mockStoreState.loading[0].reader).toBe(false);
        expect(images).toEqual(["cached-0", "cached-1"]);
    });
});
