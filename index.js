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
import { initTaihouStore } from "./src/store/store";

export default function Main() {
    return (
        <NavigationContainer>
            <PaperProvider theme={LocalTheme.getTheme()}>
                <App />
            </PaperProvider>
        </NavigationContainer>
    );
}

initTaihouStore();
AppRegistry.registerComponent(appName, () => Main);
