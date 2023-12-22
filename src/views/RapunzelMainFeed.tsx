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

interface RapunzelMainFeedProps extends UsesNavigation {}

const RapunzelMainFeed: FC<RapunzelMainFeedProps> = ({ navigation }) => {
    const [loadedImages, setLoadedImages] = useState<VirtualItem<string>[]>([]);
    const {
        config: [config],
        latest: [latestBooks],
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
                useRapunzelLoader().getLatestBooks();
            }
        }, []),
    );

    useRouter({ route: ViewNames.RapunzelMainFeed, navigation });

    useLoadingEffect(() => {
        setLoadedImages(
            latestBooks.cachedImages.map(({ id, url }, index) => ({
                id,
                index,
                value: url,
            })),
        );
    });

    const { getVirtualItemProps } = useVirtualList({
        navigation,
        forceAllLanguages: true,
    });

    const onEndReachedHandler = () => {
        useRapunzelLoader().getLatestBooks(latestBooks.page + 1, false);
    };

    return (
        <VirtualList
            data={loadedImages}
            renderer={({ index }) => {
                const { id } = loadedImages[index];
                return (
                    <MainFeedItem
                        item={getVirtualItemProps(
                            latestBooks.bookListRecord[id],
                        )}
                    />
                );
            }}
            onEndReached={onEndReachedHandler}
        />
    );
};
export default RapunzelMainFeed;
