import React, { FC, useState } from "react";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import { Button, Card, List, Text } from "react-native-paper";
import { useRapunzelStore } from "../store/store";
import { useRapunzelLoader } from "../api/loader";
import { RapunzelLog } from "../config/log";
import { Book } from "@atsu/lilith";
import { getLocaleEmoji } from "../tools/locales";
import { removeValuesInParenthesesAndBrackets } from "../tools/string";
import VirtualList from "../components/virtualList/virtualList";
import { Dimensions } from "react-native";
import { LocalTheme } from "../../themes";

const { width } = Dimensions.get("screen");
interface RapunzelChapterSelectProps extends UsesNavigation {}
const RapunzelChapterSelect: FC<RapunzelChapterSelectProps> = ({
    navigation,
}) => {
    const { colors, dark } = LocalTheme.useTheme();
    const [managedBook, setManagedbook] = useState<Book | null>(null);

    const {
        library: [library],
        reader: [reader],
        loading: [, loadingEffect],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelChapterSelect, navigation });

    loadingEffect(() => {
        setManagedbook(reader.book);
    });

    if (!managedBook) {
        RapunzelLog.log("[RapunzelChapterSelect] No chapters found");
        return null;
    }

    const onChapterSelectHandler = (id: string) => {
        const { loadChapter } = useRapunzelLoader();

        loadChapter(managedBook.id, id);

        navigation.navigate(ViewNames.RapunzelReader);
    };

    const getTitle = (index: number) => {
        const chapter = managedBook.chapters[index];
        const language = getLocaleEmoji(chapter.language);
        if (chapter.title) {
            const title = removeValuesInParenthesesAndBrackets(chapter.title);
            return `${language} ${chapter.chapterNumber} ${title}`;
        } else {
            return `${language} Chapter ${chapter.chapterNumber}: (Untitled)`;
        }
    };

    const onEndReachedHandler = () => {
        RapunzelLog.log("[onEndReachedHandler] Reached");
        if (!reader.book) {
            RapunzelLog.log("[onEndReachedHandler] No chapters found");
            return null;
        }
        useRapunzelLoader().loadBook(
            reader.book.id,
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

    const backdropOpacity = dark ? "0.5" : "0.2";
    const cardHeight = 200;

    return (
        <>
            <Card style={{ position: "relative" }}>
                <Card.Cover
                    source={{ uri: managedBook.cover.uri }}
                    style={{ height: cardHeight }}
                />

                <Card.Content
                    style={{
                        position: "absolute",
                        zIndex: 2,
                        width,
                        height: cardHeight,
                        backgroundColor: `rgba(0.5, 0.5, 0.5, ${backdropOpacity})`,
                    }}
                >
                    <Text variant="titleLarge">{""}</Text>
                    <Text variant="titleLarge" numberOfLines={2}>
                        {managedBook.title}
                    </Text>
                    <Text variant="bodyMedium">{managedBook.author}</Text>
                    <Text variant="bodyMedium" numberOfLines={2}>
                        {managedBook.tags.map((val) => val.name).join(" ")}
                    </Text>
                    <Text variant="bodyMedium">
                        {managedBook.availableLanguages
                            .map((lang) => getLocaleEmoji(lang))
                            .join(" ")}
                    </Text>
                </Card.Content>
            </Card>
            <VirtualList
                data={managedBook.chapters.map((chapter, index) => {
                    return { id: chapter.id, index, value: chapter };
                })}
                renderer={({ item, index }) => {
                    return (
                        <List.Item
                            key={index}
                            title={getTitle(index)}
                            onPress={() => onChapterSelectHandler(item.id)}
                        />
                    );
                }}
                onEndReached={onEndReachedHandler}
            />
        </>
    );
};

export default RapunzelChapterSelect;
