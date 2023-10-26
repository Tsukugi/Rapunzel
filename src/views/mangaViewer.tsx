import React, { FC, useEffect, useState } from "react";
import { View, Image, Dimensions, StyleSheet } from "react-native";
import Content from "../components/content";
import Section from "../components/section";
import { NHentai } from "../../api/nhentai";
import DebugBorder from "../components/debugBorder";
import VirtualList from "../components/virtualList";

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
            await new Promise<void>((res) => setTimeout(() => res(), 1000));
            // Load the next image if there are more images
            if (currentIndex >= imageUris.length - 1)
                return console.log(
                    `Finished loading ${imagesToLoad.length} of ${imageUris.length} entries.`,
                );

            const nextIndex = currentIndex + 1;

            const images = [...imagesToLoad];
            images[nextIndex] = imageUris[nextIndex];
            setImagesToLoad(images);
            setCurrentIndex(currentIndex + 1);
        } catch (error) {
            console.error("Error loading image:", error);
        }
    };
    return (
        <Content>
            <Section title="Virtual">
                <View>
                    <VirtualList
                        getItemCount={() => imagesToLoad.length}
                        getItem={(_data, index) => ({
                            id: `${index}`,
                            title: imagesToLoad[index],
                        })}
                        renderer={({ item }) => (
                            <DebugBorder debugInfo={+item.id + 1}>
                                {imagesToLoad[+item.id] ? (
                                    <Image
                                        key={item.title}
                                        source={{
                                            uri: imagesToLoad[+item.id],
                                        }}
                                        style={[
                                            styles.image,
                                            {
                                                opacity:
                                                    +item.id === currentIndex
                                                        ? 0.5
                                                        : 1,
                                            },
                                        ]}
                                        resizeMode="contain"
                                        onLoadStart={handleImageLoadStart}
                                        onLoadEnd={handleImageLoad}
                                    />
                                ) : (
                                    // Placeholder or loading indicator while the image is being fetched
                                    <View style={styles.placeholder} />
                                )}
                            </DebugBorder>
                        )}
                    ></VirtualList>
                </View>
            </Section>
        </Content>
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
    placeholder: {
        width: width - 50,
        height: 500,
        backgroundColor: "#555",
        opacity: 0.5,
    },
});

export default MangaViewer;
