import React, { FC, useCallback, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";

import { useRapunzelStore } from "../store/store";

import { useFocusEffect } from "@react-navigation/native";
import { useRapunzelLoader } from "../api/loader";
import { useVirtualListEvents } from "../tools/useVirtualListEvents";
import MainFeedItem from "../components/paper/item/mainFeedItem";
import { RapunzelLog } from "../config/log";
import { TrendingBooksFeed } from "../components/virtualList/TrendingBooksFeed";
import { useDebouncedCallback } from "use-debounce";

interface RapunzelMainFeedProps extends UsesNavigation {}

const RapunzelMainFeed: FC<RapunzelMainFeedProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const [loadedTrendingBookImages, setLoadedTrendingBookImages] = useState<
        VirtualItem<string>[]
    >([]);

    const {
        latest: [latestBooks, useLatestEffect],
        trending: [, useTrendingEffect],
        loading: [loading],
    } = useRapunzelStore();

    const loadMainFeed = () => {
        const { getLatestBooks, getTrendingBooks } = useRapunzelLoader();
        !loading.trending && getTrendingBooks();
        !loading.latest && getLatestBooks();
    };

    useFocusEffect(
        useCallback(() => {
            loadMainFeed();
        }, []),
    );

    useRouter({ route: ViewNames.RapunzelMainFeed, navigation });

    useTrendingEffect((trending) => {
        const images = trending.cachedImages.map(({ id, url }, index) => ({
            id,
            index,
            value: url,
        }));
        RapunzelLog.warn({ trendingBooks: images.map((i) => i.id) });

        setLoadedTrendingBookImages(images);
    });

    useLatestEffect((latest) => {
        const images = latest.cachedImages.map(({ id, url }, index) => ({
            id,
            index,
            value: url,
        }));
        RapunzelLog.warn({ latestBooks: images.map((i) => i.id) });

        setLoadedImages(images);
    });

    const { getVirtualItemProps } = useVirtualListEvents({
        navigation,
        forceAllLanguages: true,
    });

    const debouncedStartReached = useDebouncedCallback(() => {
        //loadMainFeed();
    }, 1000);
    const debouncedEndReached = useDebouncedCallback(() => {
        if (loading.latest) return;

        useRapunzelLoader().getLatestBooks(latestBooks.page + 1, false);
    }, 1000);
    const onStartReachedHandler = () => {
        debouncedStartReached();
    };
    const onEndReachedHandler = () => {
        debouncedEndReached();
    };

    const imagesWithTrending = [
        { id: "Trending", index: 0, value: null },
        ...loadedImages,
    ];

    return (
        <>
            <VirtualList
                data={imagesWithTrending}
                renderer={({ index }) => {
                    if (index === 0) {
                        return (
                            <TrendingBooksFeed
                                virtualItems={loadedTrendingBookImages}
                                getVirtualItemPropsHandler={getVirtualItemProps}
                            />
                        );
                    }

                    const { id } = imagesWithTrending[index];
                    return (
                        <MainFeedItem
                            style={{
                                style: { height: 500 },
                                coverStyle: { height: 500 },
                            }}
                            item={getVirtualItemProps(
                                latestBooks.bookListRecord[id],
                            )}
                        />
                    );
                }}
                onStartReached={onStartReachedHandler}
                onEndReached={onEndReachedHandler}
            />
        </>
    );
};
export default RapunzelMainFeed;
