import React, { useState } from "react";
import {
    View,
    Image,
    StyleSheet,
    ImageProps,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import { ActivityIndicator, Icon, useTheme } from "react-native-paper";

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
    const { colors } = useTheme();

    return (
        <View style={{ ...styles.image, ...styles.container }}>
            (
            <ActivityIndicator animating={true} color={colors.onBackground} />
        </View>
    );
};

interface CachedImageProps extends ImageProps {
    source: { uri: string };
    onClick: (uri: string) => void;
}

const CachedImage: React.FC<CachedImageProps> = ({
    source: { uri },
    onClick,
    ...props
}) => {
    const [loading, setLoading] = useState(false);

    const { colors } = useTheme();
    return (
        <TouchableOpacity>
            <View
                style={{
                    ...styles.container,
                    backgroundColor: colors.background,
                }}
            >
                {uri === null ? (
                    loading ? (
                        <LoadingComponent />
                    ) : (
                        <EmptyImageComponent onPress={() => onClick(uri)} />
                    )
                ) : (
                    <Image
                        {...props}
                        onError={() => {}}
                        onLoadStart={() => setLoading(true)}
                        onLoadEnd={() => setLoading(false)}
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
        minHeight: 583,
    },
});

export default CachedImage;
