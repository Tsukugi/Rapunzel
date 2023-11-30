import React, { FC, useCallback, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { VirtualItem } from "../components/virtualList/interfaces";
import { ViewNames } from "../components/navigators/interfaces";
import {
    useRouter,
} from "../components/navigators/useRouter";

import { useRapunzelStore } from "../store/store";

import { useFocusEffect } from "@react-navigation/native";
import { useRapunzelLoader } from "../api/loader";
import { RapunzelLog } from "../config/log";
import BrowseItem, {
    BrowserItemProps,
} from "../components/paper/browser/browserItem";
import { useVirtualList } from "../tools/virtualList";

interface RapunzelMainFeedProps {}

const RapunzelMainFeed: FC<RapunzelMainFeedProps> = ({}) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const {
        latest: [latestBooks],
        loading: [, useLoadingEffect],
    } = useRapunzelStore();

    useFocusEffect(
        useCallback(() => {
            useRapunzelLoader().getLatestBooks();
        }, []),
    );

    useRouter({ route: ViewNames.RapunzelMainFeed });

    useLoadingEffect(({ latest }) => {
        if (latest) return;

        RapunzelLog.log(latestBooks.cachedImages.length);
        setLoadedImages(
            latestBooks.cachedImages.map((image, index) => ({
                id: latestBooks.bookList[index].id,
                index,
                value: image,
            })),
        );
    });

    const { getVirtualItemProps } = useVirtualList();

    const onEndReachedHandler = () => {
        const {
            latest: [latestBooks],
        } = useRapunzelStore();
        useRapunzelLoader().getLatestBooks(latestBooks.page + 1, false);
    };

    const ItemProvider = ({ item }: { item: BrowserItemProps | null }) => {
        const style = {
            height: 600,
        };
        return item ? (
            <BrowseItem
                cover={item.cover}
                bookBase={item.bookBase}
                onClick={item.onClick}
                onLongClick={item.onLongClick}
                style={style}
                coverStyle={{ ...style, marginTop: 5 }}
                titleStyle={{ fontSize: 16, lineHeight: 20, height: 70 }}
            />
        ) : (
            <BrowseItem bookBase={null} />
        );
    };

    return (
        <VirtualList
            data={loadedImages}
            renderer={({ index }) => (
                <ItemProvider item={getVirtualItemProps(index, loadedImages)} />
            )}
            onEndReached={onEndReachedHandler}
        />
    );
};
export default RapunzelMainFeed;
