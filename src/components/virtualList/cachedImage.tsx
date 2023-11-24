import React, { useState } from "react";
import {
    View,
    Image,
    StyleSheet,
    ImageProps,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import { ActivityIndicator, Icon } from "react-native-paper";
import { LocalTheme } from "../../../themes";
import PinchableImage from "./pinchableImage";
import { RapunzelImage } from "../../store/interfaces";

interface EmptyImageComponentProps {
    onPress: () => void;
}
const EmptyImageComponent = ({ onPress }: EmptyImageComponentProps) => {
    return (
        <TouchableOpacity
            style={{ ...styles.image, ...styles.container }}
            onPress={onPress}
        >
            <Icon size={32} source={"image-outline"} />
        </TouchableOpacity>
    );
};

const LoadingComponent = () => {
    const { colors } = LocalTheme.useTheme();

    return (
        <View style={{ ...styles.image, ...styles.container }}>
            <ActivityIndicator animating={true} color={colors.onBackground} />
        </View>
    );
};

interface CachedImageProps extends Partial<ImageProps> {
    image: RapunzelImage;
    onClick: (image: RapunzelImage) => void;
}

const CachedImage: React.FC<CachedImageProps> = ({
    image,
    onClick,
    ...props
}) => {
    const [loading, setLoading] = useState(false);

    const { colors } = LocalTheme.useTheme();

    return (
        <View
            style={{
                ...styles.container,
                backgroundColor: colors.background,
            }}
        >
            {image.uri === null ? (
                loading ? (
                    <LoadingComponent />
                ) : (
                    <EmptyImageComponent onPress={() => onClick(image)} />
                )
            ) : (
                <PinchableImage
                    {...props}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    image={image}
                />
            )}
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
        minWidth: width,
        minHeight: width * 1.4,
    },
});

export default CachedImage;
