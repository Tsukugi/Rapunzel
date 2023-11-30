import { BookBase } from "@atsu/lilith";
import { useRapunzelLoader } from "../api/loader";
import { saveBookToLibrary } from "../components/cache/saveBookToLibrary";
import { goToFirstChapterOrSelectChapter } from "../components/navigators/goToFirstChapterOrSelect";
import { useRapunzelNavigation } from "../components/navigators/useRouter";
import { BrowserItemProps } from "../components/paper/browser/browserItem";
import { VirtualItem } from "../components/virtualList/interfaces";
import { useRapunzelStore } from "../store/store";

const onMangaSelectHandler = async (bookBase: BookBase) => {
    const { redirect } = useRapunzelNavigation();
    const { loadBook } = useRapunzelLoader();
    const book = await loadBook(bookBase.id);
    if (!book) return;
    goToFirstChapterOrSelectChapter({ book, redirect });
};

const onMangaSaveHandler = async (bookBase: BookBase) => {
    const { loadBook, loadChapter } = useRapunzelLoader();
    const book = await loadBook(bookBase.id);
    if (!book) return null;

    // We make available the first chapter beforehand
    if (book?.chapters.length === 1) {
        loadChapter(book.chapters[0].id);
    }

    saveBookToLibrary(book);
};

const getVirtualItemProps = (
    index: number,
    loadedImages: VirtualItem<string>[],
): BrowserItemProps | null => {
    const {
        latest: [latestBooks],
    } = useRapunzelStore();

    if (!latestBooks.bookList[index]) return null;
    return {
        cover: loadedImages[index].value,
        bookBase: latestBooks.bookList[index],
        onClick: onMangaSelectHandler,
        onLongClick: onMangaSaveHandler,
    };
};

export const useVirtualList = () => ({
    getVirtualItemProps,
});
