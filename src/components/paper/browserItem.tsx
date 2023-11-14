import { Button, Card, Text, useTheme } from "react-native-paper";
import { FC } from "react";
import { Thumbnail } from "@atsu/lilith";
import { Dimensions, Platform, StyleSheet } from "react-native";
import { Colors } from "react-native/Libraries/NewAppScreen";

export interface BrowseItemWithStyle extends BrowserItemProps {
    style: Record<string, any>;
}
export interface BrowserItemProps {
    cover: string;
    thumbnail: Thumbnail;
    onClick: (thumbnail: Thumbnail) => void;
}

const BrowseItem: FC<BrowseItemWithStyle> = ({
    style,
    cover,
    thumbnail,
    onClick,
}) => {
    const { colors } = useTheme();

    const onPressHandler = () => onClick(thumbnail);
    if (!thumbnail) return <Text>Text</Text>;
    return (
        <Card
            style={{ ...styles.container, ...style }}
            onPress={onPressHandler}
        >
            <Card.Cover style={styles.cover} source={{ uri: cover }} />
            <Card.Title
                titleNumberOfLines={2}
                style={{
                    ...styles.title,
                    backgroundColor: colors.surface,
                    opacity: 0.8,
                }}
                title={thumbnail.title}
            />
            {/* <Card.Actions style={styles.actions}>
                <Button style={styles.btn} mode="outlined">
                    Save
                </Button>
                <Button onPress={onPressHandler}>Read</Button>
            </Card.Actions> */}
        </Card>
    );
};

const { width } = Dimensions.get("screen");

const styles = StyleSheet.create({
    container: {
        position: "relative",
        height: width,
        margin: 2,
        borderRadius: 30,
        flex: 1,
    },

    cover: {
        height: width,
        borderRadius: 30,
    },

    title: {
        bottom: 0,
        position: "absolute",
    },
    actions: {
        top: 0,
        right: 0,
        position: "absolute",
    },

    btn: {
        backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
});
export default BrowseItem;
