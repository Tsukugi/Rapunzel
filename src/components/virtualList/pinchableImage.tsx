import React from "react";
import { Dimensions, ImageProps, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { RapunzelImage, ReaderImageFit } from "../../store/interfaces";
import { getFittedImageDimensions } from "./imageFit";

interface PinchableBoxProps extends Partial<ImageProps> {
    image: RapunzelImage;
    onLoadStart: () => void;
    onLoadEnd: () => void;
    imageFit?: ReaderImageFit;
}

const viewport = Dimensions.get("screen");
const PinchableImage: React.FC<PinchableBoxProps> = React.memo(
    ({ image, imageFit = ReaderImageFit.Width, onLoadEnd, ...props }) => {
        const scale = useSharedValue(1);
        const savedScale = useSharedValue(1);
        const pinchGesture = Gesture.Pinch()
            .onUpdate((e) => {
                scale.value = savedScale.value * e.scale;
            })
            .onEnd(() => {
                savedScale.value = scale.value;
            });

        const fittedDimensions = getFittedImageDimensions(
            image,
            viewport,
            imageFit,
        );

        const animatedStyle = useAnimatedStyle(() => {
            return {
                width: fittedDimensions.width * scale.value,
                height: fittedDimensions.height * scale.value,
            };
        }, [scale.value, fittedDimensions.width, fittedDimensions.height]);

        return (
            <GestureDetector gesture={pinchGesture}>
                <Animated.Image
                    {...props}
                    onLoadEnd={onLoadEnd}
                    style={[styles.box, animatedStyle]}
                    source={{ uri: image.uri }}
                />
            </GestureDetector>
        );
    },
);
const styles = StyleSheet.create({
    box: {
        // backgroundColor: "#b58df1",
        resizeMode: "contain",
    },
});

export default PinchableImage;
