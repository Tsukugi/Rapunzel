import React, { PropsWithChildren } from "react";
import {
    SafeAreaView,
    View,
    VirtualizedList,
    StyleSheet,
    Text,
    ListRenderItem,
} from "react-native";
import { VirtualItem } from "./interfaces";
import Item from "./item";

interface VirtualListProps extends PropsWithChildren {
    data: VirtualItem[];
    renderer?: ListRenderItem<VirtualItem>;
    getItem?: (data: any, index: number) => VirtualItem;
}

const VirtualList: React.FC<VirtualListProps> = ({
    data,
    renderer = ({ item }) => <Item value={item.value} />,
    getItem = (_, index) => data[index],
}) => {
    return (
        <SafeAreaView style={styles.container}>
            <VirtualizedList
                data={data.map((data) => data.value)}
                initialNumToRender={1}
                maxToRenderPerBatch={3}
                windowSize={6}
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
