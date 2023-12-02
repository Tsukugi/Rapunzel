import React, { PropsWithChildren } from "react";
import { VirtualizedList, StyleSheet, ListRenderItem } from "react-native";
import { VirtualItem } from "./interfaces";
import Item from "./item";
import { LocalTheme } from "../../../themes";
import { RapunzelLog } from "../../config/log";

interface VirtualListProps<T> extends PropsWithChildren {
    data: VirtualItem<T>[];
    renderer?: ListRenderItem<VirtualItem<T>>;
    getItem?: (data: VirtualItem<T>[], index: number) => VirtualItem<T>;
    onEndReached?: () => void;
}

const VirtualList = <T,>({
    data,
    renderer = ({ item }) => <Item value={item.value as string} />,
    getItem = (_data, index) => _data[index],
    onEndReached = () => {
        RapunzelLog.log("[onEndReached]: Reached");
    },
}: VirtualListProps<T>) => {
    const { colors } = LocalTheme.useTheme();
    return (
        <VirtualizedList
            style={styles.container}
            data={data}
            initialNumToRender={1}
            maxToRenderPerBatch={3}
            windowSize={6}
            endFillColor={colors.backdrop}
            renderItem={renderer}
            keyExtractor={(_, index) => index.toString()}
            getItemCount={(_data) => _data.length}
            getItem={getItem}
            onEndReached={onEndReached}
            onEndReachedThreshold={200}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default VirtualList;
