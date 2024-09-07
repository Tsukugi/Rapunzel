import React, { FC, ReactNode } from "react";
import { Icon } from "react-native-paper";

import {
    DrawerHeaderProps,
    DrawerNavigationOptions,
    createDrawerNavigator,
} from "@react-navigation/drawer";

import HeaderBar from "../paper/header/headerBar";
import { HeaderLeftMode } from "../paper/interfaces";

import { LocalTheme } from "../../../themes";

import {
    SearchBehaviour,
    ViewDict,
    ViewNavigationData,
} from "./navigationConfig";
import CustomDrawerContent from "./customDrawerContent";
import { ViewNames } from "./interfaces";
import { Dimensions, ViewStyle } from "react-native";
import { useRapunzelStore } from "../../store/store";
import { useRapunzelStorage } from "../../cache/storage";
import { useRapunzelLoader } from "../../api/loader";
import { StorageEntries } from "../../cache/interfaces";
import { RapunzelLog } from "../../config/log";

interface DrawerNavigatorProps {
    views: Partial<ViewDict>;
}

const Drawer = createDrawerNavigator();

const DrawerNavigator: FC<DrawerNavigatorProps> = ({ views }) => {
    const {
        header: [header],
        library: [library],
        router: [router],
    } = useRapunzelStore();

    const { colors } = LocalTheme.useTheme();
    const { width } = Dimensions.get("screen");
    const headerAbsoluteStyle: ViewStyle = {
        position: "absolute",
        opacity: 0.5,
        width: width,
        top: 20,
    };

    const useOptions = (view: ViewNavigationData): DrawerNavigationOptions => {
        const HeaderBarImpl = ({
            navigation,
        }: DrawerHeaderProps): ReactNode => {
            const onRequestSearch = async (newValue: string) => {
                header.searchValue = newValue;
                useRapunzelStorage().setItem(
                    StorageEntries.searchText,
                    newValue,
                );

                if (!newValue) return;

                await useRapunzelLoader().loadSearch(newValue);

                if (router.currentRoute != ViewNames.RapunzelBrowse) {
                    navigation.navigate(ViewNames.RapunzelBrowse);
                }
            };
            const onLibraryFilterSearch = async (newValue: string) => {
                header.searchValue = newValue;
                useRapunzelStorage().setItem(
                    StorageEntries.searchText,
                    newValue,
                );

                if (!newValue) {
                    library.rendered = Object.keys(library.saved);
                    return;
                }

                const newRendered = Object.keys(library.saved).filter((id) => {
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

                if (newRendered.length > 0) library.rendered = newRendered;
            };

            const searchSubmitBehaviour = (() => {
                switch (view.headerOptions.searchBehaivour) {
                    default:
                        return onRequestSearch;
                    case SearchBehaviour.FilterLibrary:
                        return onLibraryFilterSearch;
                }
            })();

            return (
                <HeaderBar
                    style={
                        view.headerOptions.absoluteMode && headerAbsoluteStyle
                    }
                    showSearch={view.headerOptions.showSearch}
                    leftMode={
                        view.headerOptions.leftMode || HeaderLeftMode.menu
                    }
                    onBack={navigation.goBack}
                    onSubmit={searchSubmitBehaviour}
                    openMenu={navigation.openDrawer}
                    openOptions={() => {}}
                    openSearch={() => {}}
                />
            );
        };

        return {
            freezeOnBlur: true,
            drawerActiveTintColor: colors.primary,
            drawerLabelStyle: {
                color: colors.onBackground,
            },
            sceneContainerStyle: {
                backgroundColor: colors.background,
            },

            drawerStyle: {
                backgroundColor: colors.background,
            },
            drawerType: "back",
            swipeEdgeWidth: 0,
            ...view.viewDrawerOptions,
            headerShown: !view.headerOptions.hideReader,
            header: !view.headerOptions.hideReader ? HeaderBarImpl : undefined,
            drawerItemStyle: !view.viewDrawerOptions && { display: "none" },
            drawerIcon: ({ size }) => <Icon size={size} source={view.icon} />,
        };
    };

    return (
        <Drawer.Navigator
            drawerContent={CustomDrawerContent}
            initialRouteName={ViewNames.RapunzelMainFeed}
            backBehavior={"history"}
        >
            {Object.values(views).map((view, index) => (
                <Drawer.Screen
                    key={index}
                    name={view.component.name}
                    component={view.component}
                    options={useOptions(view)}
                />
            ))}
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
