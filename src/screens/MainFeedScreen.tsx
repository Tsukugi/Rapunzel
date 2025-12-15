import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { useRapunzelLoader } from "../api/loader";
import { RootDrawerParamList } from "../navigation/AppNavigator";
import { useTheme } from "../theme";
import { useRapunzelStore, VirtualItem, ViewNames } from "../store";
import { useLibraryManager } from "../library/useLibraryManager";

type MainFeedProps = DrawerScreenProps<
    RootDrawerParamList,
    ViewNames.RapunzelMainFeed
>;

const coverHeight = 220;

const MainFeedScreen = ({ navigation }: MainFeedProps) => {
    const {
        latest: [latest],
        trending: [trending],
        loading: [loading],
    } = useRapunzelStore();
    const { getLatestBooks, getTrendingBooks, loadBook, loadChapter } =
        useRapunzelLoader();
    const { toggleLibrary, isSaved } = useLibraryManager();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [refreshing, setRefreshing] = useState(false);

    const latestItems = useMemo(
        () => Object.values(latest.cachedImagesRecord),
        [latest.cachedImagesRecord],
    );
    const trendingItems = useMemo(
        () => Object.values(trending.cachedImagesRecord),
        [trending.cachedImagesRecord],
    );

    const openFirstChapter = useCallback(
        async (bookId: string) => {
            const book = await loadBook(bookId, {
                chapterList: { page: 1, size: 50, orderBy: "desc" },
            });
            if (!book || !book.chapters.length) return;
            const firstChapterId = book.chapters[0].id;
            await loadChapter(book.id, firstChapterId);
            navigation.navigate(ViewNames.RapunzelReader);
        },
        [loadBook, loadChapter, navigation],
    );

    const refreshFeed = useCallback(
        async (clean: boolean) => {
            setRefreshing(true);
            await Promise.all([getTrendingBooks(clean), getLatestBooks(1, clean)]);
            setRefreshing(false);
        },
        [getLatestBooks, getTrendingBooks],
    );

    useEffect(() => {
        refreshFeed(true);
    }, [refreshFeed]);

    const onEndReached = () => {
        if (loading.latest) return;
        getLatestBooks(latest.page + 1, false);
    };

    const renderCard = ({
        item,
    }: {
        item: VirtualItem<string>;
        index: number;
    }) => {
        const book = latest.bookListRecord[item.id];
        if (!book) return null;
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => openFirstChapter(book.id)}
                onLongPress={() => toggleLibrary(book)}
            >
                {isSaved(book.id) ? (
                    <View style={styles.savedBadge}>
                        <Text style={styles.savedText}>Saved</Text>
                    </View>
                ) : null}
                <Image
                    source={{ uri: item.value }}
                    style={styles.cover}
                    resizeMode="cover"
                />
                <Text numberOfLines={2} style={styles.cardTitle}>
                    {book.title || book.id}
                </Text>
            </TouchableOpacity>
        );
    };

    const renderTrending = () => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.trendingRow}
            >
                {trendingItems.map((item) => {
                    const book = trending.bookListRecord[item.id];
                    if (!book) return null;
                    return (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.trendingCard}
                            onPress={() => openFirstChapter(book.id)}
                            onLongPress={() => toggleLibrary(book)}
                        >
                            {isSaved(book.id) ? (
                                <View style={styles.trendingBadge}>
                                    <Text style={styles.trendingBadgeText}>
                                        Saved
                                    </Text>
                                </View>
                            ) : null}
                            <Image
                                source={{ uri: item.value }}
                                style={styles.trendingCover}
                                resizeMode="cover"
                            />
                            <Text numberOfLines={1} style={styles.trendingTitle}>
                                {book.title || book.id}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    return (
        <FlatList
            data={latestItems}
            keyExtractor={(item) => item.id}
            renderItem={renderCard}
            numColumns={2}
            columnWrapperStyle={styles.column}
            ListHeaderComponent={renderTrending()}
            ListEmptyComponent={
                <Text style={styles.emptyText}>No books yet. Pull to refresh.</Text>
            }
            refreshControl={
                <RefreshControl
                    refreshing={refreshing || loading.latest}
                    onRefresh={() => refreshFeed(true)}
                    tintColor={colors.primary}
                />
            }
            onEndReached={onEndReached}
            onEndReachedThreshold={0.4}
            contentContainerStyle={styles.listContent}
        />
    );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
    StyleSheet.create({
        listContent: {
            paddingHorizontal: 12,
            paddingBottom: 24,
            backgroundColor: colors.background,
        },
        column: {
            gap: 12,
            marginBottom: 12,
        },
        card: {
            flex: 1,
            backgroundColor: colors.card,
            borderRadius: 8,
            overflow: "hidden",
            elevation: 2,
            shadowColor: colors.black,
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            position: "relative",
            borderWidth: 1,
            borderColor: colors.border,
        },
        cover: {
            width: "100%",
            height: coverHeight,
            backgroundColor: colors.gray,
        },
        cardTitle: {
            paddingHorizontal: 8,
            paddingVertical: 10,
            fontSize: 14,
            fontWeight: "600",
            color: colors.black,
        },
        savedBadge: {
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: colors.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            zIndex: 1,
        },
        savedText: {
            color: colors.white,
            fontSize: 11,
            fontWeight: "700",
        },
        section: {
            paddingVertical: 12,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "700",
            marginBottom: 8,
            color: colors.black,
        },
        trendingRow: {
            gap: 12,
            paddingVertical: 4,
        },
        trendingCard: {
            width: 140,
            backgroundColor: colors.card,
            borderRadius: 8,
            overflow: "hidden",
            elevation: 2,
            shadowColor: colors.black,
            shadowOpacity: 0.08,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            position: "relative",
            borderWidth: 1,
            borderColor: colors.border,
        },
        trendingCover: {
            width: "100%",
            height: coverHeight * 0.65,
            backgroundColor: colors.gray,
        },
        trendingTitle: {
            paddingHorizontal: 8,
            paddingVertical: 10,
            fontSize: 13,
            fontWeight: "600",
            color: colors.black,
        },
        trendingBadge: {
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: colors.primary,
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 12,
            zIndex: 1,
        },
        trendingBadgeText: {
            color: colors.white,
            fontSize: 10,
            fontWeight: "700",
        },
        emptyText: {
            textAlign: "center",
            color: colors.gray,
            marginTop: 24,
        },
    });

export default MainFeedScreen;
