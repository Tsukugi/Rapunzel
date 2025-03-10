import React, { FC, useCallback, useEffect, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";

import { useRapunzelStore } from "../store/store";

import { useFocusEffect } from "@react-navigation/native";
import { useRapunzelLoader } from "../api/loader";
import { useVirtualListEvents } from "../tools/useVirtualListEvents";
import MainFeedItem from "../components/paper/item/mainFeedItem";
import { TrendingBooksFeed } from "../components/virtualList/TrendingBooksFeed";
import { useDebouncedCallback } from "use-debounce";
import { RapunzelLog } from "../config/log";

interface RapunzelMainFeedProps extends UsesNavigation {}

const RapunzelMainFeed: FC<RapunzelMainFeedProps> = ({ navigation }) => {
    const [latestBooksImages, setLatestBooksImages] = useState<
        VirtualItem<string>[]
    >([]);
    const [loadedTrendingBookImages, setLoadedTrendingBookImages] = useState<
        VirtualItem<string>[]
    >([]);

    const {
        latest: [latestBooks, useLatestBooksEffect],
        trending: [trendingBooks, useTrendingBooksEffect],
        loading: [loading],
    } = useRapunzelStore();

    const loadMainFeed = async (clean: boolean) => {
        const { getLatestBooks, getTrendingBooks } = useRapunzelLoader();
        const trending = getTrendingBooks();
        const latest = getLatestBooks(latestBooks.page, clean);

        await Promise.all([trending, latest]);
    };

    useEffect(() => {
        loadMainFeed(true);
    }, []);

    useFocusEffect(
        useCallback(() => {
            setLoadedTrendingBookImages(trendingBooks.cachedImages);
            setLatestBooksImages(latestBooks.cachedImages);
            loadMainFeed(latestBooks.cachedImages.length === 0);
        }, []),
    );

    useRouter({ route: ViewNames.RapunzelMainFeed, navigation });

    useTrendingBooksEffect(({ cachedImages }) => {
        setLoadedTrendingBookImages(cachedImages);
    });

    useLatestBooksEffect(({ cachedImages }) => {
        const list = imagesWithTrending(cachedImages);
        setLatestBooksImages(list);
    });

    const { getVirtualItemProps } = useVirtualListEvents({
        navigation,
        forceAllLanguages: true,
    });

    const debouncedStartReached = useDebouncedCallback(() => {
        //loadMainFeed();
    }, 1000);
    const debouncedEndReached = useDebouncedCallback(() => {
        if (loading.latest) {
            RapunzelLog.log(
                "[onEndReachedHandler] Loading is still on progress, ignoring",
            );
            return;
        }

        useRapunzelLoader().getLatestBooks(latestBooks.page + 1, false);
    }, 1000);
    const onStartReachedHandler = () => {
        debouncedStartReached();
    };
    const onEndReachedHandler = () => {
        debouncedEndReached();
    };

    const imagesWithTrending = (
        images: VirtualItem<string>[],
    ): VirtualItem<string>[] => {
        if (images.length === 0 || images[0].id !== "Trending") {
            images.unshift({
                id: "Trending",
                index: 0,
                value: "Trending",
            });
        }
        return images;
    };

    return (
        <VirtualList
            data={latestBooksImages}
            renderer={({ index }) => {
                if (index === 0) {
                    return loadedTrendingBookImages.length > 0 ? (
                        <TrendingBooksFeed
                            virtualItems={loadedTrendingBookImages}
                            getVirtualItemPropsHandler={getVirtualItemProps}
                        />
                    ) : null;
                }

                const { id } = latestBooksImages[index];
                return (
                    <MainFeedItem
                        style={{
                            style: { height: 350 },
                            coverStyle: { height: 350 },
                        }}
                        item={getVirtualItemProps(
                            latestBooks.bookListRecord[id],
                        )}
                    />
                );
            }}
            onRefresh={async () => await loadMainFeed(true)}
            onStartReached={onStartReachedHandler}
            onEndReached={onEndReachedHandler}
        />
    );
};
export default RapunzelMainFeed;
