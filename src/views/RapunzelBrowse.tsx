import React, { FC, useEffect, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { useRapunzelLoader } from "../api/loader";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import { Book, Thumbnail } from "@atsu/lilith";
import { BrowserItemProps } from "../components/paper/browser/browserItem";
import CoupleItem from "../components/paper/browser/coupleItem";
import { BrowseState } from "../store/interfaces";
import { useRapunzelStore } from "../store/store";
import { readFileRes } from "react-native-fs";
import { useRapunzelStorage } from "../cache/storage";
import { StorageEntries } from "../cache/interfaces";
import { RapunzelLog } from "../config/log";

interface RapunzelBrowseProps extends UsesNavigation {}

const RapunzelBrowse: FC<RapunzelBrowseProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const {
        config: [config],
        browse: [browse, watchBrowse, unwatchBrowse],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelBrowse });

    useEffect(() => {
        const onWatchBrowse = async ({ cachedImages }: BrowseState) => {
            setLoadedImages(
                cachedImages.map((image, index) => ({
                    id: browse.bookList[index].id,
                    index,
                    value: image,
                })),
            );
        };

        watchBrowse(onWatchBrowse);
        return () => {
            unwatchBrowse(onWatchBrowse);
        };
    }, []);

    const onMangaSelectHandler = async (thumbnail: Thumbnail) => {
        const { loadBook, loadChapter } = useRapunzelLoader();
        const book = await loadBook(thumbnail.id);

        // We go directly to read the chapter if it's only one
        if (book?.chapters.length === 1) {
            loadChapter(book.chapters[0]);
            navigation.navigate(ViewNames.RapunzelReader);
        } else {
            navigation.navigate(ViewNames.RapunzelChapterSelect);
        }
    };

    const onMangaSaveHandler = async (thumbnail: Thumbnail) => {
        const { loadBook, loadChapter } = useRapunzelLoader();
        const book = await loadBook(thumbnail.id);
        if (!book) return null;

        // We make available the first chapter beforehand
        if (book?.chapters.length === 1) {
            loadChapter(book.chapters[0]);
        }

        saveBookToLibrary(book);
    };

    const saveBookToLibrary = async (book: Book) => {
        const { instance, setItem } = useRapunzelStorage();
        const currentLibrary =
            (await instance.getMapAsync<Record<string, Book>>(
                StorageEntries.library,
            )) || {};
        setItem(StorageEntries.library, {
            ...currentLibrary,
            [`${config.repository}.${book.id}`]: book,
        });
    };

    const load = loadedImages.filter((_, index) => index % 2 === 1);
    return (
        <VirtualList<string>
            data={load}
            renderer={({ index }) => {
                const couple: [BrowserItemProps, BrowserItemProps] = [
                    {
                        cover: loadedImages[index * 2].value,
                        thumbnail: browse.bookList[index * 2],
                        onClick: onMangaSelectHandler,
                        onLongClick: onMangaSaveHandler,
                    },
                    {
                        cover: loadedImages[index * 2 + 1]?.value,
                        thumbnail: browse.bookList[index * 2 + 1],
                        onClick: onMangaSelectHandler,
                        onLongClick: onMangaSaveHandler,
                    },
                ];
                return <CoupleItem couple={couple} />;
            }}
            onEndReached={() => RapunzelLog.log("[VirtualList] on end reached!")}
        />
    );
};
export default RapunzelBrowse;
