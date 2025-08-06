import { Image } from "react-native";
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

import { RapunzelImage } from "../store/interfaces";
import { RapunzelCache, StaticLibraryPaths } from "../cache/useRapunzelCache";
import { CacheUtils } from "../cache/CacheUtils";
import { VirtualItem } from "../components/virtualList/interfaces";
import { useRapunzelLibrary } from "../components/cache/library";
import { useLilithAPI } from "./api";

const NumberOfForceRenderImages = 20;
export const FallbackCacheExtension = LilithImageExtension.jpg;

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
    } = useRapunzelStore();

    const apiLoader = useLilithAPI();

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
        const book = await apiLoader
            .getBook(code, options)
            .catch(RapunzelLog.error);
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
        const chapter = await apiLoader
            .getChapter(chapterId)
            .catch(RapunzelLog.error);

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
        const images = chapter.pages.map((page) => page.uri);

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
                    pageNumber: index + 1,
                    extension: FallbackCacheExtension,
                }),
            onImageLoaded: async (url, index) => {
                const newImage = {
                    id: `${index + 1}`,
                    index,
                    value: { uri: url } as RapunzelImage,
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
        const searchResult = await apiLoader.search(searchValue, {
            ...searchOptions,
        });

        // If no search results or the results array is empty, log an error and return null
        if (!searchResult || searchResult.results.length === 0) {
            RapunzelLog.error(`[loadSearch] Search returned no results`);
            return null;
        }

        return searchResult;
    };

    interface BookBaseData {
        imagesToCache: string[];
        bookDict: Record<string, BookBase>;
        imageList: VirtualItem<string>[];
    }
    const getBookBaseData = (bookBaseList: BookBase[]): BookBaseData => {
        // Initialize arrays and dictionary to store images to cache and book information
        const imagesToCache: string[] = [];
        const bookDict: Record<string, BookBase> = {};
        const imageList: VirtualItem<string>[] = [];

        // Iterate through search results and populate imagesToCache and bookDict
        bookBaseList.forEach((book, index) => {
            imagesToCache.push(book.cover.uri);
            bookDict[book.id] = book;
            imageList.push({
                id: book.id,
                value: book.cover.uri,
            });
        });

        // Return an object containing imagesToCache, bookDict, and searchResult
        return { imagesToCache, bookDict, imageList };
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
    ): Promise<string[]> => {
        // If not cleaning and a search is already in progress, return an empty array
        if (!clean && loading.browse) return [];

        // Set the loader.browse flag to true to indicate that a search is in progress
        loading.browse = true;

        // Define a callback to execute when the search process finishes, either successfully or not
        const onFinish = () => {
            loading.browse = false;
        };

        // If cleaning, reset Browse state variables
        if (clean) {
            browse.cachedImagesRecord = {};
            browse.bookListRecord = {};
            browse.activeProcessId = getNewId();
            browse.page = 1;
        }

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
            onFinish();
            return [];
        }

        const { imagesToCache, bookDict, imageList } = getBookBaseData(
            searchResult.results,
        );

        // Update the Browse state with search results and loaded images
        browse.bookListRecord = {
            ...browse.bookListRecord,
            ...bookDict,
        };

        // If a specific page is provided in searchOptions, update the Browse page
        if (searchOptions?.page) {
            browse.page = searchOptions.page;
        }

        // Load images asynchronously using loadImageList utility
        const promise = RapunzelCache.downloadImageList({
            id: browse.activeProcessId,
            imagesPath: StaticLibraryPaths.SearchResults,
            deviceDownloadPath: config.cacheTempImageLocation,
            forceDownload: !config.enableCache,
            data: imagesToCache,
            onFileNaming: ({ index }) =>
                CacheUtils.getFileName({
                    book: imageList[index].id,
                    chapter: "cover",
                    extension: FallbackCacheExtension,
                }),
            onImageLoaded: async (url, index) => {
                browse.cachedImagesRecord[imageList[index].id] = {
                    id: imageList[index].id,
                    value: url,
                };
            },
            shouldCancelLoad: (id) => {
                const cancel = id !== browse.activeProcessId;
                if (cancel) RapunzelLog.log("[loadBook] Skipping id ", id);
                return cancel;
            },
        });

        promise.catch(RapunzelLog.error);
        // Handle the result of the image loading process
        promise.finally(onFinish);

        // Return the Promise for further handling, if needed
        return promise;
    };

    const getLatestBooks = async (
        page: number = 1,
        clean: boolean = true,
    ): Promise<string[]> => {
        // If not cleaning and a search is already in progress, return an empty array
        if (!clean && loading.latest) return [];

        // Set the loader.browse flag to true to indicate that a search is in progress
        loading.latest = true;

        // Define a callback to execute when the search process finishes, either successfully or not
        const onFinish = () => {
            loading.latest = false;
        };

        // If cleaning, reset Browse state variables
        if (clean) {
            latest.cachedImagesRecord = {};
            latest.bookListRecord = {};
            latest.activeProcessId = getNewId();
            latest.page = 1;
        }

        RapunzelLog.log("[getLatestBooks] Retrieving latest books");

        // Perform the search and retrieve book information, image URIs, and book dictionary
        const bookListResults: BookListResults = await apiLoader.getLatestBooks(
            page,
        );

        // If no search results, finish and return an empty array
        if (!bookListResults) {
            onFinish();
            return [];
        }

        const { imagesToCache, bookDict, imageList } = getBookBaseData(
            bookListResults.results,
        );

        // Update the LatestBooks state with search results and loaded images
        latest.bookListRecord = {
            ...latest.bookListRecord,
            ...bookDict,
        };

        // If a specific page is provided in searchOptions, update the latest page
        if (page) {
            latest.page = page;
        }

        // Load images asynchronously using loadImageList utility
        const promise = RapunzelCache.downloadImageList({
            id: latest.activeProcessId,
            data: imagesToCache,
            forceDownload: !config.enableCache,
            imagesPath: StaticLibraryPaths.MainFeed,
            deviceDownloadPath: config.cacheTempImageLocation,
            onFileNaming: ({ index }) =>
                CacheUtils.getFileName({
                    book: imageList[index].id,
                    chapter: "cover",
                    extension: FallbackCacheExtension,
                }),
            onImageLoaded: async (url, index) => {
                const newItem = {
                    id: imageList[index].id,
                    value: url,
                };
                latest.cachedImagesRecord[newItem.id] = newItem;
            },
            shouldCancelLoad: (id) => {
                const cancel = id !== latest.activeProcessId;
                if (cancel)
                    RapunzelLog.log(
                        "[getLatestBooks.loadImagelist.shouldCancelLoad] Skipping id ",
                        id,
                    );
                return cancel;
            },
        });

        promise.catch(RapunzelLog.error);
        // Handle the result of the image loading process
        promise.finally(onFinish);

        // Return the Promise for further handling, if needed
        return promise;
    };

    const getTrendingBooks = async (
        clean: boolean = true,
    ): Promise<string[]> => {
        // If not cleaning and a search is already in progress, return an empty array
        if (!clean && loading.trending) return [];

        // Set the loader.browse flag to true to indicate that a search is in progress
        loading.trending = true;

        // Define a callback to execute when the search process finishes, either successfully or not
        const onFinish = () => {
            loading.trending = false;
        };

        // If cleaning, reset Browse state variables
        if (clean) {
            popular.cachedImagesRecord = {};
            popular.bookListRecord = {};
            popular.activeProcessId = getNewId();
        }

        RapunzelLog.log("[getTrendingBooks] Retrieving latest books");

        // Perform the search and retrieve book information, image URIs, and book dictionary
        const bookListResults: BookListResults = {
            page: 1,
            results: await apiLoader.getTrendingBooks(),
        };

        // If no search results, finish and return an empty array
        if (!bookListResults) {
            onFinish();
            return [];
        }

        const { imagesToCache, bookDict, imageList } = getBookBaseData(
            bookListResults.results,
        );

        // Update the LatestBooks state with search results and loaded images
        popular.bookListRecord = {
            ...popular.bookListRecord,
            ...bookDict,
        };

        // Load images asynchronously using loadImageList utility
        const promise = RapunzelCache.downloadImageList({
            id: popular.activeProcessId,
            data: imagesToCache,
            forceDownload: !config.enableCache,
            imagesPath: StaticLibraryPaths.Trending,
            deviceDownloadPath: config.cacheTempImageLocation,
            onFileNaming: ({ index }) =>
                CacheUtils.getFileName({
                    book: imageList[index].id,
                    chapter: "cover",
                    extension: FallbackCacheExtension,
                }),
            onImageLoaded: async (url, index) => {
                popular.cachedImagesRecord[imageList[index].id] = {
                    id: imageList[index].id,
                    value: url,
                };
            },
            shouldCancelLoad: (id) => {
                const cancel = id !== popular.activeProcessId;
                if (cancel)
                    RapunzelLog.log(
                        "[getTrendingBooks.loadImagelist.shouldCancelLoad] Skipping id ",
                        id,
                    );
                return cancel;
            },
        });

        promise.catch(RapunzelLog.error);
        // Handle the result of the image loading process
        promise.finally(onFinish);

        // Return the Promise for further handling, if needed
        return promise;
    };

    return {
        loadSearch,
        loadBook,
        loadChapter,
        getLatestBooks,
        getTrendingBooks,
    };
};
