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
    title: string;
};

type ItemProps = {
    title: string;
};

const Item = ({ title }: ItemProps) => (
    <View style={styles.item}>
        <Text style={styles.title}>{title}</Text>
    </View>
);

interface VirtualListProps extends PropsWithChildren {
    renderer?: ListRenderItem<ItemData> | null | undefined;
    getItemCount: (_data: unknown) => number;
    getItem: (_data: unknown, index: number) => ItemData;
}

const VirtualList: React.FC<VirtualListProps> = ({
    renderer = ({ item }) => <Item title={item.title} />,
    getItemCount,
    getItem = (_data: unknown, index: number): ItemData => ({
        id: Math.random().toString(12).substring(0),
        title: `Item ${index + 1}`,
    }),
}) => {
    return (
        <SafeAreaView style={styles.container}>
            <VirtualizedList
                initialNumToRender={10}
                renderItem={renderer}
                keyExtractor={(item) => item.id}
                getItemCount={getItemCount}
                getItem={getItem}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: StatusBar.currentHeight,
    },
    item: {
        backgroundColor: "#f9c2ff",
        height: 150,
        justifyContent: "center",
        marginVertical: 8,
        marginHorizontal: 16,
        padding: 20,
    },
    title: {
        fontSize: 32,
    },
});

export default VirtualList;
