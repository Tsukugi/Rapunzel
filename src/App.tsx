import React from "react";

import DrawerNavigator from "./components/navigators/DrawerNavigator";
import { Navigation } from "./components/navigators/navigationConfig";
import { onAppStart } from "./lifecycle/onAppStart";

const Views = Navigation.getViews();

const App: React.FC = () => {
    React.useEffect(onAppStart, []);

    return <DrawerNavigator views={Views}></DrawerNavigator>;
};

export default App;
