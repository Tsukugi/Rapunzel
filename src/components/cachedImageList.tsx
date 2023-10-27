import React, { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { DeviceCache } from "../cache/cache";

interface CachedImagesListProps {}

const CachedImagesList: React.FC<CachedImagesListProps> = () => {
    const [cachedImages, setCachedImages] = useState<string[]>([]);

    useEffect(() => {
        DeviceCache.listCachedImages().then(setCachedImages);
    }, []);

    return (
        <View style={styles.container}>
            <FlatList
                data={cachedImages.map((imagePath) => {
                    const parts = imagePath.split("/");
                    const fileName = parts[parts.length - 1]; // Extract "1.jpg"
                    return `${fileName}`;
                })}
                renderItem={({ item }) => (
                    <Text style={styles.text}>{item}</Text>
                )}
                keyExtractor={(item, index) => index.toString()}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 16,
        marginVertical: 5,
    },
});

export default CachedImagesList;
