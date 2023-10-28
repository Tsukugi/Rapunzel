import React, { PropsWithChildren } from "react";
import {
    SafeAreaView,
    View,
    VirtualizedList,
    StyleSheet,
    Text,
    StatusBar,
    ListRenderItem,
} from "react-native";

type ItemData = {
    id: string;
    value: string;
};

type ItemProps = {
    value: string;
};

const Item = ({ value }: ItemProps) => (
    <View style={styles.item}>
        <Text style={styles.value}>{value}</Text>
    </View>
);

const getItem = (data: string[], index: number): ItemData => {
    return {
        id: `${index}`,
        value: data[index],
    };
};

interface VirtualListProps extends PropsWithChildren {
    data: string[];
    renderer?: ListRenderItem<ItemData> | null | undefined;
}

const VirtualList: React.FC<VirtualListProps> = ({
    data,
    renderer = ({ item }) => <Item value={item.value} />,
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
    item: {
        backgroundColor: "#f9c2ff",
        height: 550,
        justifyContent: "center",
        marginVertical: 8,
        marginHorizontal: 8,
        padding: 10,
    },
    value: {
        fontSize: 32,
    },
});

export default VirtualList;
