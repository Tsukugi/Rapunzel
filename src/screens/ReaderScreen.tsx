import React from "react";
import {
    ActivityIndicator,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { DrawerScreenProps } from "@react-navigation/drawer";
import { colors } from "../theme";
import { RootDrawerParamList } from "../navigation/AppNavigator";
import { useRapunzelStore, ViewNames } from "../store";

type ReaderProps = DrawerScreenProps<
    RootDrawerParamList,
    ViewNames.RapunzelReader
>;

const ReaderScreen = ({ navigation }: ReaderProps) => {
    const {
        reader: [reader],
        loading: [loading],
    } = useRapunzelStore();

    const { book, chapter, cachedImages } = reader;

    if (!book || !chapter) {
        return (
            <View style={[styles.container, styles.centered]}>
                <Text style={styles.emptyTitle}>Pick a book to start reading</Text>
                <Text style={styles.emptySubtitle}>
                    Browse the feed, open a book, and we will pull the first chapter
                    here.
                </Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.headerRow}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.bookTitle}>{book.title || book.id}</Text>
                    <Text style={styles.chapterTitle}>
                        {chapter.name || chapter.id}
                    </Text>
                </View>
                <View>
                    <Text
                        style={styles.chapterButton}
                        onPress={() =>
                            navigation.navigate(ViewNames.RapunzelChapterSelect)
                        }
                    >
                        Chapters
                    </Text>
                </View>
            </View>
            {cachedImages.map((image) => (
                <Image
                    key={image.id}
                    source={{ uri: image.value.uri }}
                    style={styles.page}
                    resizeMode="contain"
                />
            ))}
            {loading.reader ? (
                <ActivityIndicator
                    style={styles.loader}
                    color={colors.primary}
                    size="large"
                />
            ) : null}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 16,
        gap: 12,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
    },
    centered: {
        alignItems: "center",
        justifyContent: "center",
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
        paddingHorizontal: 16,
    },
    bookTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: colors.black,
    },
    chapterTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: colors.gray,
    },
    chapterButton: {
        color: colors.primary,
        fontWeight: "700",
    },
    page: {
        width: "100%",
        minHeight: 320,
        backgroundColor: colors.white,
        borderRadius: 8,
    },
    loader: {
        marginTop: 12,
    },
});

export default ReaderScreen;
