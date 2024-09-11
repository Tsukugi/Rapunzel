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
        reader: [, readerEffect],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelReader, navigation });

    readerEffect(({ cachedImages }) => setLoadedImages(cachedImages));

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
