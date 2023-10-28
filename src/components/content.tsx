import React, { FC, HTMLProps, ReactNode } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { useTheme } from "react-native-paper";

interface ContentProps extends HTMLProps<HTMLDivElement> {
    children: ReactNode;
}
const Content: FC<ContentProps> = ({ children }) => {
    const { colors } = useTheme();

    return (
        <SafeAreaView
            style={{
                backgroundColor: colors.background,
                padding: 20,
                minHeight: 1000 
            }}
        >
            <StatusBar />
            <View>{children}</View>
        </SafeAreaView>
    );
};

export default Content;
