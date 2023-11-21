import React, { FC, Fragment, HTMLProps, ReactNode } from "react";
import { StatusBar, View } from "react-native";
import { LocalTheme } from "../../themes";

interface ContentProps extends HTMLProps<HTMLDivElement> {
    children: ReactNode;
}
const Content: FC<ContentProps> = ({ children }) => {
    const { colors } = LocalTheme.useTheme();

    return (
        <View
            style={{
                backgroundColor: colors.background,
                flex: 1,
            }}
        >
            <StatusBar />
            <View>{children}</View>
        </View>
    );
};

export default Content;
