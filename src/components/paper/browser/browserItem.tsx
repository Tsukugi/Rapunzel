import { Card, Text } from "react-native-paper";
import { FC, useState } from "react";
import { Thumbnail } from "@atsu/lilith";
import { Dimensions, StyleSheet } from "react-native";
import { LocalTheme } from "../../../../themes";
import { removeValuesInParenthesesAndBrackets } from "../../../tools/string";

interface UseTimedEventHandlers {
    onStart: () => void;
    onFinish: () => void;
    onIgnore: () => void;
}

const useTimedEvent = (delay: number) => {
    const [timer, setTimer] = useState<number | null>(null);
    const event = (handlers: Partial<UseTimedEventHandlers>) => {
        const _handlers: UseTimedEventHandlers = {
            onStart: () => {},
            onFinish: () => {},
            onIgnore: () => {},
            ...handlers,
        };

        const id = setTimeout(() => {
            if (id === timer) {
                setTimer(null);
                return _handlers.onFinish();
            }
            return _handlers.onIgnore();
        }, delay);
        setTimer(id);
        return _handlers.onStart();
    };

    return [event];
};

export interface BrowseItemWithStyle extends BrowserItemProps {
    style: Record<string, any>;
}
export interface BrowserItemProps {
    cover: string;
    thumbnail: Thumbnail;
    onClick: (thumbnail: Thumbnail) => void;
    onLongClick: (thumbnail: Thumbnail) => void;
}

const BrowseItem: FC<BrowseItemWithStyle> = ({
    style,
    cover,
    thumbnail,
    onClick,
    onLongClick,
}) => {
    const { colors } = LocalTheme.useTheme();

    const defaultStyle = {
        backgroundColor: colors.backdrop,
        color: "white",
        title: removeValuesInParenthesesAndBrackets(thumbnail.title),
    };
    const [titleProps, setTitleProps] = useState(defaultStyle);

    const [onLongPressEvent] = useTimedEvent(3000);

    const onPressHandler = () => onClick(thumbnail);
    const onLongPressHandler = () => {
        onLongPressEvent({
            onStart: () =>
                setTitleProps({
                    backgroundColor: colors.primary,
                    color: colors.onPrimary,
                    title: "Book added to the Library!",
                }),
            onFinish: () => setTitleProps(defaultStyle),
            onIgnore: () => setTitleProps(defaultStyle),
        });
        onLongClick(thumbnail);
    };
    if (!thumbnail)
        return (
            <Card style={{ ...styles.container, ...style }}>
                <Card.Cover style={styles.cover} source={{ uri: "" }} />
            </Card>
        );
    return (
        <Card
            style={{ ...styles.container, ...style }}
            onPress={onPressHandler}
            onLongPress={onLongPressHandler}
        >
            <Card.Cover style={styles.cover} source={{ uri: cover }} />
            <Card.Title
                titleNumberOfLines={2}
                style={{
                    ...styles.title,
                    backgroundColor: titleProps.backgroundColor,
                }}
                titleStyle={{
                    color: titleProps.color,
                    lineHeight: 14,
                    textAlignVertical: "center",
                    fontSize: 12,
                }}
                title={titleProps.title}
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
