import { WebViewMessageEvent } from "react-native-webview";
import { RapunzelLog } from "../config/log";
import { RapunzelStorage } from "../storage/rapunzelStorage";
import { useRapunzelStore, ConfigState } from "../store";

interface UseWebviewCacheProps {
    onUpdate: (key: string, value: string) => void;
    onValidCredentials?: () => void;
}

interface WebViewPayload {
    cookies?: string;
    userAgent?: string;
}

const parseCookieValue = (cookies: string, key: string): string | null => {
    const entries = cookies.split(";").map((entry) => entry.trim());
    const match = entries.find((entry) => entry.startsWith(`${key}=`));
    if (!match) return null;
    const [, value] = match.split("=");
    return value || null;
};

const hasHeaders = (config: ConfigState) =>
    !!config.apiLoaderConfig["User-Agent"] && !!config.apiLoaderConfig.cookie;

export const WebviewInjectJavascript = `
  (function() {
    const sendData = () => {
      const payload = { cookies: document.cookie || "", userAgent: navigator.userAgent };
      window.ReactNativeWebView.postMessage(JSON.stringify(payload));
    };

    try {
      var ad = document.querySelector("section.advertisement");
      if (ad) { ad.parentNode.removeChild(ad); }
      document.querySelectorAll("script:not([src*='nhentai'])").forEach(function(el){ el.parentNode.removeChild(el); });
      document.querySelectorAll("link:not([href*='nhentai'])").forEach(function(el){ el.parentNode.removeChild(el); });
    } catch (e) {
      // Best effort cleanup; ignore errors
    }

    sendData();
    setInterval(sendData, 1500);
    true;
  })();
`;

export const useWebviewCache = ({
    onUpdate,
    onValidCredentials,
}: UseWebviewCacheProps) => {
    const {
        config: [config],
    } = useRapunzelStore();

    const persistHeaders = async (headers: Partial<typeof config.apiLoaderConfig>) => {
        const hasChange = Object.entries(headers).some(
            ([key, value]) => value && config.apiLoaderConfig[key] !== value,
        );
        if (!hasChange) return false;
        config.apiLoaderConfig = { ...config.apiLoaderConfig, ...headers };
        await RapunzelStorage.saveConfig(config);
        return true;
    };

    const handleMessage = async (event: WebViewMessageEvent) => {
        try {
            const payload = JSON.parse(event.nativeEvent.data || "{}") as WebViewPayload;
            const headers: Partial<typeof config.apiLoaderConfig> = {};

            if (payload.cookies) {
                const clearance = parseCookieValue(payload.cookies, "cf_clearance");
                if (clearance) {
                    headers.cookie = clearance;
                }
            }

            if (payload.userAgent) {
                headers["User-Agent"] = payload.userAgent;
            }

            const changed = await persistHeaders(headers);
            if (!changed) return;

            Object.entries(headers).forEach(([key, value]) => {
                if (!value) return;
                const label = key === "cookie" ? "Cloudflare clearance" : key;
                onUpdate(label, value);
            });

            if (onValidCredentials && hasHeaders(config)) {
                onValidCredentials();
            }
        } catch (error) {
            RapunzelLog.warn("[useWebviewCache] Failed to parse WebView data", error);
        }
    };

    return {
        handleMessage,
        injectedJavaScript: WebviewInjectJavascript,
    };
};
