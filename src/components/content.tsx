import React, { FC, HTMLProps, ReactNode } from "react";
import {
    SafeAreaView,
    StatusBar,
    ScrollView,
    useColorScheme,
} from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

interface ContentProps extends HTMLProps<HTMLDivElement> {
    children: ReactNode;
}

const Content: FC<ContentProps> = ({ children }) => {
    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };
    return (
        <SafeAreaView style={backgroundStyle}>
            <StatusBar
                barStyle={isDarkMode ? "light-content" : "dark-content"}
                backgroundColor={backgroundStyle.backgroundColor}
            />
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={backgroundStyle}
            >
                {children}
            </ScrollView>
        </SafeAreaView>
    );
};

export default Content;
