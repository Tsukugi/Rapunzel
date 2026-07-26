import React from "react";
import renderer, { act } from "react-test-renderer";
import { describe, expect, jest, test } from "@jest/globals";

// The mock needs to preserve dependency behavior so this test can reproduce
// stale animated dimensions.
// eslint-disable-next-line react-hooks/rules-of-hooks
const mockUseAnimatedStyle = jest.fn(
    (callback: () => Record<string, number>, dependencies?: unknown[]) =>
        // eslint-disable-next-line react-hooks/exhaustive-deps
        React.useMemo(callback, dependencies || []),
);

jest.mock("react-native", () => {
    return {
        Dimensions: {
            get: () => ({ width: 360, height: 800 }),
        },
        StyleSheet: {
            create: (styles: Record<string, unknown>) => styles,
        },
    };
});

jest.mock("react-native-gesture-handler", () => {
    const ReactActual = jest.requireActual<typeof React>("react");
    const gesture = {
        onUpdate: jest.fn().mockReturnThis(),
        onEnd: jest.fn().mockReturnThis(),
    };

    return {
        Gesture: {
            Pinch: () => gesture,
        },
        GestureDetector: ({ children }: { children: React.ReactNode }) =>
            ReactActual.createElement(ReactActual.Fragment, null, children),
    };
});

jest.mock("react-native-reanimated", () => {
    const ReactActual = jest.requireActual<typeof React>("react");
    const AnimatedImage = (props: Record<string, unknown>) =>
        ReactActual.createElement("image", props);

    return {
        __esModule: true,
        default: { Image: AnimatedImage },
        useAnimatedStyle: mockUseAnimatedStyle,
        useSharedValue: (value: number) => ({ value }),
    };
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { default: PinchableImage } = require(
    "../src/components/virtualList/pinchableImage",
);

describe("PinchableImage sizing", () => {
    test("updates the fitted height when image dimensions arrive after mount", () => {
        const onLoadEnd = jest.fn();
        const image = { uri: "page", width: undefined, height: undefined };
        const view = renderer.create(
            <PinchableImage
                image={image}
                onLoadStart={jest.fn()}
                onLoadEnd={onLoadEnd}
            />,
        );

        act(() => {
            view.update(
                <PinchableImage
                    image={{ uri: "page", width: 1200, height: 2400 }}
                    onLoadStart={jest.fn()}
                    onLoadEnd={onLoadEnd}
                />,
            );
        });

        const style = view.root.findByType("image").props.style;
        expect(style[1]).toEqual({ width: 360, height: 720 });
    });
});
