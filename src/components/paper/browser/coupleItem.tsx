import React, { FC } from "react";
import BrowseItem, { BrowserItemProps } from "./browserItem";
import { Dimensions, StyleSheet, View } from "react-native";

interface CoupleItemProps {
    couple: [BrowserItemProps, BrowserItemProps];
}

const CoupleItem: FC<CoupleItemProps> = ({ couple }) => {
    return (
        <View style={styles.container}>
            <BrowseItem
                cover={couple[0]?.cover}
                bookBase={couple[0]?.bookBase}
                onClick={couple[0]?.onClick}
                onLongClick={couple[0]?.onLongClick}
                style={styles.item}
            />
            <BrowseItem
                cover={couple[1]?.cover}
                bookBase={couple[1]?.bookBase}
                onClick={couple[1]?.onClick}
                onLongClick={couple[1]?.onLongClick}
                style={styles.item}
            />
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
