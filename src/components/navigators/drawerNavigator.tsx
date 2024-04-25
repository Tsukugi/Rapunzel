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

import { ViewDict, ViewNavigationData } from "./navigationConfig";
import CustomDrawerContent from "./customDrawerContent";
import { ViewNames } from "./interfaces";
import { Dimensions, ViewStyle } from "react-native";
import { useRapunzelStore } from "../../store/store";
import { useRapunzelStorage } from "../../cache/storage";
import { useRapunzelLoader } from "../../api/loader";
import { StorageEntries } from "../../cache/interfaces";

interface DrawerNavigatorProps {
    views: Partial<ViewDict>;
}

const Drawer = createDrawerNavigator();

const DrawerNavigator: FC<DrawerNavigatorProps> = ({ views }) => {
    const {
        header: [header],
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
            const onSubmitHandler = async (newValue: string) => {
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
                    onSubmit={onSubmitHandler}
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
