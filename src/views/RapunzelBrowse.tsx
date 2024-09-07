import React, { FC, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { useRapunzelLoader } from "../api/loader";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import CoupleItem from "../components/paper/item/coupleItem";
import { useRapunzelStore } from "../store/store";
import { useVirtualListEvents } from "../tools/useVirtualListEvents";

interface RapunzelBrowseProps extends UsesNavigation {}

const RapunzelBrowse: FC<RapunzelBrowseProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const {
        loading: [, useLoadingEffect],
        header: [header],
        browse: [browseState],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelBrowse, navigation });

    useLoadingEffect(() => {
        setLoadedImages(
            browseState.cachedImages.map(({ id, url }, index) => ({
                id,
                index,
                value: url,
            })),
        );
    });

    const { getVirtualItemProps } = useVirtualListEvents({ navigation });

    const onEndReachedHandler = () => {
        useRapunzelLoader().loadSearch(
            header.searchValue,
            {
                page: browseState.page + 1,
            },
            false,
        );
    };

    /**
     * We filter even images so we have half of the elements but each will have both as [odd, even]
     */
    const oddImagesOnly = loadedImages.filter((item) => item.index % 2 === 1);

    return (
        <VirtualList
            data={oddImagesOnly}
            renderer={({ index }) => {
                const [leftId, rightId] = [
                    loadedImages[index * 2].id,
                    loadedImages[index * 2 + 1].id,
                ];
                return (
                    <CoupleItem
                        couple={[
                            getVirtualItemProps(
                                browseState.bookListRecord[leftId],
                            ),
                            getVirtualItemProps(
                                browseState.bookListRecord[rightId],
                            ),
                        ]}
                    />
                );
            }}
            onEndReached={onEndReachedHandler}
        />
    );
};
export default RapunzelBrowse;
