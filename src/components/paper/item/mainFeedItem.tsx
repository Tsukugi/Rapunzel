import React, { FC } from "react";
import BrowseItem, { BrowserItemProps } from "./browserItem";
import { View } from "react-native";

type MainFeedItemProps = { item: BrowserItemProps | null };

const ItemProvider = ({ item }: MainFeedItemProps) => {
    const style = {
        height: 500,
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

const MainFeedItem: FC<MainFeedItemProps> = ({ item }) => {
    return (
        <View>
            <ItemProvider item={item} />
        </View>
    );
};
export default MainFeedItem;
