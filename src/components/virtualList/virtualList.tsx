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
import Item, { getVirtualItem } from "./item";

interface VirtualListProps extends PropsWithChildren {
    data: string[];
    renderer?: ListRenderItem<VirtualItem>;
    getItem?: () => VirtualItem;
}

const VirtualList: React.FC<VirtualListProps> = ({
    data,
    renderer = ({ item }) => <Item value={item.value} />,
    getItem = getVirtualItem,
}) => {
    return (
        <SafeAreaView style={styles.container}>
            <VirtualizedList
                data={data}
                initialNumToRender={1}
                maxToRenderPerBatch={3}
                windowSize={6}
                renderItem={renderer}
                keyExtractor={(item) => item.id}
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
