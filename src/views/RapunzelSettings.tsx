import React, { FC } from "react";
import { List } from "react-native-paper";
import { Book, LilithLanguage, LilithRepo } from "@atsu/lilith";

import ScrollContent from "../components/scrollContent";
import RapunzelConfigCheckbox from "../components/paper/RapunzelConfigCheckbox";
import CacheScreen from "../components/cache/cacheScreen";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import { useRapunzelStore } from "../store/store";
import { useRapunzelStorage } from "../cache/storage";
import { StorageEntries } from "../cache/interfaces";
import { RapunzelSelect } from "../components/RapunzelSelect";
import { goToFirstChapterOrSelectChapter } from "../components/navigators/goToFirstChapterOrSelect";
import { useRapunzelLoader } from "../api/loader";
import { useLibrary } from "../components/cache/library";

interface RapunzelSettingsProps extends UsesNavigation {}

const RapunzelSettings: FC<RapunzelSettingsProps> = ({ navigation }) => {
    const {
        reader: [reader],
        config: [config],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelSettings, navigation });

    const onSetValueHandlerRepository = (value: string[]) => {
        config.repository = value[0] as LilithRepo;
        useRapunzelStorage().setItem(StorageEntries.config, config);
    };
    const onSetValueHandlerLanguages = (value: string[]) => {
        config.languages = value as LilithLanguage[];
        useRapunzelStorage().setItem(StorageEntries.config, config);
    };

    const onLoadHandler = async (book: Book) => {
        reader.book = book;
        if (!book) return;
        if (typeof book.chapters[0] === "string") {
            // This functionality is for older versions of chapter, when it was only an ID
            const newFormatBook = await useRapunzelLoader().loadBook(
                book.chapters[0],
                {
                    chapterList: {
                        page: 1,
                        size: 50,
                        orderBy: "desc",
                    },
                },
            );
            if (!newFormatBook) return;
            reader.book = newFormatBook;
            useLibrary().saveBookToLibrary(newFormatBook);
            goToFirstChapterOrSelectChapter({
                book: newFormatBook,
                navigation,
            });
        } else {
            goToFirstChapterOrSelectChapter({
                book,
                navigation,
            });
        }
    };

    return (
        <ScrollContent>
            <List.AccordionGroup expandedId="1">
                <List.Accordion title="App settings" id="1">
                    <RapunzelConfigCheckbox
                        label="Enable debug app"
                        configId="debug"
                    />
                    <RapunzelConfigCheckbox
                        label="Use Fallback extensions"
                        configId="useFallbackExtensionOnDownload"
                    />
                    <RapunzelSelect
                        label="Repository"
                        initialValue={[config.repository]}
                        list={[LilithRepo.NHentai, LilithRepo.MangaDex]}
                        onSelect={onSetValueHandlerRepository}
                    />
                    <RapunzelSelect
                        label="Languages"
                        initialValue={config.languages}
                        list={Object.values(LilithLanguage)}
                        onSelect={onSetValueHandlerLanguages}
                    />
                </List.Accordion>
                <List.Accordion title="Device and Cache" id="2">
                    <CacheScreen />
                </List.Accordion>
            </List.AccordionGroup>
        </ScrollContent>
    );
};

export default RapunzelSettings;
