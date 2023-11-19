import { Book } from "@atsu/lilith";
import { StorageEntries } from "../../cache/interfaces";
import { useRapunzelStorage } from "../../cache/storage";
import { useRapunzelStore } from "../../store/store";

export const saveBookToLibrary = async (book: Book) => {
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
