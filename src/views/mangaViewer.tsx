import React, { FC, useEffect, useState } from "react";
import {
    View,
    Dimensions,
    StyleSheet,
    SafeAreaView,
    FlatList,
} from "react-native";
import Content from "../components/scrollContent";
import Section from "../components/section";
import { NHentai } from "../../api/nhentai";
import DebugBorder from "../components/debugBorder";
import VirtualList from "../components/virtualList";
import CachedImage from "../components/cachedImage";
import CachedImagesList from "../components/cachedImageList";
import { NHentaiCache } from "../../cache/nhentai";
import ClearCacheScreen from "../components/clearCacheScreen";

interface MangaViewerProps {
    // Define your component props here
}

const MangaViewer: FC<MangaViewerProps> = ({}) => {
    const [imageUris, setImageUris] = useState<string[]>([]);
    const [imagesToLoad, setImagesToLoad] = useState<string[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    console.log(
        "refresh!",
        imagesToLoad.length,
        `Page ${currentIndex + 1} of ${imageUris.length}`,
    );

    useEffect(() => {
        NHentai.searchFirstMatch("ass").then((uris) => {
            setImageUris(uris);
            setImagesToLoad([uris[0]]);
        });
    }, []);

    const handleImageLoadStart = () => {
        console.log(
            `Loading started for page ${currentIndex + 1} of ${
                imageUris.length
            }`,
        );
    };
    const handleImageLoad = async () => {
        try {
            // Load the next image if there are more images
            if (currentIndex >= imageUris.length - 1) {
                return console.log(
                    `Finished loading ${imagesToLoad.length} of ${imageUris.length} entries.`,
                );
            }

            // await new Promise<void>((res) => setTimeout(() => res(), 1000));

            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            const images = [...imagesToLoad];
            images[nextIndex] = imageUris[nextIndex];
            setImagesToLoad(images);

            console.log("Finished loading image:", nextIndex);
        } catch (error) {
            console.error("Error loading image:", error);
        }
    };
    return (
        <VirtualList
            data={imagesToLoad}
            renderer={({ item }) => (
                <DebugBorder debugInfo={+item.id + 1}>
                    {imagesToLoad[+item.id] ? (
                        <CachedImage
                            style={[
                                {
                                    opacity:
                                        +item.id === currentIndex ? 0.5 : 1,
                                },
                            ]}
                            resizeMode="contain"
                            onLoadStart={handleImageLoadStart}
                            source={{ uri: imagesToLoad[+item.id] }}
                            cachedImageName={NHentaiCache.getFileName(
                                imagesToLoad[+item.id],
                            )}
                            onImageCached={handleImageLoad}
                        />
                    ) : (
                        // Placeholder or loading indicator while the image is being fetched
                        <View style={styles.placeholder} />
                    )}
                </DebugBorder>
            )}
        ></VirtualList>
        //<CachedImagesList></CachedImagesList>
        // <View>
        //
        //     <Section title="Clear Caches">
        //         <ClearCacheScreen></ClearCacheScreen>
        //     </Section>
        //     <Section title="Virtual">
        //
        //     </Section>
        // </View>
    );
};

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    placeholder: {
        width: width - 50,
        height: 500,
        backgroundColor: "#555",
        opacity: 0.5,
    },
});

export default MangaViewer;
