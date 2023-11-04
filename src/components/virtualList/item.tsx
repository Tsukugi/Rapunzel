import { View, Text } from "react-native";
import { VirtualItem } from "./interfaces";
import { StyleSheet } from "react-native";

type ItemProps = {
    value: string;
};

const Item = ({ value }: ItemProps) => (
    <View style={styles.item}>
        <Text style={styles.value}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
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

export default Item;
