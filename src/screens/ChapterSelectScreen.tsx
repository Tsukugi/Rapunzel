import React, { useMemo } from "react";
import {
    ActivityIndicator,
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { Chapter } from "@atsu/lilith";
import { useRapunzelLoader } from "../api/loader";
import { RootDrawerParamList } from "../navigation/AppNavigator";
import { colors } from "../theme";
import { useRapunzelStore, ViewNames } from "../store";
import { getLocaleEmoji } from "../tools/locales";

type ChapterSelectProps = DrawerScreenProps<
    RootDrawerParamList,
    ViewNames.RapunzelChapterSelect
>;

const ChapterSelectScreen = ({ navigation }: ChapterSelectProps) => {
    const {
        reader: [reader],
        loading: [loading],
    } = useRapunzelStore();
    const { loadChapter, loadBook } = useRapunzelLoader();

    const book = reader.book;
    const chapters = useMemo(() => book?.chapters || [], [book?.chapters]);

    if (!book) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.emptyTitle}>No book selected</Text>
                <Text style={styles.emptySubtitle}>
                    Open a book from Feed or Browse to see its chapters.
                </Text>
            </View>
        );
    }

    const onSelectChapter = async (chapterId: string) => {
        await loadChapter(book.id, chapterId);
        navigation.navigate(ViewNames.RapunzelReader);
    };

    const onEndReached = () => {
        if (loading.reader) return;
        loadBook(
            book.id,
            {
                chapterList: {
                    page: reader.chapterPage + 1,
                    size: 50,
                    orderBy: "desc",
                },
            },
            false,
        );
    };

    const renderChapter = ({ item, index }: { item: Chapter; index: number }) => (
        <TouchableOpacity
            style={styles.chapterRow}
            onPress={() => onSelectChapter(item.id)}
        >
            <View>
                <Text style={styles.chapterTitle}>
                    {getLocaleEmoji(item.language)}{" "}
                    {item.chapterNumber ?? index + 1}
                </Text>
                <Text style={styles.chapterMeta} numberOfLines={1}>
                    {item.title || "Untitled"}
                </Text>
            </View>
            <Text style={styles.chapterArrow}>›</Text>
        </TouchableOpacity>
    );

    const listHeader = (
        <View style={styles.header}>
            <Image
                source={{ uri: book.cover.uri }}
                style={styles.headerCover}
                resizeMode="cover"
            />
            <View style={styles.headerInfo}>
                <Text numberOfLines={2} style={styles.bookTitle}>
                    {book.title || book.id}
                </Text>
                <Text style={styles.bookMeta} numberOfLines={1}>
                    {book.author || "Unknown author"}
                </Text>
                <Text style={styles.bookMeta} numberOfLines={1}>
                    {book.tags?.map((tag) => tag.name).join(" ") || ""}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={chapters}
                keyExtractor={(item) => item.id}
                renderItem={renderChapter}
                ListHeaderComponent={listHeader}
                onEndReached={onEndReached}
                onEndReachedThreshold={0.5}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
                ListFooterComponent={
                    loading.reader ? (
                        <ActivityIndicator
                            style={styles.loader}
                            color={colors.primary}
                        />
                    ) : null
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    centered: {
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.black,
        marginBottom: 6,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.gray,
        textAlign: "center",
    },
    header: {
        flexDirection: "row",
        padding: 12,
        gap: 12,
    },
    headerCover: {
        width: 90,
        height: 130,
        borderRadius: 8,
        backgroundColor: colors.gray,
    },
    headerInfo: {
        flex: 1,
        justifyContent: "center",
        gap: 4,
    },
    bookTitle: {
        fontSize: 16,
        fontWeight: "800",
        color: colors.black,
    },
    bookMeta: {
        fontSize: 13,
        color: colors.gray,
    },
    chapterRow: {
        paddingHorizontal: 14,
        paddingVertical: 12,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: colors.white,
    },
    chapterTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: colors.black,
    },
    chapterMeta: {
        fontSize: 13,
        color: colors.gray,
        marginTop: 4,
    },
    chapterArrow: {
        fontSize: 24,
        color: colors.gray,
    },
    separator: {
        height: 1,
        backgroundColor: colors.secondary,
    },
    loader: {
        paddingVertical: 12,
    },
});

export default ChapterSelectScreen;
