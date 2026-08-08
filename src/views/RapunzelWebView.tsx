import React, { FC, useRef } from "react";
import WebView from "react-native-webview";
import { useRouter } from "../components/navigators/useRouter";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import CookieManager from "@react-native-cookies/cookies";
import {
    WebviewInjectJavascript,
    useWebviewCache,
} from "../cache/useWebviewCache";
import { getRapunzelStore } from "../store/store";
import { createAutoFetchWebviewData } from "../process/autoFetchWebviewData";
import { RapunzelLog } from "../config/log";

type RapunzelWebViewProps = UsesNavigation

const getDataSavedText = (key: string, value: string) => `${key}: ${value}`;

const useWebKit = true;
const RapunzelWebView: FC<RapunzelWebViewProps> = ({ navigation }) => {
    const {
        ui: [ui],
        config: [config],
    } = getRapunzelStore();
    const webviewRef = useRef<WebView>(null);

    const onWebviewUpdate = (value: string) => {
        const { onDataSuccess } = createAutoFetchWebviewData({ navigation });

        onDataSuccess(config);
        if (!config.debug) return;
        ui.snackMessage = value;
    };

    useRouter({ route: ViewNames.RapunzelWebView, navigation });

    const { onCookiesRetrieved, onUserAgentRetrieved } = useWebviewCache({
        onCookieUpdate: (key, value) =>
            onWebviewUpdate(getDataSavedText(key, value)),
        onUserAgentUpdate: (key, value) =>
            onWebviewUpdate(getDataSavedText(key, value)),
    });

    return (
        <>
            <WebView
                ref={webviewRef}
                userAgent="Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.3"
                injectedJavaScript={
                    WebviewInjectJavascript.tryRemoveAds +
                    WebviewInjectJavascript.getUserAgent
                }
                onLoadEnd={() =>
                    webviewRef.current?.injectJavaScript(
                        WebviewInjectJavascript.tryRemoveAds,
                    )
                }
                onNavigationStateChange={() =>
                    CookieManager.get(config.webviewUrl, useWebKit)
                        .then(onCookiesRetrieved)
                        .catch((err) => RapunzelLog.warn(err))
                }
                onMessage={onUserAgentRetrieved}
                sharedCookiesEnabled={true}
                style={{ width: 380, height: 500 }}
                originWhitelist={["*"]}
                source={{
                    uri: config.webviewUrl,
                    headers: {
                        "X-Requested-With": "Chrome Mobile",
                    },
                }}
            />
        </>
    );
};

export default RapunzelWebView;
