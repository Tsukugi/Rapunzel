import React, { FC, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { useRapunzelLoader } from "../api/loader";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import {
    useRapunzelNavigation,
    useRouter,
} from "../components/navigators/useRouter";
import { BookBase } from "@atsu/lilith";
import { BrowserItemProps } from "../components/paper/browser/browserItem";
import CoupleItem from "../components/paper/browser/coupleItem";
import { useRapunzelStore } from "../store/store";
import { goToFirstChapterOrSelectChapter } from "../components/navigators/goToFirstChapterOrSelect";
import { saveBookToLibrary } from "../components/cache/saveBookToLibrary";

interface RapunzelBrowseProps extends UsesNavigation {}

const RapunzelBrowse: FC<RapunzelBrowseProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const {
        loading: [, useLoadingEffect],
        header: [header],
        browse: [browseState],
    } = useRapunzelStore();

    const { redirect } = useRapunzelNavigation();
    useRouter({ route: ViewNames.RapunzelBrowse });

    useLoadingEffect(({ browse }) => {
        if (browse) return;

        setLoadedImages(
            browseState.cachedImages.map((image, index) => ({
                id: browseState.bookList[index].id,
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

    const onEndReachedHandler = () => {
        useRapunzelLoader().loadSearch(
            header.searchValue,
            {
                page: browseState.page + 1,
            },
            false,
        );
    };

    const feedCouple = (index: number): BrowserItemProps | null => {
        if (!browseState.bookList[index]) return null;
        return {
            cover: loadedImages[index].value,
            bookBase: browseState.bookList[index],
            onClick: onMangaSelectHandler,
            onLongClick: onMangaSaveHandler,
        };
    };

    /**
     * We filter even images so we have half of the elements but each will have both as [odd, even]
     */
    const oddImagesOnly = loadedImages.filter((_, index) => index % 2 === 1);
    return (
        <VirtualList
            data={oddImagesOnly}
            renderer={({ index }) => (
                <CoupleItem
                    couple={[feedCouple(index * 2), feedCouple(index * 2 + 1)]}
                />
            )}
            onEndReached={onEndReachedHandler}
        />
    );
};
export default RapunzelBrowse;
