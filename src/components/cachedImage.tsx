import React, { useEffect } from "react";
import { View, Image, StyleSheet, ImageProps, Dimensions } from "react-native";
import RNFS from "react-native-fs";

interface CachedImageProps extends ImageProps {
    source: { uri: string };
    onImageCached: (uri: string) => void;
    cachedImageName?: string;
}
const CachedImage: React.FC<CachedImageProps> = ({
    onImageCached,
    source,
    cachedImageName = `${Math.random().toString(12).substring(0)}.jpg`,
    ...props
}) => {
    const getFileName = () => {
        return "file://" + RNFS.DocumentDirectoryPath + "/" + cachedImageName;
    };

    useEffect(() => {
        const downloadAndCacheImage = async () => {
            const localImagePath = `${RNFS.DocumentDirectoryPath}/${cachedImageName}`;

            const exists = await RNFS.exists(localImagePath);

            if (!exists) {
                try {
                    const request = RNFS.downloadFile({
                        fromUrl: source.uri,
                        toFile: localImagePath,
                    });

                    await request.promise;

                    console.log(getFileName());
                } catch (error) {
                    console.error("Error downloading image:", error);
                }
            }
            onImageCached(getFileName());
        };

        downloadAndCacheImage();
    }, []);

    return (
        <View style={styles.container}>
            <Image
                {...props}
                style={styles.image}
                source={{
                    uri: getFileName(),
                }}
            />
        </View>
    );
};

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: width - 50,
        height: 500,
        alignSelf: "center",
    },
});

export default CachedImage;
