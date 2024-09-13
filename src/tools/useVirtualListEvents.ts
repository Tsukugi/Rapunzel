import { BookBase } from "@atsu/lilith";
import { useRapunzelLoader } from "../api/loader";
import { useRapunzelLibrary } from "../components/cache/library";
import { goToFirstChapterOrSelectChapter } from "../components/navigators/goToFirstChapterOrSelect";
import { BrowserItemProps } from "../components/paper/item/browserItem";
import { UsesNavigation } from "../components/navigators/interfaces";
import { useRapunzelStore } from "../store/store";

export interface UseVirtualListProps extends UsesNavigation {
    forceAllLanguages?: boolean;
    onClick?: BookEvent;
    onLongClick?: BookEvent;
}

type BookEvent = (bookBase: BookBase) => Promise<void>;

export const useVirtualListEvents = ({
    navigation,
    forceAllLanguages = false,
    onClick,
    onLongClick,
}: UseVirtualListProps) => {
    const { saveBookToLibrary, removeBookFromLibrary } = useRapunzelLibrary();

    const onBookSelectHandler: BookEvent = async (bookBase: BookBase) => {
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

    const onBookSaveHandler: BookEvent = async (bookBase: BookBase) => {
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
        if (!book) return;

        await saveBookToLibrary(book);

        // We make available the first chapter beforehand
        if (book?.chapters.length === 1) {
            loadChapter(bookBase.id, book.chapters[0].id);
        }
    };

    const onRemoveFromLibraryHandler: BookEvent = async (
        bookBase: BookBase,
    ) => {
        await removeBookFromLibrary(bookBase);
    };

    const getVirtualItemProps = (
        bookBase: BookBase | null,
    ): BrowserItemProps | null => {
        if (!bookBase) return null;

        return {
            cover: bookBase.cover.uri,
            bookBase,
            onClick: onClick || onBookSelectHandler,
            onLongClick: onLongClick || onBookSaveHandler,
        };
    };

    return {
        getVirtualItemProps,
        onBookSaveHandler,
        onBookSelectHandler,
        onRemoveFromLibraryHandler,
    };
};
