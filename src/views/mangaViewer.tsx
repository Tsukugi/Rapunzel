import React, { FC, useEffect, useState } from "react";
import { NHentai } from "../api/nhentai";
import VirtualList from "../components/virtualList/virtualList";
import { NHentaiCache } from "../cache/nhentai";
import ImageItem from "../components/virtualList/imageItem";
import { DeviceCache } from "../cache/cache";
import CacheScreen from "../components/cacheScreen";

interface MangaViewerProps {
    // Define your component props here
}

const MangaViewer: FC<MangaViewerProps> = ({}) => {
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [loadedImages, setLoadedImages] = useState<string[]>([]);

    useEffect(() => {
        const loadData = async () => {
            const uris: string[] = await NHentai.searchFirstMatch(
                "atago azur lane",
            );

            setImageUris(uris);
            setLoadedImages(new Array(uris.length).fill(null));

            DeviceCache.startLoadingImages({
                data: uris,
                onImageCached: (uri) => {
                    const index = NHentaiCache.getIndexFromPath(uri);
                    setLoadedImages((currentLoadedImages) => {
                        const images = [...currentLoadedImages];
                        images[index] = uri;
                        console.log(images);
                        return images;
                    });
                },
            });
        };

        loadData();
    }, []);

    const onReloadHandler = (filePath: string) =>
        DeviceCache.redownloadImage(
            filePath,
            imageUris[NHentaiCache.getIndexFromPath(filePath)],
        );

    return (
        <>
            <VirtualList
                data={loadedImages}
                renderer={({ item }) => (
                    <ImageItem item={item} onReload={onReloadHandler} />
                )}
            />

            <CacheScreen />
        </>
    );
};
export default MangaViewer;
