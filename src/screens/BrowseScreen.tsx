import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { useRapunzelLoader } from "../api/loader";
import { RootDrawerParamList } from "../navigation/AppNavigator";
import { useTheme } from "../theme";
import { useRapunzelStore, VirtualItem, ViewNames } from "../store";
import { useLibraryManager } from "../library/useLibraryManager";

type BrowseProps = DrawerScreenProps<
    RootDrawerParamList,
    ViewNames.RapunzelBrowse
>;

const coverHeight = 210;

const BrowseScreen = ({ navigation }: BrowseProps) => {
    const {
        header: [header],
        browse: [browse],
        loading: [loading],
    } = useRapunzelStore();
    const { loadSearch, loadBook, loadChapter } = useRapunzelLoader();
    const { toggleLibrary, isSaved } = useLibraryManager();
    const { colors } = useTheme();
    const styles = createStyles(colors);

    const [query, setQuery] = useState(header.searchValue);
    const [refreshing, setRefreshing] = useState(false);

    const results = useMemo(
        () => Object.values(browse.cachedImagesRecord),
        [browse.cachedImagesRecord],
    );

    const openFirstChapter = useCallback(
        async (bookId: string) => {
            const book = await loadBook(bookId, {
                chapterList: { page: 1, size: 50, orderBy: "desc" },
            });
            if (!book || !book.chapters.length) return;
            await loadChapter(book.id, book.chapters[0].id);
            navigation.navigate(ViewNames.RapunzelReader);
        },
        [loadBook, loadChapter, navigation],
    );

    const runSearch = useCallback(
        async (clean: boolean) => {
            if (!query.trim()) return;
            setRefreshing(true);
            header.searchValue = query;
            await loadSearch(
                query,
                {
                    page: clean ? 1 : browse.page,
                },
                clean,
            );
            setRefreshing(false);
        },
        [browse.page, header, loadSearch, query],
    );

    useEffect(() => {
        if (query.trim()) {
            runSearch(true);
        }
    }, [runSearch, query]);

    const onEndReached = () => {
        if (loading.browse || !query.trim()) return;
        loadSearch(query, { page: browse.page + 1 }, false);
    };

    const renderCard = ({ item }: { item: VirtualItem<string> }) => {
        const book = browse.bookListRecord[item.id];
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

    return (
        <View style={styles.container}>
            <View style={styles.searchBar}>
                <TextInput
                    placeholder="Search by title or code"
                    placeholderTextColor={colors.gray}
                    value={query}
                    onChangeText={setQuery}
                    style={styles.input}
                    returnKeyType="search"
                    onSubmitEditing={() => runSearch(true)}
                />
                <TouchableOpacity
                    style={[
                        styles.searchButton,
                        !query.trim() && styles.searchButtonDisabled,
                    ]}
                    onPress={() => runSearch(true)}
                    disabled={!query.trim()}
                >
                    {loading.browse ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.searchButtonText}>Search</Text>
                    )}
                </TouchableOpacity>
            </View>
            <FlatList
                data={results}
                keyExtractor={(item) => item.id}
                renderItem={renderCard}
                numColumns={2}
                columnWrapperStyle={styles.column}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {query.trim()
                            ? "No results yet. Try another search."
                            : "Start typing to search the catalog."}
                    </Text>
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={() => runSearch(true)}
                        tintColor={colors.primary}
                    />
                }
                onEndReached={onEndReached}
                onEndReachedThreshold={0.4}
            />
        </View>
    );
};

const createStyles = (colors: ReturnType<typeof useTheme>["colors"]) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        searchBar: {
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 10,
            gap: 8,
        },
        input: {
            flex: 1,
            height: 44,
            borderWidth: 1,
            borderColor: colors.gray,
            borderRadius: 8,
            paddingHorizontal: 12,
            color: colors.black,
            backgroundColor: colors.card,
        },
        searchButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 8,
        },
        searchButtonDisabled: {
            opacity: 0.6,
        },
        searchButtonText: {
            color: colors.white,
            fontWeight: "700",
        },
        listContent: {
            paddingHorizontal: 12,
            paddingBottom: 24,
            gap: 12,
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
        emptyText: {
            textAlign: "center",
            color: colors.gray,
            marginTop: 24,
        },
    });

export default BrowseScreen;
