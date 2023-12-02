import { Appbar } from "react-native-paper";
import { useState } from "react";
import { Appearance, ViewStyle } from "react-native";

import { useRapunzelStore } from "../../../store/store";

import PaperSearch from "./search";
import HeaderLeftBtn, { LeftModeProps } from "./headerLeftBtn";
import { RapunzelLog } from "../../../config/log";
interface HeaderBarProps extends LeftModeProps {
    style?: ViewStyle | false;
    showSearch?: boolean;
    openSearch: () => void;
    openOptions: () => void;
    onSubmit: (searchText: string) => void;
}

const HeaderBar = ({
    style,
    showSearch,
    leftMode,
    onBack,
    openMenu,
    openOptions,
    onSubmit,
}: HeaderBarProps) => {
    const {
        reader: [reader],
        header: [header],
        loading: [, useLoadingEffect],
    } = useRapunzelStore();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    useLoadingEffect(({ browse, reader }) => setIsLoading(browse || reader));

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
            <Appbar.Content mode={"small"} title={""} />
            {showSearch ? (
                <PaperSearch
                    defaultValue={header.searchValue}
                    isLoading={isLoading}
                    onSubmit={onSubmit}
                />
            ) : null}
            <Appbar.Action icon="theme-light-dark" onPress={onThemeToggle} />
            <Appbar.Action icon="dots-vertical" onPress={openOptions} />
        </Appbar.Header>
    );
};

export default HeaderBar;
