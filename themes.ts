import { useColorScheme, Appearance } from "react-native";
import { DefaultTheme, MD3Theme } from "react-native-paper";

const lightTheme: MD3Theme = {
    ...DefaultTheme,
    colors: {
        primary: "rgb(220, 80, 60)", // More vibrant orange-red
        onPrimary: "rgb(255, 255, 255)",
        primaryContainer: "rgb(255, 225, 220)", // Lighter, warmer tone
        onPrimaryContainer: "rgb(60, 20, 5)", // Darker contrasting text
        secondary: "rgb(120, 90, 200)", // Pleasant purple-blue
        onSecondary: "rgb(255, 255, 255)",
        secondaryContainer: "rgb(235, 225, 250)", // Light purple background
        onSecondaryContainer: "rgb(40, 30, 80)", // Dark purple text
        tertiary: "rgb(180, 80, 120)", // Attractive pink-magenta
        onTertiary: "rgb(255, 255, 255)",
        tertiaryContainer: "rgb(255, 230, 240)", // Light pink background
        onTertiaryContainer: "rgb(70, 20, 45)", // Dark pink text
        error: "rgb(186, 26, 26)",
        onError: "rgb(255, 255, 255)",
        errorContainer: "rgb(255, 218, 214)",
        onErrorContainer: "rgb(65, 0, 2)",
        background: "rgb(250, 248, 248)", // Cleaner, crisper background
        onBackground: "rgb(30, 25, 25)", // Warmer dark text
        surface: "rgb(255, 252, 252)", // Slightly off-white surface
        onSurface: "rgb(30, 25, 25)",
        surfaceVariant: "rgb(245, 235, 230)", // Softer neutral
        onSurfaceVariant: "rgb(75, 65, 60)", // Warm gray text
        outline: "rgb(125, 110, 105)", // Warmer outline
        outlineVariant: "rgb(215, 200, 195)", // Warmer outline variant
        shadow: "rgb(0, 0, 0)",
        scrim: "rgb(0, 0, 0)",
        inverseSurface: "rgb(55, 45, 40)", // Warm dark surface
        inverseOnSurface: "rgb(250, 240, 235)", // Light text for dark surface
        inversePrimary: "rgb(255, 180, 160)", // Warm inverse primary
        elevation: {
            level0: "transparent",
            level1: "rgb(248, 242, 240)", // Warmer, cleaner shadows
            level2: "rgb(245, 237, 235)",
            level3: "rgb(242, 232, 230)",
            level4: "rgb(240, 230, 225)",
            level5: "rgb(238, 225, 220)",
        },
        surfaceDisabled: "rgba(30, 25, 25, 0.12)",
        onSurfaceDisabled: "rgba(30, 25, 25, 0.38)",
        backdrop: "rgba(60, 45, 40, 0.4)", // Warmer backdrop
    },
};

const darkTheme: MD3Theme = {
    ...DefaultTheme,
    dark: true,
    colors: {
        primary: "rgb(255, 183, 134)",
        onPrimary: "rgb(80, 36, 0)",
        primaryContainer: "rgb(114, 54, 0)",
        onPrimaryContainer: "rgb(255, 220, 198)",
        secondary: "rgb(235, 178, 255)",
        onSecondary: "rgb(82, 0, 113)",
        secondaryContainer: "rgb(114, 17, 153)",
        onSecondaryContainer: "rgb(248, 216, 255)",
        tertiary: "rgb(255, 181, 158)",
        onTertiary: "rgb(93, 24, 0)",
        tertiaryContainer: "rgb(124, 45, 18)",
        onTertiaryContainer: "rgb(255, 219, 208)",
        error: "rgb(255, 180, 171)",
        onError: "rgb(105, 0, 5)",
        errorContainer: "rgb(147, 0, 10)",
        onErrorContainer: "rgb(255, 180, 171)",
        background: "rgb(32, 26, 23)",
        onBackground: "rgb(236, 224, 218)",
        surface: "rgb(32, 26, 23)",
        onSurface: "rgb(236, 224, 218)",
        surfaceVariant: "rgb(82, 68, 60)",
        onSurfaceVariant: "rgb(215, 195, 183)",
        outline: "rgb(159, 141, 131)",
        outlineVariant: "rgb(82, 68, 60)",
        shadow: "rgb(0, 0, 0)",
        scrim: "rgb(0, 0, 0)",
        inverseSurface: "rgb(236, 224, 218)",
        inverseOnSurface: "rgb(54, 47, 43)",
        inversePrimary: "rgb(150, 73, 0)",
        elevation: {
            level0: "transparent",
            level1: "rgb(43, 34, 29)",
            level2: "rgb(50, 39, 32)",
            level3: "rgb(57, 43, 35)",
            level4: "rgb(59, 45, 36)",
            level5: "rgb(63, 48, 39)",
        },
        surfaceDisabled: "rgba(236, 224, 218, 0.12)",
        onSurfaceDisabled: "rgba(236, 224, 218, 0.38)",
        backdrop: "rgba(58, 46, 38, 0.4)",
    },
};

const useTheme = (): MD3Theme => {
    const isDarkMode = useColorScheme() === "dark";
    const theme = isDarkMode ? darkTheme : lightTheme;
    return theme;
};

export const LocalTheme = {
    useTheme,
};
