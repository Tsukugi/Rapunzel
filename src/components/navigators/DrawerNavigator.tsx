import React, { FC } from "react";
import { Icon } from "react-native-paper";

import {
    DrawerNavigationOptions,
    createDrawerNavigator,
} from "@react-navigation/drawer";

import { LocalTheme } from "../../../themes";

import { ViewDict, ViewNavigationData } from "./navigationConfig";
import CustomDrawerContent from "./customDrawerContent";
import { NavigatorHeader } from "./NavigatorHeader";
import { getRapunzelStore } from "../../store/store";
import { getViewEntries } from "./viewEntries";

interface DrawerNavigatorProps {
    views: Partial<ViewDict>;
}

const Drawer = createDrawerNavigator();

const DrawerNavigator: FC<DrawerNavigatorProps> = ({ views }) => {
    const { colors } = LocalTheme.useTheme();

    const {
        config: [config],
    } = getRapunzelStore();

    const getOptions = (view: ViewNavigationData): DrawerNavigationOptions => {
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
            header: (props) => {
                return view.headerOptions.hideReader ? null : (
                    <NavigatorHeader
                        absoluteMode={!!view.headerOptions.absoluteMode}
                        showSearch={!!view.headerOptions.showSearch}
                        leftMode={view.headerOptions.leftMode}
                        searchBehaviour={view.headerOptions.searchBehaivour}
                        navigation={props.navigation}
                    />
                );
            },
            drawerItemStyle: !view.viewDrawerOptions && { display: "none" },
            drawerIcon: ({ size }) => <Icon size={size} source={view.icon} />,
        };
    };

    return (
        <Drawer.Navigator
            drawerContent={CustomDrawerContent}
            initialRouteName={config.initialView}
            backBehavior={"history"}
        >
            {getViewEntries(views).map(([name, view]) => (
                <Drawer.Screen
                    key={name}
                    name={name}
                    component={view.component}
                    options={getOptions(view)}
                />
            ))}
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
