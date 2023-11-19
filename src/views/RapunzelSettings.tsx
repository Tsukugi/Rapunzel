import React, { FC, useCallback, useState } from "react";
import { List } from "react-native-paper";
import { Book, LilithRepo } from "@atsu/lilith";

import ScrollContent from "../components/scrollContent";
import RapunzelConfigCheckbox from "../components/paper/RapunzelConfigCheckbox";
import CacheScreen from "../components/cache/cacheScreen";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import {
    useRapunzelNavigation,
    useRouter,
} from "../components/navigators/useRouter";
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

const RapunzelSettings: FC<RapunzelSettingsProps> = () => {
    const {
        reader: [reader],
        config: [config],
    } = useRapunzelStore();

    const [libraryTitles, setLibraryTitles] = useState<Book[]>([]);

    const { redirect } = useRapunzelNavigation();
    useRouter({ route: ViewNames.RapunzelSettings });

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

    const onSetValueHandler = (value: string) => {
        config.repository = value as LilithRepo;
        useRapunzelStorage().setItem(StorageEntries.config, config);
    };

    const onLoadHandler = async (book: Book) => {
        reader.book = book;
        if (!book) return;
        if (typeof book.chapters[0] === "string") {
            const newFormatBook = await useRapunzelLoader().loadBook(
                book.chapters[0],
            );
            if (!newFormatBook) return;
            reader.book = newFormatBook;
            saveBookToLibrary(newFormatBook);
            goToFirstChapterOrSelectChapter({ book: newFormatBook, redirect });
        } else {
            goToFirstChapterOrSelectChapter({ book, redirect });
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
                        initialValue={config.repository}
                        list={[LilithRepo.NHentai, LilithRepo.MangaDex]}
                        onSelect={onSetValueHandler}
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
