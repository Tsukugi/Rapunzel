import * as React from "react";
import { Appbar } from "react-native-paper";
import PaperSearch from "./search";

interface HeaderBarProps {
    openMenu: () => void;
    openSearch: () => void;
    openOptions: () => void;
}

const HeaderBar = ({ openMenu, openOptions, openSearch }: HeaderBarProps) => {
    const [showSearch, setShowSearch] = React.useState(false);
    return (
        <Appbar.Header>
            {/* <Appbar.BackAction onPress={_goBack} /> */}

            <Appbar.Action icon="menu" onPress={openMenu} />
            <Appbar.Content title="" />
            {showSearch ? (
                <PaperSearch onClose={() => setShowSearch(false)} />
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
