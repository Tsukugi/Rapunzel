import { Appbar } from "react-native-paper";
import PaperSearch from "./search";
import { useRapunzelStore } from "../../store/store";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";
import { useRapunzelStorage } from "../../cache/storage";
import { StorageEntries } from "../../cache/interfaces";

interface HeaderBarProps {
    openMenu: () => void;
    openSearch: () => void;
    openOptions: () => void;
}

const HeaderBar = ({ openMenu, openOptions, openSearch }: HeaderBarProps) => {
    const [showSearch, setShowSearch] = useState(false);
    const [searchText, setSearchTerm] = useState("");
    const [, saveSearchText] = useRapunzelStorage(StorageEntries.searchText, "");
    const [header] = useRapunzelStore().header;
    const [debouncedSearchText] = useDebounce(searchText, 1000);
    useEffect(() => {
        header.searchValue = searchText;
        saveSearchText(searchText);
    }, [debouncedSearchText]);

    return (
        <Appbar.Header>
            {/* <Appbar.BackAction onPress={_goBack} /> */}

            <Appbar.Action icon="menu" onPress={openMenu} />
            <Appbar.Content title="" />
            {showSearch ? (
                <PaperSearch
                    value={searchText}
                    onValueChange={setSearchTerm}
                    onClose={() => setShowSearch(false)}
                />
            ) : (
                <Appbar.Action
                    icon="magnify"
                    onPress={() => {
                        openSearch();
                        setShowSearch(true);
                    }}
                />
            )}
            {/* <Appbar.Action icon="theme-light-dark" /> */}
            <Appbar.Action icon="dots-vertical" onPress={openOptions} />
        </Appbar.Header>
    );
};

export default HeaderBar;
