/**
 * @format
 */
import "react-native-gesture-handler"; // Installation guide mentions this should be at the top

import { AppRegistry } from "react-native";
import App from "./src/App";
import { name as appName } from "./app.json";
import { PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { LocalTheme } from "./themes";
import { initRapunzelStore } from "./src/store/store";
import { initRapunzelStorage } from "./src/cache/storage";

export default function Main() {
    return (
        <NavigationContainer>
            <PaperProvider theme={LocalTheme.useTheme()}>
                <App />
            </PaperProvider>
        </NavigationContainer>
    );
}

initRapunzelStore();
// We start the storage once the store is ready, so we can restore data.
initRapunzelStorage();

AppRegistry.registerComponent(appName, () => Main);
