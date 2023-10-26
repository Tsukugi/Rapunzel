import React, { useEffect, useState } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import RNFS from "react-native-fs";

interface CachedImagesListProps {}

const CachedImagesList: React.FC<CachedImagesListProps> = () => {
    const [cachedImages, setCachedImages] = useState<string[]>([]);

    useEffect(() => {
        const listCachedImages = async () => {
            try {
                const files = await RNFS.readDir(RNFS.DocumentDirectoryPath);

                // Filter files that have image extensions (adjust this according to your use case)
                const imageFiles = files.filter((file) =>
                    /\.(jpg|jpeg|png|gif)$/i.test(file.name),
                );

                // Extract URIs for image files
                const imageUris = imageFiles.map(
                    (file) => "file://" + file.path,
                );

                setCachedImages(imageUris);
            } catch (error) {
                console.error("Error reading cached images:", error);
            }
        };

        listCachedImages();
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
