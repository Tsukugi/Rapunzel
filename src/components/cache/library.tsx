import { Book, BookBase } from "@atsu/lilith";
import { StorageEntries } from "../../cache/interfaces";
import { getRapunzelStorage } from "../../cache/storage";
import { getRapunzelStore } from "../../store/store";
import { LibraryBook } from "../../store/interfaces";
import { DateUtils } from "../../tools/date";
import { LibraryUtils } from "../../tools/library";

export const getRapunzelLibrary = () => {
    const {
        config: [config],
        library: [library],
    } = getRapunzelStore();

    const { buildLibraryState } = LibraryUtils;

    const getLibraryId = (bookId: string) => `${config.repository}.${bookId}`;
    const saveBookToLibrary = async (book: Book) => {
        const { instance, setItem } = getRapunzelStorage();
        const currentLibrary =
            (await instance.getMapAsync<Record<string, LibraryBook>>(
                StorageEntries.library,
            )) || {};
        const newBook: LibraryBook = { ...book, savedAt: DateUtils.getEpoch() };
        const newValue = {
            ...currentLibrary,
            [getLibraryId(book.id)]: newBook,
        };

        setItem(StorageEntries.library, newValue);
        const { rendered, saved } = buildLibraryState(newValue, config);
        library.rendered = rendered;
        library.saved = saved;
    };

    const removeBookFromLibrary = async (book: BookBase) => {
        const { setItem, instance } = getRapunzelStorage();

        const bookIdToDelete = getLibraryId(book.id);

        const currentLibrary =
            (await instance.getMapAsync<Record<string, LibraryBook>>(
                StorageEntries.library,
            )) || {};

        if (!currentLibrary[bookIdToDelete]) return;

        delete currentLibrary[bookIdToDelete];
        setItem(StorageEntries.library, currentLibrary);
        const { rendered, saved } = buildLibraryState(currentLibrary, config);
        library.rendered = rendered;
        library.saved = saved;
    };

    return {
        getLibraryId,
        saveBookToLibrary,
        removeBookFromLibrary,
    };
};
