import React, { FC, HTMLProps, ReactNode } from "react";
import { ScrollView } from "react-native";
import Content from "./content";

interface ContentProps extends HTMLProps<HTMLDivElement> {
    children: ReactNode;
}

const ScrollContent: FC<ContentProps> = ({ children }) => {
    return (
        <Content>
            <ScrollView contentInsetAdjustmentBehavior="automatic">
                {children}
            </ScrollView>
        </Content>
    );
};

export default ScrollContent;
