import React, { FC, useCallback, useEffect, useState } from "react";
import VirtualList from "../components/virtualList/virtualList";
import { VirtualItem } from "../components/virtualList/interfaces";
import { UsesNavigation, ViewNames } from "../components/navigators/interfaces";
import { useRouter } from "../components/navigators/useRouter";

import { useRapunzelStore } from "../store/store";

import { useFocusEffect } from "@react-navigation/native";
import { useRapunzelLoader } from "../api/loader";
import { useVirtualList } from "../tools/virtualList";
import { useAutoFetchWebviewData } from "../process/autoFetchWebviewData";
import { EAutoFetchWebviewStep } from "../store/interfaces";
import MainFeedItem from "../components/paper/item/mainFeedItem";
import { Text } from "react-native-paper";
import { RapunzelLog } from "../config/log";
import { FlatList, View } from "react-native";
import { TrendingBooksFeed } from "../components/virtualList/TrendingBooksFeed";

interface RapunzelMainFeedProps extends UsesNavigation {}

const RapunzelMainFeed: FC<RapunzelMainFeedProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const [loadedTrendingBookImages, setLoadedTrendingBookImages] = useState<
        VirtualItem<string>[]
    >([]);

    const {
        config: [config],
        latest: [latestBooks],
        trending: [trendingBooks],
        autoFetchWebview: [autoFetchWebview],
        loading: [, useLoadingEffect],
    } = useRapunzelStore();

    useEffect(() => {
        const { restartProcess, startProcess } = useAutoFetchWebviewData({
            navigation,
        });

        const loadData = async () => {
            const canStart = await restartProcess(config);
            canStart && startProcess(config);
        };

        loadData();
    }, []);

    useFocusEffect(
        useCallback(() => {
            const isSafeToLoad = [EAutoFetchWebviewStep.Finished].includes(
                autoFetchWebview.step,
            );
            if (isSafeToLoad) {
                useRapunzelLoader().getTrendingBooks();
                useRapunzelLoader().getLatestBooks();
            }
        }, []),
    );

    useRouter({ route: ViewNames.RapunzelMainFeed, navigation });

    useLoadingEffect((isCurrentlyLoading) => {
        !isCurrentlyLoading.trending &&
            (() => {
                const images = trendingBooks.cachedImages.map(
                    ({ id, url }, index) => ({
                        id,
                        index,
                        value: url,
                    }),
                );
                RapunzelLog.warn({ trendingBooks });

                setLoadedTrendingBookImages(images);
            })();
        !isCurrentlyLoading.latest &&
            (() => {
                const images = latestBooks.cachedImages.map(
                    ({ id, url }, index) => ({
                        id,
                        index,
                        value: url,
                    }),
                );
                RapunzelLog.warn({ latestBooks });

                setLoadedImages(images);
            })();
    });

    const { getVirtualItemProps } = useVirtualList({
        navigation,
        forceAllLanguages: true,
    });

    const onEndReachedHandler = () => {
        useRapunzelLoader().getLatestBooks(latestBooks.page + 1, false);
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
                onEndReached={onEndReachedHandler}
            />
        </>
    );
};
export default RapunzelMainFeed;
