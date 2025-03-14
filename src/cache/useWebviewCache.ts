import { Cookies } from "@react-native-cookies/cookies";
import { WebViewMessageEvent } from "react-native-webview";
import { useRapunzelStore } from "../store/store";
import { useRapunzelStorage } from "./storage";
import { StorageEntries } from "./interfaces";

interface useWebviewCacheProps {
    onCookieUpdate: (key: string, value: string) => void;
    onUserAgentUpdate: (key: string, value: string) => void;
}

enum ApiLoaderKeys {
    cfClearance = "cookie",
    userAgent = "User-Agent",
}

export const useWebviewCache = ({
    onCookieUpdate,
    onUserAgentUpdate,
}: useWebviewCacheProps) => {
    const {
        config: [config],
    } = useRapunzelStore();

    const updateApiLoaderConfig = (key: ApiLoaderKeys, value: string) => {
        const newApiConfig = { ...config.apiLoaderConfig, [key]: value };
        config.apiLoaderConfig = newApiConfig;
        useRapunzelStorage().setItem(StorageEntries.config, config);
    };

    const onCookiesRetrieved = (cookies: Cookies) => {
        const cfClearance = cookies?.["cf_clearance"];
        if (!cfClearance) return;
        updateApiLoaderConfig(ApiLoaderKeys.cfClearance, cfClearance.value);
        onCookieUpdate("CloudFlare clearance", cfClearance.value);
    };

    const onUserAgentRetrieved = (message: WebViewMessageEvent) => {
        const { data } = message.nativeEvent;
        const { userAgent } = JSON.parse(data);
        if (!userAgent) return;
        updateApiLoaderConfig(ApiLoaderKeys.userAgent, userAgent);
        onUserAgentUpdate("User Agent", userAgent);
    };

    return {
        onCookiesRetrieved,
        onUserAgentRetrieved,
    };
};

export const WebviewInjectJavascript = {
    tryRemoveAds: `setTimeout(function () {
        document.querySelectorAll("script:not([src*='nhentai'])").forEach(el=> el.parentNode.removeChild(el));
        document.querySelectorAll("link:not([href*='nhentai'])").forEach(el=> el.parentNode.removeChild(el));
        var ad = document.querySelector("section.advertisement");
        if(ad){ ad.parentNode.removeChild(ad); }
        var style = document.querySelector("body > style");
        if(style){ style.parentNode.removeChild(style); }
    }, 100);`,
    getUserAgent: `setTimeout(function () {
        window.ReactNativeWebView.postMessage(JSON.stringify({userAgent: navigator.userAgent}))
    }, 1000);`,
};
