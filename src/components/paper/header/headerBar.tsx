import { Appbar } from "react-native-paper";
import { useEffect, useState } from "react";
import { useDebounce } from "use-debounce";

import { useRapunzelStore } from "../../../store/store";
import { ViewNames } from "../../navigators/interfaces";

import PaperSearch from "../search";
import HeaderLeftBtn, { LeftModeProps } from "./headerLeftBtn";
import { HeaderState } from "../../../store/interfaces";
import { Appearance } from "react-native";

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
        router: [router],
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
        setIsLoading(false);
        header.searchValue = searchText;
        router.currentRoute !== ViewNames.RapunzelBrowse &&
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
                    value={header.searchValue}
                    isLoading={isLoading}
                    onValueChange={(val) => {
                        setSearchTerm(val);
                        setIsLoading(true);
                    }}
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
            <Appbar.Action
                icon="theme-light-dark"
                onPress={() =>
                    Appearance.getColorScheme() === "dark"
                        ? Appearance.setColorScheme("light")
                        : Appearance.setColorScheme("dark")
                }
            />
            <Appbar.Action icon="dots-vertical" onPress={openOptions} />
        </Appbar.Header>
    );
};

export default HeaderBar;
