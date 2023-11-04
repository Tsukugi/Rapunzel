import React, { FC, useEffect, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { HeaderState, useRapunzelStore } from "../store/store";
import { useRapunzelLoader } from "../api/loader";
import ImageRenderer from "../components/virtualList/imageItem";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";

interface RapunzelBrowseProps extends UsesNavigation {}

const RapunzelBrowse: FC<RapunzelBrowseProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem[]>([]);
    const [cancelReaderLoad, setCancelReaderLoad] = useState<boolean>(false);
    const {
        browse: [browse],
        header: [, watchHeader],
    } = useRapunzelStore();

    const { loadSearch } = useRapunzelLoader((cachedImages) =>
        setLoadedImages(
            cachedImages.map((image, index) => ({
                id: browse.bookList[index].id,
                index,
                value: image,
            })),
        ),
    );

    useEffect(() => {
        const onWatchHeader = async ({ searchValue }: HeaderState) => {
            loadSearch(searchValue);
        };

        watchHeader(onWatchHeader);
        return () => {
            watchHeader(onWatchHeader);
        };
    }, []);

    const onMangaSelectHandler = async (item: VirtualItem) => {
        const code = browse.bookList[item.index].id;

        console.log(code, browse.bookList[item.index].title);
        useRapunzelLoader().loadBook(code);
        navigation.navigate(ViewNames.RapunzelReader);
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
export default RapunzelBrowse;
