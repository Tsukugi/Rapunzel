import { Appbar, Icon, Menu, Text } from "react-native-paper";
import { useState } from "react";
import { Appearance, View, ViewStyle } from "react-native";

import { useRapunzelStore } from "../../../store/store";

import PaperSearch from "./search";
import HeaderLeftBtn, { LeftModeProps } from "./headerLeftBtn";
import { RapunzelLog } from "../../../config/log";
import { RapunzelMenu } from "../RapunzelMenu";
import { UsesNavigation, ViewNames } from "../../navigators/interfaces";
interface HeaderBarProps extends LeftModeProps, UsesNavigation {
    style?: ViewStyle | false;
    showSearch?: boolean;
    openSearch: () => void;
    openOptions: () => void;
    onSubmit: (searchText: string) => void;
}

const HeaderBar = ({
    navigation,
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
    const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

    useLoadingEffect(({ browse }) => setIsLoading(browse));

    const onThemeToggle = () => {
        const newTheme =
            Appearance.getColorScheme() === "dark" ? "light" : "dark";

        RapunzelLog.log("[onThemeToggle] Setting theme to", newTheme);
        Appearance.setColorScheme(newTheme);
    };

    const hamburgerIcon = (
        <Appbar.Action
            icon="dots-vertical"
            onPress={() => {
                openOptions();
                setIsMenuOpen(true);
            }}
        />
    );

    // TODO: Export the configuration of the RMenu if needed
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

            <RapunzelMenu
                items={[
                    {
                        onPress: onThemeToggle,
                        title: "Toggle Theme",
                    },
                    {
                        onPress: () => {
                            navigation.navigate(ViewNames.RapunzelSettings);
                            setIsMenuOpen(false);
                        },
                        title: "Settings",
                    },
                ]}
                anchor={hamburgerIcon}
                visible={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
            />
        </Appbar.Header>
    );
};

export default HeaderBar;
