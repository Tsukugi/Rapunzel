import React from "react";
import { FlatList } from "react-native";
import MainFeedItem from "../paper/item/mainFeedItem";
import { VirtualItem } from "./interfaces";
import { BookBase } from "@atsu/lilith";
import { BrowserItemProps } from "../paper/item/browserItem";
import { useRapunzelStore } from "../../store/store";

export interface TrendingBooksFeedProps {
    virtualItems: VirtualItem<string>[];
    getVirtualItemPropsHandler: (
        bookBase: BookBase | null,
    ) => BrowserItemProps | null;
}

export const TrendingBooksFeed = ({
    virtualItems,
    getVirtualItemPropsHandler,
}: TrendingBooksFeedProps) => {
    const {
        trending: [trendingBooks],
    } = useRapunzelStore();

    return (
        <FlatList
            horizontal={true}
            style={{ minHeight: 300, maxHeight: 300, marginBottom: 5 }}
            data={virtualItems}
            renderItem={({ index }) => {
                const { id } = virtualItems[index];
                return (
                    <MainFeedItem
                        style={{
                            style: { width: 150 },
                            coverStyle: { width: 150 },
                        }}
                        item={getVirtualItemPropsHandler(
                            trendingBooks.bookListRecord[id],
                        )}
                    />
                );
            }}
        />
    );
};
