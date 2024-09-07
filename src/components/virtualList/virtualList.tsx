import React, { PropsWithChildren } from "react";
import { VirtualizedList, StyleSheet, ListRenderItem } from "react-native";
import { VirtualItem } from "./interfaces";
import Item from "./item";
import { LocalTheme } from "../../../themes";
import { RapunzelLog } from "../../config/log";
import { useDebugBorders } from "../../tools/debugBorder";
import { useRapunzelStore } from "../../store/store";

interface VirtualListProps<T> extends PropsWithChildren {
    data: VirtualItem<T>[];
    style?: Record<string, any>;
    renderer?: ListRenderItem<VirtualItem<T>>;
    getItem?: (data: VirtualItem<T>[], index: number) => VirtualItem<T>;
    onEndReached?: () => void;
    onStartReached?: () => void;
}

const VirtualList = <T,>({
    data,
    style,
    renderer = ({ item }) => <Item value={item.value as string} />,
    getItem = (_data, index) => _data[index],
    onEndReached = () => {
        RapunzelLog.log("[onEndReached]: Reached");
    },
    onStartReached = () => {
        RapunzelLog.log("[onStartReached]: Reached");
    },
}: VirtualListProps<T>) => {
    const {
        config: [config],
    } = useRapunzelStore();

    const { colors } = LocalTheme.useTheme();

    return (
        <VirtualizedList
            style={{
                ...styles.container,
                ...style,
                ...useDebugBorders(config.debug),
            }}
            data={data}
            initialNumToRender={3}
            maxToRenderPerBatch={6}
            windowSize={6}
            endFillColor={colors.backdrop}
            renderItem={renderer}
            keyExtractor={(_, index) => index.toString()}
            getItemCount={(_data) => _data.length}
            getItem={getItem}
            onStartReached={onStartReached}
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
