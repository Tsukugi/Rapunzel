import React from "react";

import DrawerNavigator from "./components/navigators/drawerNavigator";
import { Navigation } from "./components/navigators/navigation";

const Views = Navigation.getViews();

const App: React.FC = () => {
    return <DrawerNavigator views={Views}></DrawerNavigator>;
};

export default App;
