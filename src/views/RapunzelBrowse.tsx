import React, { FC, useEffect, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { BrowseState, useRapunzelStore } from "../store/store";
import { useRapunzelLoader } from "../api/loader";
import ImageRenderer from "../components/virtualList/imageItem";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";

interface RapunzelBrowseProps extends UsesNavigation {}

const RapunzelBrowse: FC<RapunzelBrowseProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem[]>([]);
    const {
        browse: [browse, watchBrowse, unwatchBrowse],
    } = useRapunzelStore();

    useEffect(() => {
        const onWatchBrowse = async ({ cachedImages }: BrowseState) => {
            setLoadedImages(
                cachedImages.map((image, index) => ({
                    id: browse.bookList[index].id,
                    index,
                    value: image,
                })),
            );
        };

        watchBrowse(onWatchBrowse);
        return () => {
            unwatchBrowse(onWatchBrowse);
        };
    }, []);

    const onMangaSelectHandler = async (item: VirtualItem) => {
        const code = browse.bookList[item.index].id;

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
