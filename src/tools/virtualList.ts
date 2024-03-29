import { BookBase, LilithLanguage } from "@atsu/lilith";
import { useRapunzelLoader } from "../api/loader";
import { saveBookToLibrary } from "../components/cache/saveBookToLibrary";
import { goToFirstChapterOrSelectChapter } from "../components/navigators/goToFirstChapterOrSelect";
import { BrowserItemProps } from "../components/paper/item/browserItem";
import { UsesNavigation } from "../components/navigators/interfaces";

export interface UuseVirtualListProps extends UsesNavigation {
    forceAllLanguages?: boolean;
}

export const useVirtualList = ({
    navigation,
    forceAllLanguages = false,
}: UuseVirtualListProps) => {
    const onMangaSelectHandler = async (bookBase: BookBase) => {
        const { loadBook } = useRapunzelLoader({
            useAllLanguages: forceAllLanguages,
        });
        const book = await loadBook(bookBase.id, {
            chapterList: {
                page: 1,
                size: 50,
                orderBy: "desc",
            },
        });
        if (!book) return;
        goToFirstChapterOrSelectChapter({
            book,
            navigation,
        });
    };

    const onMangaSaveHandler = async (bookBase: BookBase) => {
        const { loadBook, loadChapter } = useRapunzelLoader({
            useAllLanguages: forceAllLanguages,
        });
        const book = await loadBook(bookBase.id, {
            /**
             * No Need for much chapters to load when saving
             */
            chapterList: {
                page: 1,
                size: 10,
            },
        });
        if (!book) return null;

        // We make available the first chapter beforehand
        if (book?.chapters.length === 1) {
            loadChapter(book.chapters[0].id);
        }

        saveBookToLibrary(book);
    };

    const getVirtualItemProps = (
        bookBase: BookBase | null,
    ): BrowserItemProps | null => {
        if (!bookBase) return null;

        return {
            cover: bookBase.cover.uri,
            bookBase,
            onClick: onMangaSelectHandler,
            onLongClick: onMangaSaveHandler,
        };
    };

    return { getVirtualItemProps };
};
