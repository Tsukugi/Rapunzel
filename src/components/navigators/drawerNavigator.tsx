import React, { FC, useState } from "react";
import { Icon, useTheme } from "react-native-paper";

import {
    DrawerNavigationOptions,
    createDrawerNavigator,
} from "@react-navigation/drawer";
import HeaderBar from "../paper/header/headerBar";
import { HeaderLeftMode } from "../paper/interfaces";

import CustomDrawerContent from "./customDrawerContent";
import { ViewDict, ViewNavigationData } from "./navigation";

interface DrawerNavigatorProps {
    views: ViewDict;
}

const Drawer = createDrawerNavigator();

const DrawerNavigator: FC<DrawerNavigatorProps> = ({ views }) => {
    const { colors } = useTheme();

    const [options] = useState<DrawerNavigationOptions>({
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
    });

    const useOptions = (
        options: DrawerNavigationOptions,
        view: ViewNavigationData,
    ): DrawerNavigationOptions => {
        return {
            ...options,
            ...view.viewDrawerOptions,
            header: ({ navigation }) => (
                <HeaderBar
                    leftMode={view.header.leftMode || HeaderLeftMode.menu}
                    onBack={navigation.goBack}
                    openMenu={navigation.openDrawer}
                    openOptions={() => {}}
                    openSearch={() => {}}
                    onSearchProcess={(view) => navigation.navigate(view)}
                />
            ),
            drawerIcon: ({ size }) => <Icon size={size} source={view.icon} />,
        };
    };

    return (
        <Drawer.Navigator drawerContent={CustomDrawerContent}>
            {Object.values(views).map((view, index) => (
                <Drawer.Screen
                    key={index}
                    name={view.component.name}
                    component={view.component}
                    options={useOptions(options, view)}
                />
            ))}
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
