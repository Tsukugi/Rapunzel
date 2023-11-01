import React, { FC, useEffect, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import ImageRenderer from "../components/virtualList/imageItem";
import { VirtualItem } from "../components/virtualList/interfaces";

import { DeviceCache } from "../cache/cache";

import { useTaihouStore } from "../store/store";
import { loadImageList, requestSearch } from "../api/loadManga";

interface MangaViewerProps {}

// TODO: Add heights from backend to support full image dynamically
const MangaReaderView: FC<MangaViewerProps> = ({}) => {
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [loadedImages, setLoadedImages] = useState<string[]>([]);
    const {
        reader: [readerState, watchReader],
    } = useTaihouStore();

    const onImageLoadedHandler = (uri: string, index: number) => {
        setLoadedImages((currentLoadedImages) => {
            const images = [...currentLoadedImages];
            images[index] = uri;
            readerState.images = images;
            return images;
        });
    };

    useEffect(() => {
        const loadData = async (data: string[]) => {
            if (!data) return;
            setImageUris(data);
            const images = new Array(data.length).fill(null);
            setLoadedImages(images);
            loadImageList({
                data,
                onImageLoaded: onImageLoadedHandler,
            });
        };

        watchReader(({ images }) => {
            loadData(images);
        });
    }, []);

    const onReloadHandler = (item: VirtualItem) =>
        DeviceCache.redownloadImage(item.value, imageUris[item.index]);

    return (
        <VirtualList
            data={loadedImages}
            renderer={({ item }) => (
                <ImageRenderer item={item} onClick={onReloadHandler} />
            )}
        />
    );
};
export default MangaReaderView;
