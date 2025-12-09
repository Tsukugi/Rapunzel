import React, { FC, useCallback, useEffect, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { useRapunzelLoader } from "../api/loader";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";
import CoupleItem from "../components/paper/item/coupleItem";
import { useRapunzelStore } from "../store/store";
import { useVirtualListEvents } from "../tools/useVirtualListEvents";
import { ListUtils } from "../tools/list";
import { RapunzelLog } from "../config/log";

interface RapunzelBrowseProps extends UsesNavigation {}

const RapunzelBrowse: FC<RapunzelBrowseProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const {
        header: [header],
        loading: [loading],
        browse: [browse, browseEffect],
    } = useRapunzelStore();

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

    browseEffect(({ cachedImagesRecord, rendered }) => {
        setLoadedImages(mapImagesToOrder(cachedImagesRecord, rendered));
    });

    const { getVirtualItemProps } = useVirtualListEvents({ navigation });

    const onEndReachedHandler = () => {
        if (loading.browse) {
            RapunzelLog.log(
                "[onEndReachedHandler] Loading is still on progress, ignoring",
            );
            return;
        }
        useRapunzelLoader().loadSearch(
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
