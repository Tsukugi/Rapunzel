import { Card, Text } from "react-native-paper";
import { FC } from "react";
import { Thumbnail } from "@atsu/lilith";
import { Dimensions, StyleSheet } from "react-native";
import { removeValuesInParenthesesAndBrackets } from "../../tools/string";
import { LocalTheme } from "../../../themes";

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
    const { colors } = LocalTheme.useTheme();

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
                    backgroundColor: colors.backdrop,
                }}
                titleStyle={{
                    color: "white",
                    lineHeight: 14,
                    textAlignVertical: "center",
                    fontSize: 12,
                }}
                title={removeValuesInParenthesesAndBrackets(thumbnail.title)}
            />
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
        overflow: "hidden",
    },

    cover: {
        height: width,
        borderRadius: 30,
    },

    title: {
        bottom: 0,
        position: "absolute",
    },
});
export default BrowseItem;
