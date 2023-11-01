import React, { FC, useEffect, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { useTaihouStore } from "../store/store";
import { loadImageList } from "../api/loadManga";
import { NHentaiApi } from "../api/nhentai";
import ImageRenderer from "../components/virtualList/imageItem";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation } from "../components/navigators/interfaces";
import { NHentaiCache } from "../cache/nhentai";

interface BrowseViewProps extends UsesNavigation {}

const BrowseView: FC<BrowseViewProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<string[]>([]);
    const {
        browse: [browseState],
        header: [, watchHeader],
        reader: [readerState],
    } = useTaihouStore();

    const onImageLoadedHandler = (uri: string, index: number) =>
        setLoadedImages((currentLoadedImages) => {
            const images = [...currentLoadedImages];
            images[index] = uri;
            return images;
        });

    useEffect(() => {
        const loadData = async (searchValue: string) => {
            const data = await NHentaiApi.search(searchValue);
            const { results } = data;
            if (results.length === 0) return;

            const covers: string[] = [];
            const bookDict: Record<string, unknown> = {};
            results.forEach((manga) => {
                covers.push(manga.cover.uri);
                bookDict[manga.id] = manga;
            });

            browseState.bookList = bookDict;

            const loadedImages = new Array(covers.length).fill(null);
            setLoadedImages(loadedImages);
            loadImageList({
                data: covers,
                onImageLoaded: onImageLoadedHandler,
            });
        };
        watchHeader(({ searchValue }) => {
            loadData(searchValue);
        });
    }, []);

    const onMangaSelectHandler = async (item: VirtualItem) => {
        navigation.navigate("MangaReaderView");
        const code = Object.keys(browseState.bookList)[item.index];
        console.log(code);
        const book = await NHentaiApi.getByCode(code);
        readerState.title = code;
        //readerState.images = book.map((book) => NHentaiCache.getFileName(book));
        readerState.images = book;
    };

    return (
        <VirtualList
            data={loadedImages}
            renderer={({ item }) => (
                <ImageRenderer item={item} onClick={onMangaSelectHandler} />
            )}
        />
    );
};
export default BrowseView;
