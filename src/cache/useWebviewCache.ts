import { Cookies } from "@react-native-cookies/cookies";
import { WebViewMessageEvent } from "react-native-webview";
import { useRapunzelStore } from "../store/store";
import { useRapunzelStorage } from "./storage";
import { StorageEntries } from "./interfaces";
import { ApiLoaderTimestamps } from "../store/interfaces";

interface useWebviewCacheProps {
    onCookieUpdate: (key: string, value: string) => void;
    onUserAgentUpdate: (key: string, value: string) => void;
}

enum ApiLoaderKeys {
    cfClearance = "cookie",
    userAgent = "User-Agent",
}

const ApiLoaderTimestampMap: Record<ApiLoaderKeys, keyof ApiLoaderTimestamps> =
    {
        [ApiLoaderKeys.cfClearance]: "cookie",
        [ApiLoaderKeys.userAgent]: "userAgent",
    };

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
        const timestampKey = ApiLoaderTimestampMap[key];
        if (timestampKey) {
            config.apiLoaderTimestamps = {
                ...config.apiLoaderTimestamps,
                [timestampKey]: Date.now(),
            };
        }
        useRapunzelStorage().setItem(StorageEntries.config, config);
    };

    const buildCookieHeader = (cookies: Cookies) =>
        Object.values(cookies)
            .filter((cookie) => cookie.value)
            .map((cookie) => `${cookie.name}=${cookie.value}`)
            .join("; ");

    const onCookiesRetrieved = (cookies: Cookies) => {
        const cfClearance = cookies?.["cf_clearance"];
        if (!cfClearance) return;
        updateApiLoaderConfig(
            ApiLoaderKeys.cfClearance,
            buildCookieHeader(cookies),
        );
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
        try {
            document.querySelectorAll("script:not([src*='nhentai'])").forEach(function(el){ el.parentNode && el.parentNode.removeChild(el); });
         
            var ad = document.querySelector("section.advertisement");
            if (ad && ad.parentNode) { ad.parentNode.removeChild(ad); }
            var style = document.querySelector("body > style");
            if (style && style.parentNode) { style.parentNode.removeChild(style); }
        } catch (err) {
            console.warn("tryRemoveAds error", err);
        }
    }, 100);`,
    getUserAgent: `setTimeout(function () {
        window.ReactNativeWebView.postMessage(JSON.stringify({userAgent: navigator.userAgent}))
    }, 1000);`,
};
