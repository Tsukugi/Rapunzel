import React from "react";

import CacheScreenView from "./views/cacheScreenView";
import MangaViewer from "./views/mangaViewer";
import TabNavigator from "./components/navigators/tabNavigator";
import DrawerNavigator from "./components/navigators/drawerNavigator";

const Views = [MangaViewer, CacheScreenView].map((view) => ({
    name: view.name,
    component: view,
    icon: "home",
}));

const App: React.FC = () => {
    return <DrawerNavigator views={Views}></DrawerNavigator>;
};

export default App;
