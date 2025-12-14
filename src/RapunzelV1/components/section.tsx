import React, { FC, PropsWithChildren } from "react";
import { View, Text, StyleSheet } from "react-native";

interface SectionProps extends PropsWithChildren {
    title: string;
}

const Section: FC<SectionProps> = ({ children, title }: SectionProps) => {
    return (
        <View style={styles.sectionContainer}>
            <Text style={[styles.sectionTitle]}>{title}</Text>
            <Text style={[styles.sectionDescription]}>{children}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    sectionContainer: {
        marginTop: 32,
        paddingHorizontal: 24,
    },
    sectionTitle: {
        fontSize: 24,
        fontWeight: "600",
    },
    sectionDescription: {
        marginTop: 8,
        fontSize: 18,
        fontWeight: "400",
    },
});
export default Section;
