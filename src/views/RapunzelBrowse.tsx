import React, { FC, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { useRapunzelLoader } from "../api/loader";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import { BrowserItemProps } from "../components/paper/browser/browserItem";
import CoupleItem from "../components/paper/browser/coupleItem";
import { useRapunzelStore } from "../store/store";
import { useVirtualList } from "../tools/virtualList";

interface RapunzelBrowseProps extends UsesNavigation {}

const RapunzelBrowse: FC<RapunzelBrowseProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const {
        loading: [, useLoadingEffect],
        header: [header],
        browse: [browseState],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelBrowse });

    useLoadingEffect(({ browse }) => {
        if (browse) return;

        setLoadedImages(
            browseState.cachedImages.map((image, index) => ({
                id: browseState.bookList[index].id,
                index,
                value: image,
            })),
        );
    });

    const { getVirtualItemProps } = useVirtualList();

    const onEndReachedHandler = () => {
        useRapunzelLoader().loadSearch(
            header.searchValue,
            {
                page: browseState.page + 1,
            },
            false,
        );
    };

    const feedCouple = (index: number): BrowserItemProps | null =>
        getVirtualItemProps(index, loadedImages);

    /**
     * We filter even images so we have half of the elements but each will have both as [odd, even]
     */
    const oddImagesOnly = loadedImages.filter((_, index) => index % 2 === 1);
    return (
        <VirtualList
            data={oddImagesOnly}
            renderer={({ index }) => (
                <CoupleItem
                    couple={[feedCouple(index * 2), feedCouple(index * 2 + 1)]}
                />
            )}
            onEndReached={onEndReachedHandler}
        />
    );
};
export default RapunzelBrowse;
