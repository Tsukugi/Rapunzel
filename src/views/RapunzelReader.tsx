import React, { FC, useEffect, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import ImageRenderer from "../components/virtualList/imageItem";
import { VirtualItem } from "../components/virtualList/interfaces";
import { ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";

import { DeviceCache } from "../cache/cache";
import { RapunzelImage } from "../store/interfaces";
import { useRapunzelStore } from "../store/store";

interface RapunzelReaderProps {}

// TODO: Add heights from backend to support full image dynamically
const RapunzelReader: FC<RapunzelReaderProps> = ({}) => {
    const [loadedImages, setLoadedImages] = useState<
        VirtualItem<RapunzelImage>[]
    >([]);
    const {
        reader: [, readerEffect],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelReader });

    readerEffect(({ cachedImages }) => {
        setLoadedImages(
            cachedImages.map((image, index) => ({
                id: `${index + 1}`,
                index,
                value: image,
            })),
        );
    });

    return (
        <VirtualList
            data={loadedImages}
            renderer={({ item }) => (
                <ImageRenderer item={item} onClick={() => {}} />
            )}
        />
    );
};
export default RapunzelReader;
