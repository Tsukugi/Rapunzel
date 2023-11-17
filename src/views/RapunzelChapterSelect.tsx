import React, { FC } from "react";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import ScrollContent from "../components/scrollContent";
import { List } from "react-native-paper";
import { useRapunzelStore } from "../store/store";
import { useRapunzelLoader } from "../api/loader";

interface RapunzelChapterSelectProps extends UsesNavigation {}

const RapunzelChapterSelect: FC<RapunzelChapterSelectProps> = ({
    navigation,
}) => {
    const {
        reader: [reader],
    } = useRapunzelStore();
    useRouter({ route: ViewNames.RapunzelChapterSelect });

    const onPressChapter = async (item: string) => {
        const { loadChapter } = useRapunzelLoader();
        loadChapter(item);
        navigation.navigate(ViewNames.RapunzelReader);
    };
    
    if (!reader.book) return null;
    return (
        <ScrollContent>
            {reader.book.chapters.map((item, index) => (
                <List.Item
                    key={index}
                    title={`${reader.book?.title} ${index + 1}`}
                    onPress={() => onPressChapter(item)}
                ></List.Item>
            ))}
        </ScrollContent>
    );
};

export default RapunzelChapterSelect;
