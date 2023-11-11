import React, { PropsWithChildren } from "react";
import {
    SafeAreaView,
    VirtualizedList,
    StyleSheet,
    ListRenderItem,
} from "react-native";
import { VirtualItem } from "./interfaces";
import Item from "./item";
import { useTheme } from "react-native-paper";

interface VirtualListProps<T> extends PropsWithChildren {
    data: VirtualItem<T>[];
    renderer?: ListRenderItem<VirtualItem<T>>;
    getItem?: (data: T, index: number) => VirtualItem<T>;
}

const VirtualList = <T,>({
    data,
    renderer = ({ item }) => <Item value={item.value as string} />,
    getItem = (_, index) => data[index],
}: VirtualListProps<T>) => {
    const { colors } = useTheme();
    return (
        <SafeAreaView style={styles.container}>
            <VirtualizedList
                data={data}
                initialNumToRender={1}
                maxToRenderPerBatch={3}
                windowSize={6}
                endFillColor={colors.backdrop}
                renderItem={renderer}
                keyExtractor={(_, index) => index.toString()}
                getItemCount={(_data) => _data.length}
                getItem={getItem}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default VirtualList;
