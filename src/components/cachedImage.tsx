import React from "react";
import {
    View,
    Image,
    StyleSheet,
    ImageProps,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import { RapunzelLog } from "../config/log";
import { Text } from "react-native-paper";

interface CachedImageProps extends ImageProps {
    source: { uri: string };
    onClick: (uri: string) => void;
}

const CachedImage: React.FC<CachedImageProps> = ({
    source: { uri },
    onClick,
    ...props
}) => {
    //RapunzelLog.log("[CachedImage] refresh!", uri);
    return (
        <TouchableOpacity onPress={() => onClick(uri)}>
            <View style={styles.container}>
                {uri === null ? (
                    <Text style={styles.image}>Placeholder</Text>
                ) : (
                    <Image
                        {...props}
                        source={{ uri: "file://" + uri }}
                        style={styles.image}
                        resizeMode="contain"
                    />
                )}
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
