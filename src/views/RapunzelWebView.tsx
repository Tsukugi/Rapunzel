import React, { FC, useEffect, useState } from "react";
import WebView from "react-native-webview";
import { ConfigState, useRapunzelStore } from "../store/store";

interface RapunzelWebViewProps {}

const RapunzelWebView: FC<RapunzelWebViewProps> = ({}) => {
    const [html, setHtml] = useState("");
    const {
        config: [config, watchConfig, unwatchConfig],
    } = useRapunzelStore();

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
            style={{ width: 500, height: 500 }}
            originWhitelist={["*"]}
            source={{ html }}
        />
    );
};

export default RapunzelWebView;
