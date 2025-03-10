import React, { FC } from "react";
import BrowseItem, { BrowserItemProps, StyleProps } from "./browserItem";
import { View } from "react-native";
import { useRapunzelStore } from "../../../store/store";
import { useDebugBorders } from "../../../tools/debugBorder";

type MainFeedItemProps = {
    item: BrowserItemProps | null;
    style?: Partial<StyleProps>;
};

const ItemProvider = ({ item, style }: MainFeedItemProps) => {
    const {
        config: [config],
    } = useRapunzelStore();
    const innerStyle: StyleProps = {
        style: {
            marginVertical: 10,
            marginHorizontal: 5,
            ...style?.style,
            ...useDebugBorders(config.debug),
        },
        coverStyle: {
            ...style?.coverStyle,
        },
        titleStyle: {
            fontSize: 14,
            lineHeight: 16,
            height: 50,
            ...style?.titleStyle,
        },
    };
    return item ? (
        <BrowseItem
            bookmarked={item.bookmarked}
            cover={item.cover}
            bookBase={item.bookBase}
            onClick={item.onClick}
            onLongClick={item.onLongClick}
            style={innerStyle.style}
            coverStyle={innerStyle.coverStyle}
            titleStyle={innerStyle.titleStyle}
        />
    ) : (
        <BrowseItem bookBase={null} />
    );
};

const MainFeedItem: FC<MainFeedItemProps> = ({ item, style }) => {
    return (
        <View>
            <ItemProvider item={item} style={style} />
        </View>
    );
};
export default MainFeedItem;
