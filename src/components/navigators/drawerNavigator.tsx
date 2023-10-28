import React, { FC } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

interface DrawerNavigatorProps {
    views: { name: string; component: React.ComponentType }[];
    // Define your component props here
}

const Drawer = createDrawerNavigator();

const DrawerNavigator: FC<DrawerNavigatorProps> = ({ views }) => {
    return (
        <Drawer.Navigator>
            {views.map((view, index) => (
                <Drawer.Screen
                    key={index}
                    name={view.name}
                    component={view.component}
                />
            ))}
        </Drawer.Navigator>
    );
};

export default DrawerNavigator;
