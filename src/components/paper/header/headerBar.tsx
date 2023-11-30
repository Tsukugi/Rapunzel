import { Appbar } from "react-native-paper";
import { useState } from "react";
import {
    Appearance,
    RegisteredStyle,
    StyleSheet,
    ViewStyle,
} from "react-native";

import { useRapunzelStore } from "../../../store/store";
import { ViewNames } from "../../navigators/interfaces";

import { useRapunzelStorage } from "../../../cache/storage";
import { useRapunzelLoader } from "../../../api/loader";
import { StorageEntries } from "../../../cache/interfaces";

import PaperSearch from "./search";
import HeaderLeftBtn, { LeftModeProps } from "./headerLeftBtn";
import { RapunzelLog } from "../../../config/log";
interface HeaderBarProps extends LeftModeProps {
    style?: ViewStyle | false;
    showSearch?: boolean;
    openSearch: () => void;
    openOptions: () => void;
}

const HeaderBar = ({
    style,
    showSearch,
    leftMode,
    onBack,
    openMenu,
    openOptions,
}: HeaderBarProps) => {
    const {
        reader: [reader],
        header: [header],
        loading: [, useLoadingEffect],
    } = useRapunzelStore();
    const [isLoading, setIsLoading] = useState<boolean>(false);

    useLoadingEffect(({ browse, reader }) => setIsLoading(browse || reader));

    const onSubmitHandler = (newValue: string) => {
        header.searchValue = newValue;

        if (!newValue) return;
        useRapunzelStorage().setItem(StorageEntries.searchText, newValue);
        useRapunzelLoader().loadSearch(newValue);
    };

    const onThemeToggle = () => {
        const newTheme =
            Appearance.getColorScheme() === "dark" ? "light" : "dark";

        RapunzelLog.log("[onThemeToggle] Setting theme to", newTheme);
        Appearance.setColorScheme(newTheme);
    };

    return (
        <Appbar.Header style={style}>
            <HeaderLeftBtn
                onBack={onBack}
                openMenu={openMenu}
                leftMode={leftMode}
            />
            <Appbar.Content mode={"small"} title={reader.book?.title} />
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
