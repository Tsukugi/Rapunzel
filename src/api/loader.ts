import {
    Book,
    BookBase,
    SearchResult,
    BookListResults,
    SearchQueryOptions,
    GetBookOptions,
    LilithImageExtension,
} from "@atsu/lilith";

import { RapunzelLog } from "../config/log";
import { useRapunzelStore } from "../store/store";
import { RandomTools } from "../tools/random";

import { BookBaseList, RapunzelImage } from "../store/interfaces";
import { RapunzelCache, StaticLibraryPaths } from "../cache/useRapunzelCache";
import { CacheUtils } from "../cache/CacheUtils";
import {
    getBrowseCacheKey,
    getEntryUid,
    getFeedCacheKey,
    getTrendingCacheKey,
} from "../cache/listCache";
import { VirtualItem } from "../components/virtualList/interfaces";
import { useRapunzelLibrary } from "../components/cache/library";
import { useLilithAPI } from "./api";
import { useAutoFetchWebviewData } from "../process/autoFetchWebviewData";
import { getNavigationRef } from "../components/navigators/navigationRef";
import { ListUtils } from "../tools/list";
const NumberOfForceRenderImages = 20;
export const FallbackCacheExtension = LilithImageExtension.webp;
const ImageCacheRevision = "v2";

interface UseRapunzelLoaderProps {
    useAllLanguages: boolean;
}

export const useRapunzelLoader = (props?: UseRapunzelLoaderProps) => {
    const getNewId = () => RandomTools.generateRandomId(10);

    const {
        loading: [loading],
        reader: [reader],
        browse: [browse],
        config: [config],
        latest: [latest],
        library: [library],
        trending: [popular],
        ui: [ui],
    } = useRapunzelStore();

    const apiLoader = useLilithAPI();

    const startWebviewClearance = (message?: string) => {
        const navigation = getNavigationRef();
        if (!navigation) {
            RapunzelLog.warn(
                "[useRapunzelLoader.startWebviewClearance] Navigation not ready",
            );
            return;
        }
        ui.snackMessage =
            message ||
            "Refreshing cookies... please solve the challenge in the WebView.";
        const { startProcess } = useAutoFetchWebviewData({
            navigation: navigation as never,
        });
        startProcess(config, true);
    };

    const isForbiddenError = (error: unknown): boolean => {
        if (!error) return false;
        if (typeof error === "string") return error.includes("403");
        if (typeof error === "object") {
            const err = error as Record<string, any>;
            const status =
                err?.status ??
                err?.statusCode ??
                err?.response?.status ??
                err?.data?.status ??
                err?.data?.statusCode;
            if (status === 403) return true;
            const message = err?.message;
            if (typeof message === "string" && message.includes("403")) {
                return true;
            }
        }
        return false;
    };

    const handleLilithRequestError = (error: unknown) => {
        RapunzelLog.error(error);
        if (isForbiddenError(error)) {
            startWebviewClearance();
        }
    };

    const withLilithRequest = async <T>(
        promise: Promise<T>,
    ): Promise<T | null> => {
        try {
            return await promise;
        } catch (error) {
            handleLilithRequestError(error);
            return null;
        }
    };

    /**
     * Loads a book based on its code, then saves it to the state.
     * @param {string} code - Unique id of a book.
     * @param {GetBookOptions} options - Unique id of a book.
     * @param {boolean} clean - Unique id of a book.
     * @returns {Promise<Book | null>} - A Promise that resolves to the loaded book. Returns null if the book loading fails or has no chapters.
     */
    const loadBook = async (
        code: string,
        options: Partial<GetBookOptions> = {},
        clean: boolean = true,
    ): Promise<Book | null> => {
        // If not cleaning and a search is already in progress, return an empty array
        if (!clean && loading.browse) return null;

        // Set the loader.browse flag to true to indicate that a search is in progress
        loading.browse = true;

        const onFinish = () => {
            loading.browse = false;
        };

        if (clean) {
            reader.chapterPage = 1;
        }

        if (options.chapterList?.page) {
            RapunzelLog.log(
                `[loadBook] Loading chapterList "page": ${options.chapterList.page}`,
            );
        }
        RapunzelLog.log("[loadBook] Loading book with code", code);

        // Retrieve the book information from the API, including language preferences from the configuration
        const book = await withLilithRequest(apiLoader.getBook(code, options));
        // If book retrieval fails or the book has no chapters, return null
        if (!book || book.chapters.length === 0) {
            onFinish();
            return null;
        }

        // Update the Reader state with the loaded book
        if (clean) {
            reader.book = book;
        } else {
            reader.book = {
                ...book,
                chapters: [...(reader.book?.chapters || []), ...book.chapters],
            };

            if (options.chapterList && options.chapterList.page) {
                reader.chapterPage = options.chapterList.page;
            }
        }
        // Return a resolved Promise with the loaded book for further handling, if needed
        const promise = Promise.resolve(book);

        onFinish();
        return promise;
    };

    /**
     * Loads a chapter based on its id, automatically downloading and caching the image list to the Reader state.
     * @param {string} book - Unique id of the containing book.
     * @param {string} chapterId - Unique id of the selected chapter.
     * @returns {Promise<string[] >} - A Promise that resolves to an array of cached image paths corresponding to the loaded images. Returns null if the chapter loading fails.
     */
    const loadChapter = async (
        bookId: string,
        chapterId: string,
    ): Promise<string[]> => {
        // Set the loader.reader flag to true to indicate that a chapter is being loaded
        loading.reader = true;

        RapunzelLog.log("[loadBook] Loading chapter from id", chapterId);

        // Retrieve the chapter information from the API
        const chapter = await withLilithRequest(
            apiLoader.getChapter(chapterId),
        );

        // Define a callback to execute when the chapter loading process finishes
        const onFinish = () => {
            loading.reader = false;
        };

        if (!chapter) {
            onFinish();
            return [];
        }

        const libraryBookId = useRapunzelLibrary().getLibraryId(bookId);

        // Extract image URIs from the chapter pages
        const images = chapter.pages as RapunzelImage[];

        // Update the Reader state with the loaded chapter information
        reader.chapter = chapter;
        reader.activeProcessId = getNewId();
        reader.cachedImages = [];

        // Load images asynchronously using loadImageList utility
        const promise = RapunzelCache.downloadImageList({
            id: reader.activeProcessId,
            data: images,
            forceDownload: !config.enableCache,
            imagesPath: `${StaticLibraryPaths.ReadBooks}/${config.repository}/${bookId}/${chapterId}`,
            deviceDownloadPath: library.saved[libraryBookId]
                ? config.cachelibraryLocation
                : config.cacheTempImageLocation,
            onFileNaming: ({ index }) =>
                CacheUtils.getFileName({
                    book: bookId,
                    chapter: `${chapterId}.${ImageCacheRevision}`,
                    pageNumber: index + 1,
                    extension: FallbackCacheExtension,
                }),
            onImageLoaded: async (url, index) => {
                const sourceImage = images[index];
                const newImage = {
                    id: `${index + 1}`,
                    index,
                    value: { ...sourceImage, uri: url } as RapunzelImage,
                };
                // * Recreating the array triggers an update, we will do this to initially render the Lists.
                // * But also if we always render we may run into stack size errors.
                if (index < NumberOfForceRenderImages) {
                    reader.cachedImages = [...reader.cachedImages, newImage];
                } else {
                    reader.cachedImages.push(newImage);
                }
            },
            shouldCancelLoad: (id) => {
                // Check if the loading process should be canceled
                const cancel = id !== reader.activeProcessId;
                if (cancel) RapunzelLog.log("[loadBook] Skipping id ", id);
                return cancel;
            },
        });

        promise.catch(RapunzelLog.error);
        // Execute the onFinish callback when the image loading process finishes
        promise.finally(onFinish);

        // Return the Promise for further handling, if needed
        return promise;
    };

    /**
     * Performs a search using the provided search value and options, loading data from an API.
     * @param {string} searchValue - The search query value.
     * @param {Partial<SearchQueryOptions>} [searchOptions] - Optional search query options.
     * @returns {Promise<SearchResult | null>} - A Promise that resolves to an object containing search results, images to cache, and a dictionary of books. Returns null if no results are found.
     */
    const getSearch = async (
        searchValue: string,
        searchOptions?: Partial<SearchQueryOptions>,
    ): Promise<SearchResult | null> => {
        // Perform a search using the apiLoader, including requiredLanguages from the configuration
        const searchResult = await withLilithRequest(
            apiLoader.search(searchValue, {
                ...searchOptions,
            }),
        );

        // If no search results or the results array is empty, log an error and return null
        if (!searchResult || searchResult.results.length === 0) {
            RapunzelLog.error(`[loadSearch] Search returned no results`);
            return null;
        }

        return searchResult;
    };

    interface BookBaseData {
        imagesToCache: RapunzelImage[];
        bookDict: Record<string, BookBase>;
        imageList: VirtualItem<string>[];
        sourceIds: string[];
    }
    const getBookBaseData = (
        bookBaseList: BookBase[],
        repository: string,
    ): BookBaseData => {
        // Initialize arrays and dictionary to store images to cache and book information
        const imagesToCache: RapunzelImage[] = [];
        const bookDict: Record<string, BookBase> = {};
        const imageList: VirtualItem<string>[] = [];
        const sourceIds: string[] = [];

        // Iterate through search results and populate imagesToCache and bookDict
        bookBaseList.forEach((book) => {
            const uid = getEntryUid(repository, book.id);
            imagesToCache.push(book.cover as RapunzelImage);
            bookDict[uid] = book;
            sourceIds.push(book.id);
            imageList.push({
                id: uid,
                value: book.cover.uri,
            });
        });

        // Return an object containing imagesToCache, bookDict, and searchResult
        return { imagesToCache, bookDict, imageList, sourceIds };
    };

    const ensureListMetadata = (
        state: BookBaseList,
        cacheKey: string,
    ): void => {
        state.cacheKey = state.cacheKey || cacheKey;
        if (state.loadedPages === undefined) state.loadedPages = {};
        if (state.entryMetaRecord === undefined) state.entryMetaRecord = {};
        state.lastFetchedAt = state.lastFetchedAt ?? null;
        state.hasNextPage = state.hasNextPage ?? true;
        state.scrollOffset = state.scrollOffset ?? 0;
    };

    const resetList = (state: BookBaseList, cacheKey: string): void => {
        state.cachedImagesRecord = {};
        state.bookListRecord = {};
        state.activeProcessId = getNewId();
        state.rendered = [];
        state.cacheKey = cacheKey;
        state.loadedPages = {};
        state.entryMetaRecord = {};
        state.lastFetchedAt = null;
        state.hasNextPage = true;
        state.scrollOffset = 0;
    };

    const isPageLoading = (state: BookBaseList, page: number) =>
        state.loadedPages?.[String(page)]?.status === "loading";

    const isPageLoaded = (state: BookBaseList, page: number) =>
        state.loadedPages?.[String(page)]?.status === "loaded";

    const startCoverDownload = ({
        state,
        data,
        imageList,
        sourceIds,
        imagesPath,
        activeProcessId,
    }: {
        state: BookBaseList;
        data: RapunzelImage[];
        imageList: VirtualItem<string>[];
        sourceIds: string[];
        imagesPath: string;
        activeProcessId: string;
    }): Promise<string[]> => {
        const promise = RapunzelCache.downloadImageList({
            id: activeProcessId,
            imagesPath,
            deviceDownloadPath: config.cacheTempImageLocation,
            forceDownload: !config.enableCache,
            data,
            onFileNaming: ({ index }) =>
                CacheUtils.getFileName({
                    book: sourceIds[index],
                    chapter: `cover.${ImageCacheRevision}`,
                    extension: FallbackCacheExtension,
                }),
            onImageLoaded: async (url, index) => {
                const uid = imageList[index].id;
                state.cachedImagesRecord[uid] = {
                    id: uid,
                    value: url,
                };
                const metadata = state.entryMetaRecord?.[uid];
                if (metadata) metadata.coverCachedAt = Date.now();
            },
            shouldCancelLoad: (id) => id !== state.activeProcessId,
        });

        promise.catch(RapunzelLog.error);
        return promise;
    };

    const mergeBookPage = ({
        state,
        result,
        data,
        page,
    }: {
        state: BookBaseList;
        result: BookListResults;
        data: BookBaseData;
        page: number;
    }): void => {
        const now = Date.now();
        const pageKey = String(page);
        const newRenderOrder = data.imageList.map((item) => item.id);

        state.bookListRecord = {
            ...state.bookListRecord,
            ...data.bookDict,
        };
        state.rendered = ListUtils.mergeUniqueValues(
            state.rendered,
            newRenderOrder,
        );

        data.imageList.forEach((item, index) => {
            const existing = state.cachedImagesRecord[item.id];
            if (!existing || !existing.value?.startsWith("file://")) {
                state.cachedImagesRecord[item.id] = item;
            }

            const existingMetadata = state.entryMetaRecord?.[item.id];
            if (state.entryMetaRecord) {
                state.entryMetaRecord[item.id] = {
                    uid: item.id,
                    firstSeenAt: existingMetadata?.firstSeenAt ?? now,
                    lastFetchedAt: now,
                    coverCachedAt: existingMetadata?.coverCachedAt ?? null,
                };
            }
        });

        if (state.loadedPages) {
            state.loadedPages[pageKey] = {
                status: "loaded",
                loadedAt: now,
                entryIds: newRenderOrder,
            };
        }
        state.lastFetchedAt = now;
        state.hasNextPage =
            typeof result.totalPages === "number"
                ? page < result.totalPages
                : result.results.length > 0;
        if ("page" in state) {
            (state as any).page = Math.max((state as any).page || 1, page);
        }
    };

    /**
     * Loads the matching books from a given search string. The book list is saved into the Browse state,
     * and the images are automatically downloaded and cached.
     * @param {string} searchValue - The search query value.
     * @param {Partial<SearchQueryOptions>} [searchOptions] - Optional search query options.
     * @param {boolean} [clean=true] - If true, clears the existing Browse state before loading the new search results.
     * @returns {Promise<string[]>} - A Promise that resolves to an array of cached image paths corresponding to the loaded images.
     */
    const loadSearch = async (
        searchValue: string,
        searchOptions?: Partial<SearchQueryOptions>,
        clean: boolean = true,
        force: boolean = false,
    ): Promise<string[]> => {
        const page = searchOptions?.page || 1;
        const cacheKey = getBrowseCacheKey(config.repository, searchValue);
        ensureListMetadata(browse, cacheKey);

        if (!clean && browse.cacheKey !== cacheKey) return [];
        if (!clean && (loading.browse || isPageLoading(browse, page))) return [];
        if (!clean && !force && isPageLoaded(browse, page)) return [];

        loading.browse = true;

        // If cleaning, reset Browse state variables
        if (clean) {
            resetList(browse, cacheKey);
            browse.page = 1;
        }
        ensureListMetadata(browse, cacheKey);
        browse.loadedPages![String(page)] = {
            status: "loading",
            loadedAt: null,
            entryIds: [],
        };

        RapunzelLog.log(
            "[loadSearch] Searching for the following",
            searchValue,
        );

        // Perform the search and retrieve book information, image URIs, and book dictionary
        const searchResult: SearchResult | null = await getSearch(
            searchValue,
            searchOptions,
        );

        // If no search results, finish and return an empty array
        if (!searchResult) {
            browse.loadedPages![String(page)] = {
                status: "failed",
                loadedAt: null,
                entryIds: [],
            };
            browse.hasNextPage = false;
            loading.browse = false;
            return [];
        }

        const data = getBookBaseData(searchResult.results, config.repository);
        mergeBookPage({ state: browse, result: searchResult, data, page });

        /**
         * Preserve the search order in the UI by pre-inserting placeholders in
         * the same order as the API results. Downloads may finish out-of-order,
         * so we guard against reordering by setting the records up-front and
         * letting the cache loader overwrite the values in-place later.
         */
        loading.browse = false;
        const promise = startCoverDownload({
            state: browse,
            data: data.imagesToCache,
            imageList: data.imageList,
            sourceIds: data.sourceIds,
            imagesPath: `${StaticLibraryPaths.BookCovers}/${config.repository}`,
            activeProcessId: browse.activeProcessId,
        });
        return promise;
    };

    const getLatestBooks = async (
        page: number = 1,
        clean: boolean = false,
        force: boolean = false,
    ): Promise<string[]> => {
        const cacheKey = getFeedCacheKey(config.repository);
        if (latest.cacheKey && latest.cacheKey !== cacheKey) {
            resetList(latest, cacheKey);
        }
        ensureListMetadata(latest, cacheKey);
        if (!clean && (loading.latest || isPageLoading(latest, page))) return [];
        if (!clean && !force && isPageLoaded(latest, page)) return [];

        loading.latest = true;

        // If cleaning, reset Browse state variables
        if (clean) {
            resetList(latest, cacheKey);
            latest.page = 1;
        }
        ensureListMetadata(latest, cacheKey);
        latest.loadedPages![String(page)] = {
            status: "loading",
            loadedAt: null,
            entryIds: [],
        };

        RapunzelLog.log("[getLatestBooks] Retrieving latest books");

        // Perform the search and retrieve book information, image URIs, and book dictionary
        const bookListResults = await withLilithRequest(
            apiLoader.getLatestBooks(page),
        );

        // If no search results, finish and return an empty array
        if (!bookListResults) {
            latest.loadedPages![String(page)] = {
                status: "failed",
                loadedAt: null,
                entryIds: [],
            };
            latest.hasNextPage = false;
            loading.latest = false;
            return [];
        }

        const data = getBookBaseData(
            bookListResults.results,
            config.repository,
        );
        mergeBookPage({ state: latest, result: bookListResults, data, page });
        loading.latest = false;
        return startCoverDownload({
            state: latest,
            data: data.imagesToCache,
            imageList: data.imageList,
            sourceIds: data.sourceIds,
            imagesPath: `${StaticLibraryPaths.BookCovers}/${config.repository}`,
            activeProcessId: latest.activeProcessId,
        });
    };

    const getTrendingBooks = async (
        clean: boolean = false,
        force: boolean = false,
    ): Promise<string[]> => {
        const cacheKey = getTrendingCacheKey(config.repository);
        if (popular.cacheKey && popular.cacheKey !== cacheKey) {
            resetList(popular, cacheKey);
        }
        ensureListMetadata(popular, cacheKey);
        if (!clean && loading.trending) return [];
        if (!clean && !force && isPageLoaded(popular, 1)) return [];

        loading.trending = true;

        // If cleaning, reset Browse state variables
        if (clean) {
            resetList(popular, cacheKey);
        }
        ensureListMetadata(popular, cacheKey);
        popular.loadedPages!["1"] = {
            status: "loading",
            loadedAt: null,
            entryIds: [],
        };

        RapunzelLog.log("[getTrendingBooks] Retrieving latest books");

        // Perform the search and retrieve book information, image URIs, and book dictionary
        const trendingResults = await withLilithRequest(
            apiLoader.getTrendingBooks(),
        );

        if (!trendingResults) {
            popular.loadedPages!["1"] = {
                status: "failed",
                loadedAt: null,
                entryIds: [],
            };
            loading.trending = false;
            return [];
        }

        const bookListResults: BookListResults = {
            page: 1,
            results: trendingResults,
        };

        // If no search results, finish and return an empty array
        const data = getBookBaseData(
            bookListResults.results,
            config.repository,
        );
        mergeBookPage({ state: popular, result: bookListResults, data, page: 1 });
        loading.trending = false;
        return startCoverDownload({
            state: popular,
            data: data.imagesToCache,
            imageList: data.imageList,
            sourceIds: data.sourceIds,
            imagesPath: `${StaticLibraryPaths.BookCovers}/${config.repository}`,
            activeProcessId: popular.activeProcessId,
        });
    };

    return {
        loadSearch,
        loadBook,
        loadChapter,
        getLatestBooks,
        getTrendingBooks,
    };
};
