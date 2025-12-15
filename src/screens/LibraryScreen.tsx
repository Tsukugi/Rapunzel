import React, { useMemo } from "react";
import {
    FlatList,
    Image,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { useRapunzelLoader } from "../api/loader";
import { useLibraryManager } from "../library/useLibraryManager";
import { RootDrawerParamList } from "../navigation/AppNavigator";
import { colors } from "../theme";
import { LibraryBook, useRapunzelStore, ViewNames } from "../store";

type LibraryProps = DrawerScreenProps<
    RootDrawerParamList,
    ViewNames.RapunzelLibrary
>;

const coverHeight = 210;

const LibraryScreen = ({ navigation }: LibraryProps) => {
    const {
        library: [library],
    } = useRapunzelStore();
    const { toggleLibrary } = useLibraryManager();
    const { loadBook, loadChapter } = useRapunzelLoader();

    const books = useMemo(
        () =>
            library.rendered
                .map((id) => library.saved[id])
                .filter(Boolean) as LibraryBook[],
        [library.rendered, library.saved],
    );

    const openBook = async (book: LibraryBook) => {
        const fullBook = await loadBook(book.id, {
            chapterList: { page: 1, size: 50, orderBy: "desc" },
        });
        if (!fullBook || !fullBook.chapters.length) return;
        await loadChapter(fullBook.id, fullBook.chapters[0].id);
        navigation.navigate(ViewNames.RapunzelReader);
    };

    const renderCard = ({ item }: { item: LibraryBook }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => openBook(item)}
            onLongPress={() => toggleLibrary(item)}
        >
            <Image
                source={{ uri: item.cover.uri }}
                style={styles.cover}
                resizeMode="cover"
            />
            <Text numberOfLines={2} style={styles.cardTitle}>
                {item.title || item.id}
            </Text>
            <Text numberOfLines={1} style={styles.cardMeta}>
                {item.author || "Unknown author"}
            </Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={books}
                keyExtractor={(item) => item.id}
                renderItem={renderCard}
                numColumns={2}
                columnWrapperStyle={styles.column}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        No saved books yet. Long press a book in Feed or Browse
                        to add it.
                    </Text>
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
        backgroundColor: colors.white,
        borderRadius: 8,
        overflow: "hidden",
        elevation: 2,
        shadowColor: colors.black,
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
    },
    cover: {
        width: "100%",
        height: coverHeight,
        backgroundColor: colors.gray,
    },
    cardTitle: {
        paddingHorizontal: 8,
        paddingTop: 8,
        fontSize: 14,
        fontWeight: "700",
        color: colors.black,
    },
    cardMeta: {
        paddingHorizontal: 8,
        paddingBottom: 10,
        fontSize: 12,
        color: colors.gray,
    },
    emptyText: {
        textAlign: "center",
        color: colors.gray,
        marginTop: 24,
    },
});

export default LibraryScreen;
