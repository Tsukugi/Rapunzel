import { useRapunzelLoader } from "../api/loader";
import { StorageEntries } from "../cache/interfaces";
import { useRapunzelStorage } from "../cache/storage";
import { Store } from "./interfaces";

export const onHeaderStoreEvents = ({ header: [, watchHeader] }: Store) => {
    watchHeader(({ searchValue }) => {
        useRapunzelStorage().setItem(StorageEntries.searchText, searchValue);
        useRapunzelLoader().loadSearch(searchValue);
    });
};
