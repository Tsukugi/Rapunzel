import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import WebView from "react-native-webview";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { useTheme } from "../theme";
import { RootDrawerParamList } from "../navigation/AppNavigator";
import { useRapunzelStore, ViewNames } from "../store";
import { useWebviewCache, WebviewInjectJavascript } from "../webview/useWebviewCache";
import { useAutoFetchWebviewData } from "../webview/useAutoFetchWebviewData";

type WebViewProps = DrawerScreenProps<
    RootDrawerParamList,
    ViewNames.RapunzelWebView
>;

const WebViewScreen = ({ navigation }: WebViewProps) => {
    const {
        config: [config],
        ui: [ui],
    } = useRapunzelStore();
    const autoFetch = useAutoFetchWebviewData({ navigation });
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const { handleMessage, injectedJavaScript } = useWebviewCache({
        onUpdate: (key, value) => {
            ui.snackMessage = `${key} saved`;
            if (key === "Cloudflare clearance" && value.length > 8) {
                ui.snackMessage = `${key} saved (${value.slice(0, 6)}...)`;
            }
        },
        onValidCredentials: () => autoFetch.onDataSuccess(config),
    });

    const hasClearance = !!config.apiLoaderConfig.cookie;
    const hasUserAgent = !!config.apiLoaderConfig["User-Agent"];

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.banner}>
                <Text style={styles.title}>NHentai WebView</Text>
                <Text style={styles.description}>
                    Complete the Cloudflare challenge. We will capture cookies
                    and user agent automatically.
                </Text>
                <View style={styles.statusRow}>
                    <View style={[styles.badge, hasClearance && styles.badgeReady]}>
                        <Text
                            style={[
                                styles.badgeText,
                                hasClearance && styles.badgeTextReady,
                            ]}
                        >
                            {hasClearance ? "Clearance saved" : "Waiting for clearance"}
                        </Text>
                    </View>
                    <View style={[styles.badge, hasUserAgent && styles.badgeReady]}>
                        <Text
                            style={[
                                styles.badgeText,
                                hasUserAgent && styles.badgeTextReady,
                            ]}
                        >
                            {hasUserAgent ? "User Agent saved" : "Waiting for UA"}
                        </Text>
                    </View>
                </View>
            </View>
            <WebView
                source={{
                    uri: config.webviewUrl,
                    headers: { "X-Requested-With": "Chrome Mobile" },
                }}
                incognito={false}
                originWhitelist={["*"]}
                sharedCookiesEnabled
                startInLoadingState
                style={styles.webview}
                injectedJavaScript={injectedJavaScript || WebviewInjectJavascript}
                onMessage={handleMessage}
            />
        </SafeAreaView>
    );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        banner: {
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 6,
        },
        title: {
            fontSize: 20,
            fontWeight: "800",
            color: colors.black,
        },
        description: {
            color: colors.gray,
            fontSize: 13,
            lineHeight: 18,
        },
        statusRow: {
            flexDirection: "row",
            gap: 8,
            marginTop: 8,
        },
        badge: {
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 20,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
        },
        badgeReady: {
            backgroundColor: colors.secondary,
            borderColor: colors.primary,
        },
        badgeText: {
            fontSize: 12,
            fontWeight: "700",
            color: colors.gray,
        },
        badgeTextReady: {
            color: colors.primary,
        },
        webview: {
            flex: 1,
        },
    });

export default WebViewScreen;
