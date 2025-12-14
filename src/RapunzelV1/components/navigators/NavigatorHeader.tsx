import { ReactNode } from "react";
import { Dimensions, ViewStyle } from "react-native";
import { ParamListBase } from "@react-navigation/native";
import { DrawerNavigationProp } from "@react-navigation/drawer";

import { useRapunzelStorage } from "../../cache/storage";
import { useRapunzelLoader } from "../../api/loader";
import { StorageEntries } from "../../cache/interfaces";
import { RapunzelLog } from "../../config/log";
import { useRapunzelStore } from "../../store/store";
import HeaderBar from "../paper/header/headerBar";
import { HeaderLeftMode } from "../paper/interfaces";
import { ViewNames } from "./interfaces";
import { SearchBehaviour } from "./navigationConfig";
import { LibraryUtils } from "../../tools/library";

interface NavigatorHeaderProps {
    navigation: DrawerNavigationProp<ParamListBase>;
    absoluteMode: boolean;
    showSearch: boolean;
    leftMode?: HeaderLeftMode;
    searchBehaviour?: SearchBehaviour;
}

export const NavigatorHeader = ({
    navigation,
    absoluteMode,
    showSearch,
    leftMode,
    searchBehaviour,
}: NavigatorHeaderProps): ReactNode => {
    const { width } = Dimensions.get("screen");
    const {
        config: [config],
        header: [header],
        library: [library],
        router: [router],
    } = useRapunzelStore();

    const { buildLibraryState } = LibraryUtils;

    const headerAbsoluteStyle: ViewStyle = {
        position: "absolute",
        opacity: 0.5,
        width: width,
        top: 20,
    };

    const onRequestSearch = async (newValue: string) => {
        header.searchValue = newValue;
        useRapunzelStorage().setItem(StorageEntries.searchText, newValue);

        if (!newValue) return;

        await useRapunzelLoader().loadSearch(newValue);

        if (router.currentRoute != ViewNames.RapunzelBrowse) {
            navigation.navigate(ViewNames.RapunzelBrowse);
        }
    };
    const onLibraryFilterSearch = async (newValue: string) => {
        header.searchValue = newValue;
        useRapunzelStorage().setItem(StorageEntries.searchText, newValue);

        const { rendered } = buildLibraryState(library.saved, config);

        if (!newValue) {
            library.rendered = rendered;
            return;
        }

        const filteredLibraryIds = rendered.filter((id) => {
            const titleMatch = library.saved[id].title
                .toLowerCase()
                .includes(newValue.toLowerCase());
            const authorMatch = library.saved[id].author
                .toLowerCase()
                .includes(newValue.toLowerCase());
            const tagsMatch = !!library.saved[id].tags.find((tag) =>
                tag.name.toLowerCase().includes(newValue.toLowerCase()),
            );

            const match = titleMatch || authorMatch || tagsMatch;

            if (match) {
                RapunzelLog.log({
                    id,
                    authorMatch,
                    tagsMatch,
                    titleMatch,
                });
            }

            return match;
        });

        if (filteredLibraryIds.length > 0) {
            library.rendered = filteredLibraryIds;
        }
    };

    const searchSubmitBehaviour = (() => {
        switch (searchBehaviour) {
            default:
                return onRequestSearch;
            case SearchBehaviour.FilterLibrary:
                return onLibraryFilterSearch;
        }
    })();

    return (
        <HeaderBar
            navigation={navigation}
            style={absoluteMode && headerAbsoluteStyle}
            showSearch={showSearch}
            leftMode={leftMode || HeaderLeftMode.menu}
            onBack={navigation.goBack}
            onSubmit={searchSubmitBehaviour}
            openMenu={navigation.openDrawer}
            openOptions={() => {}}
            openSearch={() => {}}
        />
    );
};
