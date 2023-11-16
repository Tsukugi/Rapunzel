import { Appbar } from "react-native-paper";
import { useEffect, useState } from "react";
import { Appearance } from "react-native";

import { useRapunzelStore } from "../../../store/store";
import { ViewNames } from "../../navigators/interfaces";

import { useRapunzelStorage } from "../../../cache/storage";
import { useRapunzelLoader } from "../../../api/loader";
import { StorageEntries } from "../../../cache/interfaces";

import PaperSearch from "./search";
import HeaderLeftBtn, { LeftModeProps } from "./headerLeftBtn";
import { RapunzelLog } from "../../../config/log";
interface HeaderBarProps extends LeftModeProps {
    showSearch?: boolean;
    openSearch: () => void;
    openOptions: () => void;
    onSearchProcess: (view: ViewNames) => void;
}

const HeaderBar = ({
    showSearch,
    leftMode,
    onBack,
    openMenu,
    openOptions,
    openSearch,
    onSearchProcess,
}: HeaderBarProps) => {
    const {
        header: [header],
    } = useRapunzelStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const onSubmitHandler = (newValue: string) => {
        header.searchValue = newValue;
        setIsLoading(true);

        if (!newValue) return;
        useRapunzelStorage().setItem(StorageEntries.searchText, newValue);
        useRapunzelLoader()
            .loadSearch(newValue)
            .finally(() => setIsLoading(false));
    };

    const onThemeToggle = () => {
        const newTheme =
            Appearance.getColorScheme() === "dark" ? "light" : "dark";

        RapunzelLog.log("[onThemeToggle] Setting theme to", newTheme);
        Appearance.setColorScheme(newTheme);
    };

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
                    defaultValue={header.searchValue}
                    isLoading={isLoading}
                    onSubmit={onSubmitHandler}
                />
            ) : null}
            <Appbar.Action icon="theme-light-dark" onPress={onThemeToggle} />
            <Appbar.Action icon="dots-vertical" onPress={openOptions} />
        </Appbar.Header>
    );
};

export default HeaderBar;
