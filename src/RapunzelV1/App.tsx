import React, { useState } from "react";

import DrawerNavigator from "./components/navigators/DrawerNavigator";
import { Navigation } from "./components/navigators/navigationConfig";
import { onAppStart } from "./lifecycle/onAppStart";
import { StyleSheet } from "react-native";
import { Snackbar } from "react-native-paper";
import { useRapunzelStore } from "./store/store";

const Views = Navigation.getViews();

const App: React.FC = () => {
    React.useEffect(onAppStart, []);

    // TODO make me a component
    const {
        ui: [ui, useUIEffect],
    } = useRapunzelStore();

    const [snackMessage, setSnackMessage] = useState(ui.snackMessage);
    const [isSnackBarVisible, setIsSnackBarVisible] = useState(false);
    useUIEffect((_ui) => {
        setIsSnackBarVisible(!!_ui.snackMessage);
        if (!!_ui.snackMessage) {
            setTimeout(() => setIsSnackBarVisible(false), 3000);
        }
        setSnackMessage(_ui.snackMessage);
    });

    function onDismissSnackBar(): void {}

    return (
        <>
            <Snackbar
                style={styles.container}
                visible={isSnackBarVisible}
                onDismiss={onDismissSnackBar}
            >
                {snackMessage}
            </Snackbar>
            <DrawerNavigator views={Views}></DrawerNavigator>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: 50,
        zIndex: 1,
    },
});

export default App;
