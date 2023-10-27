import React from "react";
import {
    View,
    Image,
    StyleSheet,
    ImageProps,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import DebugBorder from "./debugBorder";

interface CachedImageProps extends ImageProps {
    source: { uri: string };
    onReload: (uri: string) => void;
}

const CachedImage: React.FC<CachedImageProps> = ({
    source: { uri },
    onReload,
    ...props
}) => {
    console.log("refresh!", uri);
    return (
        <TouchableOpacity onPress={() => onReload(uri)}>
            <View style={styles.container}>
                <DebugBorder debugInfo={uri}>
                    <Image
                        {...props}
                        source={{ uri: "file://" + uri }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                </DebugBorder>
            </View>
        </TouchableOpacity>
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
        backgroundColor: "#555",
        alignSelf: "center",
    },
});

export default (CachedImage);
