import React, { PropsWithChildren } from "react";
import { View, StyleSheet, Text } from "react-native";

interface DebugBorderProps extends PropsWithChildren {
    debugInfo?: string | number;
}

const DebugBorder: React.FC<DebugBorderProps> = ({
    children,
    debugInfo = "",
}) => {
    return (
        <View style={styles.container}>
            <Text style={styles.debugText}>{debugInfo}</Text>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderWidth: 1, // Border width
        borderColor: "red", // Border color
        borderRadius: 5, // Border radius (optional)
        padding: 5, // Padding inside the border (optional)
        position: "relative",
    },
    debugText: {
        color: "red",
        position: "absolute",
        zIndex: 1,
    },
});

export default DebugBorder;
