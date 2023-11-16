import React, { FC, useEffect, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { useRapunzelLoader } from "../api/loader";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import { Thumbnail } from "@atsu/lilith";
import { BrowserItemProps } from "../components/paper/browser/browserItem";
import CoupleItem from "../components/paper/browser/coupleItem";
import { BrowseState } from "../store/interfaces";
import { useRapunzelStore } from "../store/store";

interface RapunzelBrowseProps extends UsesNavigation {}

const RapunzelBrowse: FC<RapunzelBrowseProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const {
        browse: [browse, watchBrowse, unwatchBrowse],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelBrowse });

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

    const onMangaSelectHandler = async (thumbnail: Thumbnail) => {
        useRapunzelLoader().loadBook(thumbnail.id);
        navigation.navigate(ViewNames.RapunzelReader);
    };

    const load = loadedImages.filter((_, index) => index % 2 === 1);
    return (
        <VirtualList<string>
            data={load}
            renderer={({ index }) => {
                const couple: [BrowserItemProps, BrowserItemProps] = [
                    {
                        cover: loadedImages[index * 2].value,
                        thumbnail: browse.bookList[index * 2],
                        onClick: onMangaSelectHandler,
                    },
                    {
                        cover: loadedImages[index * 2 + 1]?.value,
                        thumbnail: browse.bookList[index * 2 + 1],
                        onClick: onMangaSelectHandler,
                    },
                ];
                return <CoupleItem couple={couple} />;
            }}
        />
    );
};
export default RapunzelBrowse;
