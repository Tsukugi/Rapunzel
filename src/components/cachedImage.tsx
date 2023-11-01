import React from "react";
import {
    View,
    Image,
    StyleSheet,
    ImageProps,
    Dimensions,
    TouchableOpacity,
} from "react-native";

interface CachedImageProps extends ImageProps {
    source: { uri: string };
    onClick: (uri: string) => void;
}

const CachedImage: React.FC<CachedImageProps> = ({
    source: { uri },
    onClick,
    ...props
}) => {
    console.log("refresh!", uri);
    return (
        <TouchableOpacity onPress={() => onClick(uri)}>
            <View style={styles.container}>
                <Image
                    {...props}
                    source={{ uri: "file://" + uri }}
                    style={styles.image}
                    resizeMode="contain"
                />
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
        width: width,
        height: 550,
        alignSelf: "center",
    },
});

export default CachedImage;
