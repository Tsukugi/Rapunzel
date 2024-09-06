import React, { FC, useCallback, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { useRapunzelLoader } from "../api/loader";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import CoupleItem from "../components/paper/item/coupleItem";
import { useRapunzelStore } from "../store/store";
import { useVirtualList } from "../tools/virtualList";
import { useFocusEffect } from "@react-navigation/native";
import { StorageEntries } from "../cache/interfaces";
import { useRapunzelStorage } from "../cache/storage";
import { Book } from "@atsu/lilith";

interface RapunzelLibraryProps extends UsesNavigation {}

const RapunzelLibrary: FC<RapunzelLibraryProps> = ({ navigation }) => {
    const {
        loading: [, useLoadingEffect],
        header: [header],
    } = useRapunzelStore();

    const [libraryTitles, setLibraryTitles] = useState<Book[]>([]);

    useRouter({ route: ViewNames.RapunzelLibrary, navigation });

    useFocusEffect(
        useCallback(() => {
            (async () => {
                const library = await useRapunzelStorage().instance.getMapAsync(
                    StorageEntries.library,
                );
                setLibraryTitles(Object.values(library || {}));
            })();
        }, []),
    );

    const { getVirtualItemProps } = useVirtualList({ navigation });

    const onEndReachedHandler = () => {};

    /**
     * We filter even images so we have half of the elements but each will have both as [odd, even]
     */
    const oddImagesOnly = libraryTitles
        .map((title, index) => {
            return {
                id: `${index}`,
                index,
                value: title,
            } as VirtualItem<Book>;
        })
        .filter((item) => item.index % 2 === 1);

    return (
        <VirtualList
            data={oddImagesOnly}
            renderer={({ index }) => {
                return (
                    <CoupleItem
                        couple={[
                            getVirtualItemProps(libraryTitles[index * 2]),
                            getVirtualItemProps(libraryTitles[index * 2 + 1]),
                        ]}
                    />
                );
            }}
            onEndReached={onEndReachedHandler}
        />
    );
};
export default RapunzelLibrary;
