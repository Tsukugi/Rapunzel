import React, { FC } from "react";
import WebView from "react-native-webview";
import { useRouter } from "../components/navigators/useRouter";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import CookieManager from "@react-native-cookies/cookies";
import {
    WebviewInjectJavascript,
    useWebviewCache,
} from "../cache/useWebviewCache";
import { useRapunzelStore } from "../store/store";
import { Snackbar } from "react-native-paper";
import { StyleSheet } from "react-native";
import { useAutoFetchWebviewData } from "../process/autoFetchWebviewData";

interface RapunzelWebViewProps extends UsesNavigation {}

const useDataSavedText = (key: string, value: string) => `${key}: ${value}`;

const useWebKit = true;
const RapunzelWebView: FC<RapunzelWebViewProps> = ({ navigation }) => {
    const {
        config: [config],
    } = useRapunzelStore();

    const [visible, setVisible] = React.useState(true);
    const [hideTimeoutId, setHideTimeoutId] = React.useState<number>(0);
    const [scrapInfoMessage, setScrapInfoMessage] = React.useState("");

    const onDismissSnackBar = () => setVisible(!visible);

    const onWebviewUpdate = (value: string) => {
        const { onDataSuccess } = useAutoFetchWebviewData({ navigation });

        onDataSuccess(config);
        if (!config.debug) return;
        setScrapInfoMessage(value);
        setVisible(true);
        clearTimeout(hideTimeoutId);
        const id = setTimeout(() => {
            if (id === hideTimeoutId) setVisible(false);
        }, 3000);
        setHideTimeoutId(id);
    };

    useRouter({ route: ViewNames.RapunzelWebView, navigation });

    const { onCookiesRetrieved, onUserAgentRetrieved } = useWebviewCache({
        onCookieUpdate: (key, value) =>
            onWebviewUpdate(useDataSavedText(key, value)),
        onUserAgentUpdate: (key, value) =>
            onWebviewUpdate(useDataSavedText(key, value)),
    });

    return (
        <>
            <Snackbar
                style={styles.container}
                visible={visible}
                onDismiss={onDismissSnackBar}
            >
                {scrapInfoMessage}
            </Snackbar>
            <WebView
                injectedJavaScript={WebviewInjectJavascript.getUserAgent}
                onNavigationStateChange={() =>
                    CookieManager.get(config.webviewUrl, useWebKit).then(
                        onCookiesRetrieved,
                    )
                }
                onMessage={onUserAgentRetrieved}
                sharedCookiesEnabled={true}
                style={{ width: 400, height: 500 }}
                originWhitelist={["*"]}
                source={{ uri: config.webviewUrl }}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        minHeight: 50,
        zIndex: 1,
    },
});

export default RapunzelWebView;
