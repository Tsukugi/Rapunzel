import React, { FC, HTMLProps, ReactNode } from "react";
import { ScrollView, useColorScheme } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";
import Content from "./content";

interface ContentProps extends HTMLProps<HTMLDivElement> {
    children: ReactNode;
}

const ScrollContent: FC<ContentProps> = ({ children }) => {
    const isDarkMode = useColorScheme() === "dark";

    const backgroundStyle = {
        backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
    };
    return (
        <Content>
            <ScrollView
                contentInsetAdjustmentBehavior="automatic"
                style={backgroundStyle}
            >
                {children}
            </ScrollView>
        </Content>
    );
};

export default ScrollContent;
