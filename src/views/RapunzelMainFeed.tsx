import React, { FC, useCallback, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { VirtualItem } from "../components/virtualList/interfaces";
import { ViewNames } from "../components/navigators/interfaces";
import {
    useRapunzelNavigation,
    useRouter,
} from "../components/navigators/useRouter";

import { useRapunzelStore } from "../store/store";

import { useFocusEffect } from "@react-navigation/native";
import { useRapunzelLoader } from "../api/loader";
import { RapunzelLog } from "../config/log";
import CoupleItem from "../components/paper/browser/coupleItem";
import { BookBase } from "@atsu/lilith";
import { saveBookToLibrary } from "../components/cache/saveBookToLibrary";
import { goToFirstChapterOrSelectChapter } from "../components/navigators/goToFirstChapterOrSelect";
import BrowseItem, {
    BrowserItemProps,
} from "../components/paper/browser/browserItem";

interface RapunzelMainFeedProps {}

const RapunzelMainFeed: FC<RapunzelMainFeedProps> = ({}) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const {
        latest: [latestBooks],
        loading: [, useLoadingEffect],
    } = useRapunzelStore();

    useFocusEffect(
        useCallback(() => {
            useRapunzelLoader().getLatestBooks();
        }, []),
    );

    const { redirect } = useRapunzelNavigation();

    useRouter({ route: ViewNames.RapunzelMainFeed });

    useLoadingEffect(({ latest }) => {
        if (latest) return;

        RapunzelLog.log(latestBooks.cachedImages.length);
        setLoadedImages(
            latestBooks.cachedImages.map((image, index) => ({
                id: latestBooks.bookList[index].id,
                index,
                value: image,
            })),
        );
    });

    const onMangaSelectHandler = async (bookBase: BookBase) => {
        const { loadBook } = useRapunzelLoader();
        const book = await loadBook(bookBase.id);
        if (!book) return;
        goToFirstChapterOrSelectChapter({ book, redirect });
    };

    const onMangaSaveHandler = async (bookBase: BookBase) => {
        const { loadBook, loadChapter } = useRapunzelLoader();
        const book = await loadBook(bookBase.id);
        if (!book) return null;

        // We make available the first chapter beforehand
        if (book?.chapters.length === 1) {
            loadChapter(book.chapters[0].id);
        }

        saveBookToLibrary(book);
    };

    const feedCouple = (index: number): BrowserItemProps | null => {
        if (!latestBooks.bookList[index]) return null;
        return {
            cover: loadedImages[index].value,
            bookBase: latestBooks.bookList[index],
            onClick: onMangaSelectHandler,
            onLongClick: onMangaSaveHandler,
        };
    };

    const onEndReachedHandler = () => {
        useRapunzelLoader().getLatestBooks(latestBooks.page + 1, false);
    };

    const ItemProvider = ({ item }: { item: BrowserItemProps | null }) => {
        const style = {
            height: 600,
        };
        return item ? (
            <BrowseItem
                cover={item.cover}
                bookBase={item.bookBase}
                onClick={item.onClick}
                onLongClick={item.onLongClick}
                style={style}
                coverStyle={{ ...style, marginTop: 5 }}
                titleStyle={{ fontSize: 16, lineHeight: 20, height: 70 }}
            />
        ) : (
            <BrowseItem bookBase={null} />
        );
    };

    return (
        <VirtualList
            data={loadedImages}
            renderer={({ index }) => <ItemProvider item={feedCouple(index)} />}
            onEndReached={onEndReachedHandler}
        />
    );
};
export default RapunzelMainFeed;
