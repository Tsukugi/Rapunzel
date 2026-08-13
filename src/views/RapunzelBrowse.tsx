import React, { FC, useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import VirtualList from "../components/virtualList/virtualList";
import { getRapunzelLoader } from "../api/loader";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import CoupleItem from "../components/paper/item/coupleItem";
import { getRapunzelStore } from "../store/store";
import { useVirtualListEvents } from "../tools/useVirtualListEvents";
import { ListUtils } from "../tools/list";
import { RapunzelLog } from "../config/log";
import {
    BrowseFreshnessMs,
    getBrowseCacheKey,
    isFresh,
} from "../cache/listCache";

type RapunzelBrowseProps = UsesNavigation

const RapunzelBrowse: FC<RapunzelBrowseProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const {
        header: [header],
        config: [config],
        loading: [loading],
        browse: [browse, browseEffect],
    } = getRapunzelStore();

    useRouter({ route: ViewNames.RapunzelBrowse, navigation });

    const mapImagesToOrder = useCallback(
        (
            record: Record<string, VirtualItem<string>>,
            order: string[],
        ): VirtualItem<string>[] => {
            return order
                .map((id) => record[id])
                .filter(
                    (item): item is VirtualItem<string> => item !== undefined,
                );
        },
        [],
    );

    useEffect(() => {
        setLoadedImages(
            mapImagesToOrder(browse.cachedImagesRecord, browse.rendered),
        );
    }, [mapImagesToOrder, browse.cachedImagesRecord, browse.rendered]);

    const onBrowseUpdate = useCallback(
        ({ cachedImagesRecord, rendered }: typeof browse) => {
            setLoadedImages(mapImagesToOrder(cachedImagesRecord, rendered));
        },
        [mapImagesToOrder],
    );

    browseEffect(onBrowseUpdate);

    useFocusEffect(
        useCallback(() => {
            if (!header.searchValue) return;
            if (
                browse.cacheKey !==
                getBrowseCacheKey(config.repository, header.searchValue)
            ) {
                return;
            }
            if (
                browse.rendered.length === 0 ||
                !isFresh(browse.lastFetchedAt, BrowseFreshnessMs)
            ) {
                getRapunzelLoader().loadSearch(
                    header.searchValue,
                    { page: 1 },
                    false,
                    true,
                );
            }
        }, [
            browse.cacheKey,
            browse.lastFetchedAt,
            browse.rendered.length,
            config.repository,
            header.searchValue,
        ]),
    );

    const { getVirtualItemProps } = useVirtualListEvents({ navigation });

    const onEndReachedHandler = () => {
        if (loading.browse) {
            RapunzelLog.log(
                "[onEndReachedHandler] Loading is still on progress, ignoring",
            );
            return;
        }
        if (browse.hasNextPage === false) return;
        getRapunzelLoader().loadSearch(
            header.searchValue,
            {
                page: browse.page + 1,
            },
            false,
        );
    };

    return (
        <VirtualList
            data={ListUtils.getVirtualItemHalf(loadedImages)}
            contentOffset={{ x: 0, y: browse.scrollOffset || 0 }}
            onScrollPositionChange={(offset) => {
                browse.scrollOffset = offset;
            }}
            renderer={({ index }) => {
                const [leftBook, rightBook] = [
                    browse.bookListRecord[loadedImages[index * 2]?.id],
                    browse.bookListRecord[loadedImages[index * 2 + 1]?.id],
                ];
                return (
                    <CoupleItem
                        couple={[
                            getVirtualItemProps(leftBook),
                            getVirtualItemProps(rightBook),
                        ]}
                    />
                );
            }}
            onEndReached={onEndReachedHandler}
        />
    );
};
export default RapunzelBrowse;
