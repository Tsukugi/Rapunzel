/**
 * @format
 */
import "react-native-gesture-handler"; // Installation guide mentions this should be at the top

import React from "react";
import { AppRegistry } from "react-native";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { name as appName } from "./app.json";
import App from "./src/App";
import { LocalTheme } from "./themes";
import { initRapunzelStore } from "./src/store/store";
import { initRapunzelStorage } from "./src/cache/storage";
import { navigationContainerRef } from "./src/components/navigators/navigationRef";
import { markPendingBundleSuccessful } from "./src/ota/bundleStore";

export default function Main() {
    React.useEffect(() => {
        void markPendingBundleSuccessful();
    }, []);

    return (
        <NavigationContainer ref={navigationContainerRef}>
            <PaperProvider theme={LocalTheme.useTheme()}>
                <App />
            </PaperProvider>
        </NavigationContainer>
    );
}

initRapunzelStore();
// We start the storage once the store is ready, so we can restore data and update it.
initRapunzelStorage();

AppRegistry.registerComponent(appName, () => Main);
