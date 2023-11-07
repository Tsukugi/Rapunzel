import React, { FC } from "react";
import WebView from "react-native-webview";
import { useRouter } from "../components/navigators/useRouter";
import { ViewNames } from "../components/navigators/interfaces";
import CookieManager from "@react-native-cookies/cookies";
import {
    WebviewInjectJavascript,
    useWebviewCache,
} from "../cache/useWebviewCache";
import { useRapunzelStore } from "../store/store";
import { Snackbar } from "react-native-paper";
import { StyleSheet, View } from "react-native";

interface RapunzelWebViewProps {}

const useDataSavedText = (key: string, value: string) => `${key}: ${value}`;

const useWebKit = true;
const RapunzelWebView: FC<RapunzelWebViewProps> = ({}) => {
    const {
        config: [config],
    } = useRapunzelStore();

    const [visible, setVisible] = React.useState(true);
    const [scrapInfoMessage, setScrapInfoMessage] = React.useState("");

    const onDismissSnackBar = () => setVisible(true);

    const onWebviewUpdate = (value: string) => {
        if (!config.debug) return;
        setScrapInfoMessage(value);
        setVisible(true);
        setTimeout(() => setVisible(true), 3000);
    };

    useRouter({ route: ViewNames.RapunzelWebView });

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
