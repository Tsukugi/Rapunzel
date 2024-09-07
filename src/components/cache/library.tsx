import { Book, BookBase } from "@atsu/lilith";
import { StorageEntries } from "../../cache/interfaces";
import { useRapunzelStorage } from "../../cache/storage";
import { useRapunzelStore } from "../../store/store";

export const useLibrary = () => {
    const saveBookToLibrary = async (book: Book) => {
        const { instance, setItem } = useRapunzelStorage();
        const {
            config: [config],
        } = useRapunzelStore();
        const currentLibrary =
            (await instance.getMapAsync<Record<string, Book>>(
                StorageEntries.library,
            )) || {};
        setItem(StorageEntries.library, {
            ...currentLibrary,
            [`${config.repository}.${book.id}`]: book,
        });
    };
    const removeBookFromLibrary = async (book: BookBase) => {
        const { setItem, instance } = useRapunzelStorage();
        const {
            config: [config],
        } = useRapunzelStore();

        const bookIdToDelete = `${config.repository}.${book.id}`;

        const currentLibrary =
            (await instance.getMapAsync<Record<string, Book>>(
                StorageEntries.library,
            )) || {};

        if (!currentLibrary[bookIdToDelete]) return;

        delete currentLibrary[bookIdToDelete];
        setItem(StorageEntries.library, currentLibrary);
    };
    return {
        saveBookToLibrary,
        removeBookFromLibrary,
    };
};
