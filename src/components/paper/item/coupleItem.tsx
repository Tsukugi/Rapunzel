import React, { FC } from "react";
import BrowseItem, { BrowserItemProps } from "./browserItem";
import { Dimensions, StyleSheet, View } from "react-native";

interface CoupleItemProps {
    couple: [BrowserItemProps | null, BrowserItemProps | null];
}

const ItemProvider = ({ item }: { item: BrowserItemProps | null }) => {
    return item ? (
        <BrowseItem
            cover={item.cover}
            bookBase={item.bookBase}
            onClick={item.onClick}
            onLongClick={item.onLongClick}
            style={styles.item}
        />
    ) : (
        <BrowseItem bookBase={null} />
    );
};

const CoupleItem: FC<CoupleItemProps> = ({ couple }) => {
    return (
        <View style={styles.container}>
            <ItemProvider item={couple[0]} />
            <ItemProvider item={couple[1]} />
        </View>
    );
};

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
    container: {
        display: "flex",
        width,
        flexDirection: "row",
        justifyContent: "center",
    },

    item: {
        borderRadius: 30,
        width: width / 2 - 30,
    },
});

export default CoupleItem;
