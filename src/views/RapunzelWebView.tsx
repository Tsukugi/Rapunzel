import React, { FC, useEffect, useState } from "react";
import WebView from "react-native-webview";
import { ConfigState, useRapunzelStore } from "../store/store";
import { useRouter } from "../components/navigators/useRouter";
import { ViewNames } from "../components/navigators/interfaces";

interface RapunzelWebViewProps {}

const js = "setTimeout(()=>alert(document.cookie), 3000);";

const RapunzelWebView: FC<RapunzelWebViewProps> = ({}) => {
    const [html, setHtml] = useState("");
    const {
        config: [config, watchConfig, unwatchConfig],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelWebView });

    useEffect(() => {
        const onWatchConfig = async ({ repoHtml }: ConfigState) => {
            setHtml(repoHtml);
        };

        watchConfig(onWatchConfig);
        return () => {
            unwatchConfig(onWatchConfig);
        };
    }, []);

    return (
        <WebView
            applicationNameForUserAgent="mox.rapi"
            injectedJavaScript={js}
            webviewDebuggingEnabled={true}
            sharedCookiesEnabled={true}
            style={{ width: 400, height: 500 }}
            originWhitelist={["https://nhentai.net"]}
            source={{ uri: "https://nhentai.net/" }}
        />
    );
};

export default RapunzelWebView;
