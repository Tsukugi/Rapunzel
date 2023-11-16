import React, { FC, HTMLProps, ReactNode } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { LocalTheme } from "../../themes";

interface ContentProps extends HTMLProps<HTMLDivElement> {
    children: ReactNode;
}
const Content: FC<ContentProps> = ({ children }) => {
    const { colors } = LocalTheme.useTheme();

    return (
        <SafeAreaView
            style={{
                backgroundColor: colors.background,
                padding: 20,
                minHeight: 1000,
            }}
        >
            <StatusBar />
            <View>{children}</View>
        </SafeAreaView>
    );
};

export default Content;
