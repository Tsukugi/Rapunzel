import { Appbar } from "react-native-paper";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { HeaderState, useRapunzelStore } from "../../../store/store";
import { useRapunzelStorage } from "../../../cache/storage";
import { StorageEntries } from "../../../cache/interfaces";
import { useRapunzelLoader } from "../../../api/loader";
import { ViewNames } from "../../navigators/interfaces";

import PaperSearch from "../search";
import HeaderLeftBtn, { LeftModeProps } from "./headerLeftBtn";
import { RapunzelLog } from "../../../config/log";

interface HeaderBarProps extends LeftModeProps {
    openSearch: () => void;
    openOptions: () => void;
    onSearchProcess: (view: ViewNames) => void;
}

const HeaderBar = ({
    leftMode,
    onBack,
    openMenu,
    openOptions,
    openSearch,
    onSearchProcess,
}: HeaderBarProps) => {
    const {
        header: [header, watchHeader, unwatchHeader],
    } = useRapunzelStore();
    const [showSearch, setShowSearch] = useState<boolean>(!!header.searchValue);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [searchText, setSearchTerm] = useState<string>(header.searchValue);
    const [debouncedSearchText] = useDebounce(searchText, 1000);

    useEffect(() => {
        const onWatchHeader = ({ searchValue }: HeaderState) => {
            setSearchTerm(searchValue);
        };
        watchHeader(onWatchHeader);
        return () => {
            unwatchHeader(onWatchHeader);
        };
    }, []);

    useEffect(() => {
        if (!searchText || searchText === header.searchValue) {
            RapunzelLog.log(`[HeaderBar] ignoring `, header.searchValue);
            return;
        }
        setIsLoading(true);
        header.searchValue = searchText;
        useRapunzelStorage().setItem(StorageEntries.searchText, searchText);
        useRapunzelLoader()
            .loadSearch(searchText)
            .finally(() => setIsLoading(false));

        onSearchProcess(ViewNames.RapunzelBrowse);
    }, [debouncedSearchText]);

    return (
        <Appbar.Header>
            <HeaderLeftBtn
                onBack={onBack}
                openMenu={openMenu}
                leftMode={leftMode}
            />
            <Appbar.Content title="" />
            {showSearch ? (
                <PaperSearch
                    isLoading={isLoading}
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
