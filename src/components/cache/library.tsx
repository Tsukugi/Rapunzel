import { Book, BookBase } from "@atsu/lilith";
import { StorageEntries } from "../../cache/interfaces";
import { useRapunzelStorage } from "../../cache/storage";
import { useRapunzelStore } from "../../store/store";
import { LibraryBook } from "../../store/interfaces";
import { DateUtils } from "../../tools/date";

export const useRapunzelLibrary = () => {
    const {
        config: [config],
        library: [library],
    } = useRapunzelStore();

    const getLibraryId = (bookId: string) => `${config.repository}.${bookId}`;
    const saveBookToLibrary = async (book: Book) => {
        const { instance, setItem } = useRapunzelStorage();
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
        library.saved = newValue;
        library.rendered = Object.keys(newValue);
    };

    const removeBookFromLibrary = async (book: BookBase) => {
        const { setItem, instance } = useRapunzelStorage();

        const bookIdToDelete = getLibraryId(book.id);

        const currentLibrary =
            (await instance.getMapAsync<Record<string, LibraryBook>>(
                StorageEntries.library,
            )) || {};

        if (!currentLibrary[bookIdToDelete]) return;

        delete currentLibrary[bookIdToDelete];
        setItem(StorageEntries.library, currentLibrary);
        library.saved = currentLibrary;
        library.rendered = Object.keys(currentLibrary);
    };
    return {
        getLibraryId,
        saveBookToLibrary,
        removeBookFromLibrary,
    };
};
