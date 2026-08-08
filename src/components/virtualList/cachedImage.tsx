import React, { useEffect, useState } from "react";
import {
    View,
    StyleSheet,
    ImageProps,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import { ActivityIndicator, Icon } from "react-native-paper";
import { LocalTheme } from "../../../themes";
import PinchableImage from "./pinchableImage";
import { RapunzelImage, ReaderImageFit } from "../../store/interfaces";
import { FallbackCacheExtension } from "../../api/loader";
import { CacheUtils } from "../../cache/CacheUtils";
import { RapunzelLog } from "../../config/log";

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
    imageFit?: ReaderImageFit;
}

const CachedImage: React.FC<CachedImageProps> = ({
    image,
    onClick,
    imageFit,
    ...props
}) => {
    const [loading, setLoading] = useState(false);
    const [src, setSrc] = useState(image.uri);
    const [fallbackAttempted, setFallbackAttempted] = useState(false);

    useEffect(() => {
        setSrc(image.uri);
        setFallbackAttempted(false);
    }, [image.uri, image.fallbackUri]);

    const { colors } = LocalTheme.useTheme();
    //<EmptyImageComponent onPress={() => onClick(image)} />
    return (
        <View
            style={{
                ...styles.container,
                backgroundColor: colors.background,
            }}
        >
            {loading && <LoadingComponent />}
            {src ? (
                <PinchableImage
                    {...props}
                    imageFit={imageFit}
                    onLoadStart={() => setLoading(true)}
                    onLoadEnd={() => setLoading(false)}
                    onError={() => {
                        const extensionFallback = src
                            ? CacheUtils.replaceExtension(
                                  src,
                                  FallbackCacheExtension,
                              )
                            : undefined;
                        const nextUri = image.fallbackUri || extensionFallback;
                        if (!fallbackAttempted && nextUri && nextUri !== src) {
                            setFallbackAttempted(true);
                            setSrc(nextUri);
                        } else {
                            setSrc("");
                        }
                        RapunzelLog.error(
                            `[CachedImage]: Image load failed ${src}`,
                        );
                    }}
                    image={{ ...image, uri: src }}
                />
            ) : (
                <EmptyImageComponent onPress={() => onClick(image)} />
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
