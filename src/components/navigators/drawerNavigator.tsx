import React, { FC, useState } from "react";
import { Icon } from "react-native-paper";

import {
    DrawerNavigationOptions,
    createDrawerNavigator,
} from "@react-navigation/drawer";
import HeaderBar from "../paper/header/headerBar";
import { HeaderLeftMode } from "../paper/interfaces";

import CustomDrawerContent from "./customDrawerContent";
import { ViewDict, ViewNavigationData } from "./navigation";
import { useRapunzelStore } from "../../store/store";
import { LocalTheme } from "../../../themes";

interface DrawerNavigatorProps {
    views: ViewDict;
}

const Drawer = createDrawerNavigator();

const DrawerNavigator: FC<DrawerNavigatorProps> = ({ views }) => {
    const { colors } = LocalTheme.useTheme();

    const {
        router: [router],
    } = useRapunzelStore();

    const useOptions = (view: ViewNavigationData): DrawerNavigationOptions => {
        return {
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
            ...view.viewDrawerOptions,
            header: ({ navigation }) => (
                <HeaderBar
                    showSearch={view.header.showSearch}
                    leftMode={view.header.leftMode || HeaderLeftMode.menu}
                    onBack={navigation.goBack}
                    openMenu={navigation.openDrawer}
                    openOptions={() => {}}
                    openSearch={() => {}}
                    onSearchProcess={(view) => {}}
                />
            ),
            drawerIcon: ({ size }) => <Icon size={size} source={view.icon} />,
        };
    };

    return (
        <Drawer.Navigator
            drawerContent={CustomDrawerContent}
            initialRouteName={router.currentRoute}
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
