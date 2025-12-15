import {
    Book,
    BookBase,
    BookListResults,
    Chapter,
    GetBookOptions,
    SearchQueryOptions,
} from "@atsu/lilith";
import { useRapunzelStore, RapunzelImage, VirtualItem } from "../store";
import { RapunzelLog } from "../config/log";
import { useLilithAPI } from "./useLilithAPI";

const generateVirtualItems = (bookBaseList: BookBase[]) => {
    const bookDict: Record<string, BookBase> = {};
    const cachedImagesRecord: Record<string, VirtualItem<string>> = {};

    bookBaseList.forEach((book) => {
        bookDict[book.id] = book;
        cachedImagesRecord[book.id] = {
            id: book.id,
            value: book.cover.uri,
        };
    });

    return { bookDict, cachedImagesRecord };
};

const getPageImages = (chapter: Chapter): VirtualItem<RapunzelImage>[] =>
    chapter.pages.map((page, index) => ({
        id: `${index + 1}`,
        value: {
            uri: page.uri,
            width: page.width ?? null,
            height: page.height ?? null,
        },
    }));

export const useRapunzelLoader = () => {
    const {
        loading: [loading],
        reader: [reader],
        browse: [browse],
        config: [config],
        latest: [latest],
        trending: [popular],
    } = useRapunzelStore();

    const apiLoader = useLilithAPI();

    const loadBook = async (
        code: string,
        options: Partial<GetBookOptions> = {},
        clean: boolean = true,
    ): Promise<Book | null> => {
        if (!clean && loading.reader) return null;

        loading.reader = true;
        const onFinish = () => {
            loading.reader = false;
        };

        try {
            const book = await apiLoader.getBook(code, options);
            if (!book || book.chapters.length === 0) return null;

            if (clean) {
                reader.book = book;
                reader.chapterPage = 1;
            } else {
                reader.book = {
                    ...book,
                    chapters: [...(reader.book?.chapters || []), ...book.chapters],
                };
                if (options.chapterList?.page) {
                    reader.chapterPage = options.chapterList.page;
                }
            }

            return book;
        } catch (error) {
            RapunzelLog.error("[loadBook]", error);
            return null;
        } finally {
            onFinish();
        }
    };

    const loadChapter = async (
        bookId: string,
        chapterId: string,
    ): Promise<string[]> => {
        loading.reader = true;
        const onFinish = () => {
            loading.reader = false;
        };

        try {
            const chapter = await apiLoader.getChapter(chapterId);
            if (!chapter) return [];

            reader.chapter = chapter;
            reader.activeProcessId = `${Date.now()}`;
            reader.cachedImages = getPageImages(chapter);

            return chapter.pages.map((page) => page.uri);
        } catch (error) {
            RapunzelLog.error("[loadChapter]", error);
            return [];
        } finally {
            onFinish();
        }
    };

    const loadSearch = async (
        searchValue: string,
        searchOptions?: Partial<SearchQueryOptions>,
        clean: boolean = true,
    ): Promise<string[]> => {
        if (!clean && loading.browse) return [];
        loading.browse = true;

        const onFinish = () => {
            loading.browse = false;
        };

        if (clean) {
            browse.cachedImagesRecord = {};
            browse.bookListRecord = {};
            browse.page = 1;
        }

        try {
            const searchResult = await apiLoader.search(searchValue, searchOptions);
            if (!searchResult || searchResult.results.length === 0) return [];

            const { bookDict, cachedImagesRecord } = generateVirtualItems(
                searchResult.results,
            );

            browse.bookListRecord = {
                ...browse.bookListRecord,
                ...bookDict,
            };
            browse.cachedImagesRecord = {
                ...browse.cachedImagesRecord,
                ...cachedImagesRecord,
            };

            if (searchOptions?.page) {
                browse.page = searchOptions.page;
            }

            return Object.values(cachedImagesRecord).map((item) => item.value);
        } catch (error) {
            RapunzelLog.error("[loadSearch]", error);
            return [];
        } finally {
            onFinish();
        }
    };

    const getLatestBooks = async (
        page: number = 1,
        clean: boolean = true,
    ): Promise<string[]> => {
        if (!clean && loading.latest) return [];
        loading.latest = true;

        const onFinish = () => {
            loading.latest = false;
        };

        if (clean) {
            latest.cachedImagesRecord = {};
            latest.bookListRecord = {};
            latest.page = 1;
        }

        try {
            const bookListResults: BookListResults = await apiLoader.getLatestBooks(
                page,
            );
            if (!bookListResults || !bookListResults.results.length) return [];

            const { bookDict, cachedImagesRecord } = generateVirtualItems(
                bookListResults.results,
            );

            latest.bookListRecord = {
                ...latest.bookListRecord,
                ...bookDict,
            };
            latest.cachedImagesRecord = {
                ...latest.cachedImagesRecord,
                ...cachedImagesRecord,
            };
            latest.page = page;

            return Object.values(cachedImagesRecord).map((item) => item.value);
        } catch (error) {
            RapunzelLog.error("[getLatestBooks]", error);
            return [];
        } finally {
            onFinish();
        }
    };

    const getTrendingBooks = async (clean: boolean = true): Promise<string[]> => {
        if (!clean && loading.trending) return [];
        loading.trending = true;

        const onFinish = () => {
            loading.trending = false;
        };

        if (clean) {
            popular.cachedImagesRecord = {};
            popular.bookListRecord = {};
        }

        try {
            const results = await apiLoader.getTrendingBooks();
            if (!results || results.length === 0) return [];

            const { bookDict, cachedImagesRecord } = generateVirtualItems(results);

            popular.bookListRecord = {
                ...popular.bookListRecord,
                ...bookDict,
            };
            popular.cachedImagesRecord = {
                ...popular.cachedImagesRecord,
                ...cachedImagesRecord,
            };

            return Object.values(cachedImagesRecord).map((item) => item.value);
        } catch (error) {
            RapunzelLog.error("[getTrendingBooks]", error);
            return [];
        } finally {
            onFinish();
        }
    };

    return {
        getLatestBooks,
        getTrendingBooks,
        loadBook,
        loadChapter,
        loadSearch,
    };
};
