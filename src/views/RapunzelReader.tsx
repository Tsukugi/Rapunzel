import React, { FC, useEffect, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import ImageRenderer from "../components/virtualList/imageItem";
import { VirtualItem } from "../components/virtualList/interfaces";
import { ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import { ReaderState, useRapunzelStore } from "../store/store";

import { DeviceCache } from "../cache/cache";
interface RapunzelReaderProps {}

// TODO: Add heights from backend to support full image dynamically
const RapunzelReader: FC<RapunzelReaderProps> = ({}) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem[]>([]);
    const {
        reader: [reader, watchReader, unwatchReader],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelReader });

    useEffect(() => {
        const onWatchReader = async ({ cachedImages }: ReaderState) => {
            setLoadedImages(
                cachedImages.map((image, index) => ({
                    id: `${index + 1}`,
                    index,
                    value: image,
                })),
            );
        };
        watchReader(onWatchReader);

        return () => {
            unwatchReader(onWatchReader);
        };
    }, []);

    const onReloadHandler = (item: VirtualItem) => {
        const newUri = reader.book?.chapters[0].pages[item.index].uri;
        if (!newUri) return;
        DeviceCache.redownloadImage(item.value, newUri, () => {});
    };

    return (
        <VirtualList
            data={loadedImages}
            renderer={({ item }) => (
                <ImageRenderer item={item} onClick={onReloadHandler} />
            )}
        />
    );
};
export default RapunzelReader;
