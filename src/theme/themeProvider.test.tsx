import React from "react";
import { Text, View } from "react-native";
import * as ReactNative from "react-native";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    ThemeProvider,
    ThemeStorageKey,
    darkColors,
    useTheme,
} from ".";

const ThemeConsumer = () => {
    const { theme, colors, toggleTheme } = useTheme();
    return (
        <View>
            <Text testID="theme">{theme}</Text>
            <Text testID="background">{colors.background}</Text>
            <Text testID="toggle" onPress={toggleTheme}>
                toggle
            </Text>
        </View>
    );
};

beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(ReactNative, "useColorScheme").mockReturnValue("light");
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
});

describe("ThemeProvider", () => {
    it("hydrates stored theme preference", async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce("dark");

        const { getByTestId } = render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>,
        );

        await waitFor(() => {
            expect(getByTestId("theme").props.children).toBe("dark");
        });
        expect(getByTestId("background").props.children).toBe(
            darkColors.background,
        );
    });

    it("toggles theme and persists selection", async () => {
        const { getByTestId } = render(
            <ThemeProvider>
                <ThemeConsumer />
            </ThemeProvider>,
        );

        await waitFor(() => {
            expect(getByTestId("theme").props.children).toBe("light");
        });

        fireEvent.press(getByTestId("toggle"));

        await waitFor(() => {
            expect(getByTestId("theme").props.children).toBe("dark");
        });
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            ThemeStorageKey,
            "dark",
        );
    });
});
