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
                thumbnail={couple[0]?.thumbnail}
                onClick={couple[0]?.onClick}
                style={styles.item}
            />
            <BrowseItem
                cover={couple[1]?.cover}
                thumbnail={couple[1]?.thumbnail}
                onClick={couple[1]?.onClick}
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
