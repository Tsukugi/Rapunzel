import React, { FC, useCallback, useState } from "react";
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
import { removeValuesInParenthesesAndBrackets } from "../tools/string";
import { useFocusEffect } from "@react-navigation/native";
import { goToFirstChapterOrSelectChapter } from "../components/navigators/goToFirstChapterOrSelect";
import { useRapunzelLoader } from "../api/loader";
import { saveBookToLibrary } from "../components/cache/saveBookToLibrary";

interface RapunzelSettingsProps extends UsesNavigation {}

const RapunzelSettings: FC<RapunzelSettingsProps> = ({ navigation }) => {
    const {
        reader: [reader],
        config: [config],
    } = useRapunzelStore();

    const [libraryTitles, setLibraryTitles] = useState<Book[]>([]);

    useRouter({ route: ViewNames.RapunzelSettings, navigation });

    useFocusEffect(
        useCallback(() => {
            (async () => {
                const library = await useRapunzelStorage().instance.getMapAsync(
                    StorageEntries.library,
                );
                setLibraryTitles(Object.values(library || {}));
            })();
        }, []),
    );

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
            saveBookToLibrary(newFormatBook);
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
            <List.AccordionGroup>
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
                        initialValue={[LilithLanguage.english]}
                        list={Object.values(LilithLanguage)}
                        onSelect={onSetValueHandlerLanguages}
                    />
                </List.Accordion>
                <List.Accordion title="Device and Cache" id="2">
                    <CacheScreen />
                </List.Accordion>
                <List.Accordion
                    title={`Number of titles in Library: ${libraryTitles.length}`}
                    id="3"
                >
                    {libraryTitles.map((book, index) => (
                        <List.Item
                            key={index}
                            title={removeValuesInParenthesesAndBrackets(
                                book.title,
                            )}
                            onPress={() => onLoadHandler(book)}
                        />
                    ))}
                </List.Accordion>
            </List.AccordionGroup>
        </ScrollContent>
    );
};

export default RapunzelSettings;
