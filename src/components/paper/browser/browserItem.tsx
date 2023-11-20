import { Card, Text } from "react-native-paper";
import { FC, useState } from "react";
import { BookBase } from "@atsu/lilith";
import { Dimensions, StyleSheet, View } from "react-native";
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
    style?: Record<string, any>;
}
export interface BrowserItemProps {
    cover?: string;
    bookBase: BookBase | null;
    onClick?: (bookBase: BookBase) => void;
    onLongClick?: (bookBase: BookBase) => void;
}

const BrowseItem: FC<BrowseItemWithStyle> = ({
    style,
    cover,
    bookBase,
    onClick = () => {},
    onLongClick = () => {},
}) => {
    if (!bookBase) {
        return (
            <Card style={{ ...styles.container, ...style }}>
                <View style={styles.cover}></View>
            </Card>
        );
    }

    const { colors } = LocalTheme.useTheme();

    const defaultStyle = {
        backgroundColor: colors.backdrop,
        color: "white",
        title: `(${bookBase.availableLanguages.join(
            ",",
        )}) ${removeValuesInParenthesesAndBrackets(bookBase.title)}`,
    };
    const [titleProps, setTitleProps] = useState(defaultStyle);

    const [onLongPressEvent] = useTimedEvent(3000);

    const onPressHandler = () => onClick(bookBase);
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
        onLongClick(bookBase);
    };

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
