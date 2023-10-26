import React from "react";
import { View, Button, StyleSheet } from "react-native";
import RNFS from "react-native-fs";

const ClearCacheScreen = () => {
    const clearCache = async () => {
        try {
            const cacheDirectory = `${RNFS.DocumentDirectoryPath}`;
            const files = await RNFS.readDir(cacheDirectory);

            // Iterate through the files and remove them
            for (const file of files) {
                await RNFS.unlink(file.path);
            }

            console.log("Cache cleared successfully.");
        } catch (error) {
            console.error("Error clearing cache:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Button title="Clear Cache" onPress={clearCache} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
});

export default ClearCacheScreen;
