import React, { FC, ReactNode } from "react";
import { Icon } from "react-native-paper";

import {
    DrawerHeaderProps,
    DrawerNavigationOptions,
    createDrawerNavigator,
} from "@react-navigation/drawer";

import HeaderBar from "../paper/header/headerBar";
import { HeaderLeftMode } from "../paper/interfaces";

import { useRapunzelStore } from "../../store/store";
import { LocalTheme } from "../../../themes";

import { ViewDict, ViewNavigationData } from "./navigation";
import CustomDrawerContent from "./customDrawerContent";
import { UsesNavigation, ViewNames } from "./interfaces";
import { useRapunzelNavigation } from "./useRouter";

interface DrawerNavigatorProps {
    views: Partial<ViewDict>;
}

const Drawer = createDrawerNavigator();
interface HeaderBarImplProps extends UsesNavigation {
    view: ViewNavigationData;
}

const DrawerNavigator: FC<DrawerNavigatorProps> = ({ views }) => {
    const { colors } = LocalTheme.useTheme();
    const { goBack } = useRapunzelNavigation();
    const {
        router: [router],
    } = useRapunzelStore();

    const useOptions = (view: ViewNavigationData): DrawerNavigationOptions => {
        const HeaderBarImpl = ({
            navigation,
        }: DrawerHeaderProps): ReactNode => {
            return (
                <HeaderBar
                    showSearch={view.header.showSearch}
                    leftMode={view.header.leftMode || HeaderLeftMode.menu}
                    onBack={goBack}
                    openMenu={navigation.openDrawer}
                    openOptions={() => {}}
                    openSearch={() => {}}
                    onSearchProcess={(view) => {}}
                />
            );
        };

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
            swipeEdgeWidth: 150,
            ...view.viewDrawerOptions,
            header: HeaderBarImpl,
            drawerIcon: ({ size }) => <Icon size={size} source={view.icon} />,
        };
    };

    return (
        <Drawer.Navigator
            drawerContent={CustomDrawerContent}
            initialRouteName={ViewNames.RapunzelBrowse}
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
