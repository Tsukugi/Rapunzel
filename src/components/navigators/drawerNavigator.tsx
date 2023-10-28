import React, { FC, useState } from "react";
import {
    DrawerNavigationOptions,
    createDrawerNavigator,
} from "@react-navigation/drawer";
import HeaderBar from "../paper/headerBar";
import { useTheme } from "react-native-paper";
interface DrawerNavigatorProps {
    views: { name: string; component: React.ComponentType }[];
}

const Drawer = createDrawerNavigator();

const DrawerNavigator: FC<DrawerNavigatorProps> = ({ views }) => {
    const {
        colors: { primary, background, onBackground },
    } = useTheme();

    const [options, setOptions] = useState<DrawerNavigationOptions>({
        header: ({ navigation }) => (
            <HeaderBar
                openMenu={navigation.openDrawer}
                openOptions={console.log}
                openSearch={console.log}
            />
        ),
        drawerActiveTintColor: primary,
        drawerLabelStyle: {
            color: onBackground,
        },
        drawerContentStyle: { backgroundColor: background },
    });

    return (
        <Drawer.Navigator
            screenListeners={{
                state: (e) => {
                    // Do something with the state
                    console.log("state changed", e.data);
                },
            }}
        >
            {views.map((view, index) => (
                <Drawer.Screen
                    key={index}
                    name={view.name}
                    component={view.component}
                    options={options}
                />
            ))}
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
