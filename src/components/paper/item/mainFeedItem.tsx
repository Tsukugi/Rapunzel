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
            ...style?.style,
            ...useDebugBorders(config.debug),
        },
        coverStyle: { marginTop: 5, ...style?.coverStyle },
        titleStyle: {
            fontSize: 16,
            lineHeight: 20,
            height: 70,
            ...style?.titleStyle,
        },
    };
    return item ? (
        <BrowseItem
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
