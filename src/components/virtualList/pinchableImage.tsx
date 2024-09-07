import React, { useEffect, useState } from "react";
import { Dimensions, Image, ImageProps, StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import { RapunzelImage } from "../../store/interfaces";

interface PinchableBoxProps extends Partial<ImageProps> {
    image: RapunzelImage;
    onLoadStart: () => void;
    onLoadEnd: () => void;
}

const { width } = Dimensions.get("screen");
const PinchableImage: React.FC<PinchableBoxProps> = ({
    image,
    onLoadEnd,
    ...props
}) => {
    const scale = useSharedValue(1);
    const savedScale = useSharedValue(1);
    const pinchGesture = Gesture.Pinch()
        .onUpdate((e) => {
            scale.value = savedScale.value * e.scale;
        })
        .onEnd(() => {
            savedScale.value = scale.value;
        });

    const animatedStyle = useAnimatedStyle(() => {
        const scaleValuesToWidth = (
            desiredWidth: number,
            width: number,
            height: number,
        ) => {
            const scaleFactor = desiredWidth / width;
            const scaledWidth = width * scaleFactor;
            const scaledHeight = height * scaleFactor;
            return { scaledWidth, scaledHeight };
        };

        const { scaledWidth, scaledHeight } = scaleValuesToWidth(
            width,
            image.width || width,
            image.height || width * 1.4,
        );
        return {
            width: scaledWidth * scale.value,
            height: scaledHeight * scale.value,
        };
    });

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
};

const styles = StyleSheet.create({
    box: {
        // backgroundColor: "#b58df1",
        resizeMode: "contain",
    },
});

export default PinchableImage;
