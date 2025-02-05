import React, { FC, useCallback, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import ImageRenderer from "../components/virtualList/imageItem";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";

import { RapunzelImage } from "../store/interfaces";
import { useRapunzelStore } from "../store/store";
import { useFocusEffect } from "@react-navigation/native";

interface RapunzelReaderProps extends UsesNavigation {}

const RapunzelReader: FC<RapunzelReaderProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<
        VirtualItem<RapunzelImage>[]
    >([]);
    const {
        reader: [reader, readerEffect],
    } = useRapunzelStore();

    const updateImages = () => {
        setLoadedImages(reader.cachedImages);
    };

    useRouter({ route: ViewNames.RapunzelReader, navigation });

    useFocusEffect(updateImages);
    readerEffect(({ cachedImages }) => setLoadedImages(cachedImages));

    return (
        <VirtualList
            data={loadedImages}
            onRefresh={async () => updateImages()}
            renderer={({ item }) => (
                <ImageRenderer item={item} onClick={() => {}} />
            )}
        />
    );
};
export default RapunzelReader;
