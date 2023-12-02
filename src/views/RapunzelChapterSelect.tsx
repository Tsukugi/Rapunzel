import React, { FC, useCallback, useState } from "react";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import { List } from "react-native-paper";
import { useRapunzelStore } from "../store/store";
import { useRapunzelLoader } from "../api/loader";
import { RapunzelLog } from "../config/log";
import { useFocusEffect } from "@react-navigation/native";
import { Book } from "@atsu/lilith";
import { getLocaleEmoji } from "../tools/locales";
import { removeValuesInParenthesesAndBrackets } from "../tools/string";
import VirtualList from "../components/virtualList/virtualList";

interface RapunzelChapterSelectProps extends UsesNavigation {}
const RapunzelChapterSelect: FC<RapunzelChapterSelectProps> = ({
    navigation,
}) => {
    const [managedBook, setManagedbook] = useState<Book | null>(null);

    const {
        reader: [reader],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelChapterSelect, navigation });

    useFocusEffect(
        useCallback(() => {
            setManagedbook(reader.book);
        }, []),
    );

    if (!managedBook) {
        RapunzelLog.log("[RapunzelChapterSelect] No chapters found");
        return null;
    }

    const onChapterSelectHandler = (id: string) => {
        const { loadChapter } = useRapunzelLoader();
        loadChapter(id);
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

    return (
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
    );
};

export default RapunzelChapterSelect;
