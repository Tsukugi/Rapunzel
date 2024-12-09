import React, { FC, useCallback, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

interface RapunzelBrowseProps extends UsesNavigation {}

const RapunzelBrowse: FC<RapunzelBrowseProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const {
        header: [header],
        loading: [loading],
        browse: [browse, browseEffect],
    } = useRapunzelStore();

    useRouter({ route: ViewNames.RapunzelBrowse, navigation });

    useFocusEffect(
        useCallback(() => {
            setLoadedImages(browse.cachedImages);
        }, []),
    );

    browseEffect(({ cachedImages }) => {
        setLoadedImages(cachedImages);
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
