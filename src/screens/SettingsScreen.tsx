import React from "react";
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useTheme } from "../theme";
import { LilithRepo, useRapunzelStore } from "../store";

const repoOptions = Object.values(LilithRepo);

const SettingsScreen = () => {
    const {
        config: [config],
    } = useRapunzelStore();
    const { colors, toggleTheme, theme } = useTheme();
    const styles = createStyles(colors);

    const toggles = [
        {
            key: "debug",
            label: "Enable debug logging",
            value: config.debug,
            onChange: (next: boolean) => (config.debug = next),
        },
        {
            key: "enableCache",
            label: "Cache images to disk",
            value: config.enableCache,
            onChange: (next: boolean) => (config.enableCache = next),
        },
        {
            key: "useFallbackExtensionOnDownload",
            label: "Use fallback extensions",
            value: config.useFallbackExtensionOnDownload,
            onChange: (next: boolean) =>
                (config.useFallbackExtensionOnDownload = next),
        },
    ];

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.title}>Settings</Text>

                <Text style={styles.sectionTitle}>App</Text>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <View style={styles.labelColumn}>
                            <Text style={styles.label}>Use dark theme</Text>
                        </View>
                        <Switch
                            value={theme === "dark"}
                            onValueChange={toggleTheme}
                            thumbColor={
                                theme === "dark" ? colors.primary : colors.white
                            }
                            trackColor={{
                                false: colors.gray,
                                true: colors.primary,
                            }}
                        />
                    </View>

                    {toggles.map((toggle) => (
                        <View key={toggle.key} style={styles.row}>
                            <View style={styles.labelColumn}>
                                <Text style={styles.label}>{toggle.label}</Text>
                            </View>
                            <Switch
                                value={toggle.value}
                                onValueChange={toggle.onChange}
                                thumbColor={
                                    toggle.value ? colors.primary : colors.white
                                }
                                trackColor={{
                                    false: colors.gray,
                                    true: colors.primary,
                                }}
                            />
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Repository</Text>
                <View style={[styles.card, styles.repoCard]}>
                    <Text style={styles.helperText}>
                        Pick the source to browse. NHentai will open the WebView
                        first to grab cookies and user agent.
                    </Text>
                    <View style={styles.repoGrid}>
                        {repoOptions.map((repo) => {
                            const isActive = config.repository === repo;
                            return (
                                <TouchableOpacity
                                    key={repo}
                                    style={[
                                        styles.repoChip,
                                        isActive && styles.repoChipActive,
                                    ]}
                                    onPress={() => (config.repository = repo)}
                                >
                                    <Text
                                        style={[
                                            styles.repoChipText,
                                            isActive && styles.repoChipTextActive,
                                        ]}
                                    >
                                        {repo}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Network Headers</Text>
                <View style={styles.card}>
                    <Text style={styles.helperText}>
                        Captured from the WebView for Cloudflare-protected
                        sources.
                    </Text>
                    <Text style={styles.metaLabel}>Cloudflare clearance</Text>
                    <Text
                        style={styles.metaValue}
                        numberOfLines={1}
                        ellipsizeMode="middle"
                    >
                        {config.apiLoaderConfig.cookie || "Not captured yet"}
                    </Text>
                    <Text style={[styles.metaLabel, { marginTop: 12 }]}>
                        User Agent
                    </Text>
                    <Text
                        style={styles.metaValue}
                        numberOfLines={2}
                        ellipsizeMode="middle"
                    >
                        {config.apiLoaderConfig["User-Agent"] ||
                            "Waiting for WebView capture"}
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            padding: 16,
            gap: 16,
        },
        card: {
            backgroundColor: colors.card,
            borderRadius: 12,
            padding: 14,
            shadowColor: colors.black,
            shadowOpacity: 0.06,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            borderWidth: 1,
            borderColor: colors.border,
        },
        title: {
            fontSize: 24,
            fontWeight: "800",
            color: colors.black,
        },
        sectionTitle: {
            fontSize: 16,
            fontWeight: "700",
            color: colors.black,
        },
        row: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            gap: 12,
        },
        labelColumn: {
            flex: 1,
        },
        label: {
            fontSize: 15,
            fontWeight: "600",
            color: colors.black,
        },
        repoCard: {
            gap: 12,
        },
        helperText: {
            color: colors.gray,
            fontSize: 13,
            lineHeight: 18,
        },
        repoGrid: {
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
        },
        repoChip: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 10,
            borderWidth: 1,
            borderColor: colors.gray,
            backgroundColor: colors.background,
        },
        repoChipActive: {
            borderColor: colors.primary,
            backgroundColor: colors.secondary,
        },
        repoChipText: {
            fontWeight: "700",
            color: colors.black,
        },
        repoChipTextActive: {
            color: colors.primary,
        },
        metaLabel: {
            fontSize: 13,
            color: colors.gray,
            marginTop: 4,
        },
        metaValue: {
            fontSize: 14,
            color: colors.black,
            fontWeight: "600",
            marginTop: 4,
        },
    });

export default SettingsScreen;
