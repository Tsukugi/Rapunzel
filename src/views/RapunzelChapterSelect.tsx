import React, { FC, useCallback, useState } from "react";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import {
    useRapunzelNavigation,
    useRouter,
} from "../components/navigators/useRouter";
import ScrollContent from "../components/scrollContent";
import { List } from "react-native-paper";
import { useRapunzelStore } from "../store/store";
import { useRapunzelLoader } from "../api/loader";
import { RapunzelLog } from "../config/log";
import { useFocusEffect } from "@react-navigation/native";
import { Book, ChapterBase } from "@atsu/lilith";
import { getLocaleEmoji } from "../tools/locales";
import { removeValuesInParenthesesAndBrackets } from "../tools/string";

interface ItemListProps {
    chapters: ChapterBase[];
}
const ItemList = ({ chapters }: ItemListProps) => {
    const { redirect } = useRapunzelNavigation();

    const getTitle = (index: number) => {
        const chapter = chapters[index];

        const language = getLocaleEmoji(chapter.language);
        if (chapter.title) {
            const title = removeValuesInParenthesesAndBrackets(chapter.title);
            return `${language} ${title}`;
        } else {
            return `${language} Chapter ${chapter.chapterNumber}: (Untitled)`;
        }
    };

    const onPressChapter = async (item: string) => {
        const { loadChapter } = useRapunzelLoader();
        loadChapter(item);
        redirect(ViewNames.RapunzelReader);
    };
    return chapters.map((item, index) => (
        <List.Item
            key={index}
            title={getTitle(index)}
            onPress={() => onPressChapter(item.id)}
        ></List.Item>
    ));
};

interface RapunzelChapterSelectProps extends UsesNavigation {}
const RapunzelChapterSelect: FC<RapunzelChapterSelectProps> = ({
    navigation,
}) => {
    const [managedBook, setManagedbook] = useState<Book | null>(null);

    const {
        reader: [reader],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelChapterSelect });

    useFocusEffect(
        useCallback(() => {
            setManagedbook(reader.book);
        }, []),
    );

    if (!managedBook) {
        RapunzelLog.log("[RapunzelChapterSelect] No chapters found");
        return null;
    }

    return (
        <ScrollContent>
            <ItemList chapters={managedBook.chapters} />
        </ScrollContent>
    );
};

export default RapunzelChapterSelect;
