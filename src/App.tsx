import React from "react";

import DrawerNavigator from "./components/navigators/DrawerNavigator";
import { Navigation } from "./components/navigators/navigationConfig";

const Views = Navigation.getViews();

const App: React.FC = () => {
    return <DrawerNavigator views={Views}></DrawerNavigator>;
};

export default App;
