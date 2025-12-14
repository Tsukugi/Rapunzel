import React, { FC } from "react";
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

interface TabNavigatorProps {
    views: { name: string; icon: string; component: React.ComponentType }[];
    // Define your component props here
}

const Tab = createMaterialBottomTabNavigator();

const TabNavigator: FC<TabNavigatorProps> = ({ views }) => {
    return (
        <Tab.Navigator>
            {views.map((view, index) => (
                <Tab.Screen
                    key={index}
                    name={view.name}
                    component={view.component}
                    options={{
                        tabBarLabel: view.name,
                        tabBarIcon: ({ color }) => (
                            <MaterialCommunityIcons
                                name={view.icon}
                                color={color}
                                size={26}
                            />
                        ),
                    }}
                />
            ))}
        </Tab.Navigator>
    );
};

export default TabNavigator;
