import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import { useColorScheme } from "react-native";

export type ThemeName = "light" | "dark";

export const lightColors = {
    primary: "#1e6ff1",
    secondary: "#f1f4f8",
    white: "#FFFFFF",
    black: "#0f172a",
    gray: "#6b7280",
    lightGray: "#d6d7db",
    background: "#f8fafc",
    card: "#FFFFFF",
    border: "#e5e7eb",
    warning: "#f59e0b",
};

export const darkColors = {
    primary: "#8bb4ff",
    secondary: "#111827",
    white: "#1f2937",
    black: "#e5e7eb",
    gray: "#9ca3af",
    lightGray: "#374151",
    background: "#0b1220",
    card: "#111827",
    border: "#1f2937",
    warning: "#fbbf24",
};

// Backwards compatibility for non-themed imports.
export const colors = lightColors;

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
};

export const typography = {
    sizes: {
        small: 12,
        medium: 16,
        large: 18,
        xlarge: 24,
    },
    weights: {
        regular: "400",
        medium: "500",
        bold: "700",
    },
};

export const ThemeStorageKey = "rapunzel.theme";

interface ThemeContextValue {
    theme: ThemeName;
    isDark: boolean;
    colors: typeof lightColors;
    spacing: typeof spacing;
    typography: typeof typography;
    setTheme: (theme: ThemeName) => void;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
    theme: "light",
    isDark: false,
    colors: lightColors,
    spacing,
    typography,
    setTheme: () => {},
    toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: PropsWithChildren) => {
    const system = useColorScheme();
    const [theme, setTheme] = useState<ThemeName>("light");

    // Hydrate from storage or fall back to system preference.
    useEffect(() => {
        AsyncStorage.getItem(ThemeStorageKey)
            .then((stored) => {
                if (stored === "light" || stored === "dark") {
                    setTheme(stored);
                    return;
                }
                if (system === "dark") setTheme("dark");
            })
            .catch(() => {
                if (system === "dark") setTheme("dark");
            });
    }, [system]);

    useEffect(() => {
        AsyncStorage.setItem(ThemeStorageKey, theme).catch(() => {
            // best effort persist; ignore failures
        });
    }, [theme]);

    const value = useMemo(
        () => ({
            theme,
            isDark: theme === "dark",
            colors: theme === "dark" ? darkColors : lightColors,
            spacing,
            typography,
            setTheme,
            toggleTheme: () => setTheme((prev) => (prev === "dark" ? "light" : "dark")),
        }),
        [theme],
    );

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
