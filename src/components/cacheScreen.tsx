import React, { useState } from "react";
import { View, Button, StyleSheet, Text } from "react-native";
import { DeviceCache } from "../cache/cache";

const CacheScreen = () => {
    const [size, setSize] = useState(0);
    const onCalculateSizeHandler = () => {
        DeviceCache.calculateCacheSize().then((value) => setSize(value));
    };
    return (
        <View style={styles.container}>
            <Button title="Clear Cache" onPress={DeviceCache.clearCache} />
            <Button
                title="Calculate Cache Size"
                onPress={onCalculateSizeHandler}
            />
            <Text>Cache size: {size}MB</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        maxHeight: 100,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default CacheScreen;
