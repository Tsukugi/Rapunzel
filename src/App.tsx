import React from "react";
import { createMaterialBottomTabNavigator } from "react-native-paper/react-navigation";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

import CacheScreenView from "./views/cacheScreenView";
import MangaViewer from "./views/mangaViewer";

const Tab = createMaterialBottomTabNavigator();
const App: React.FC = () => {
    return (
        <Tab.Navigator initialRouteName="Home">
            <Tab.Screen
                name="Home"
                component={MangaViewer}
                options={{
                    tabBarLabel: "Home",
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="home"
                            color={color}
                            size={26}
                        />
                    ),
                }}
            />
            <Tab.Screen
                name="Cache"
                component={CacheScreenView}
                options={{
                    tabBarLabel: "Cache",
                    tabBarIcon: ({ color }) => (
                        <MaterialCommunityIcons
                            name="wifi"
                            color={color}
                            size={26}
                        />
                    ),
                }}
            />
        </Tab.Navigator>
    );
};

export default App;
