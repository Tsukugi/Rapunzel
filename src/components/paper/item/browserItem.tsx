import { Card, Chip, Text } from "react-native-paper";
import { FC, useEffect, useMemo, useState } from "react";
import { BookBase } from "@atsu/lilith";
import { Dimensions, StyleSheet, View } from "react-native";
import { LocalTheme } from "../../../../themes";
import { removeValuesInParenthesesAndBrackets } from "../../../tools/string";
import { getLocaleEmoji } from "../../../tools/locales";
import { RapunzelLog } from "../../../config/log";
import { useTimedEvent } from "../../../tools/useTimedEvent";
import { CacheUtils } from "../../../cache/CacheUtils";
import { FallbackCacheExtension } from "../../../api/loader";

export interface StyleProps {
    style: Record<string, any>;
    coverStyle: Record<string, any>;
    titleStyle: Record<string, any>;
}
export interface BrowserItemProps extends Partial<StyleProps> {
    cover?: string;
    bookmarked?: boolean;
    bookBase: BookBase | null;
    onClick?: (bookBase: BookBase) => void;
    onLongClick?: (bookBase: BookBase) => void;
}

const BrowseItem: FC<BrowserItemProps> = ({
    style,
    bookmarked = false,
    coverStyle,
    titleStyle,
    cover,
    bookBase,
    onClick = () => {},
    onLongClick = () => {},
}) => {
    if (!bookBase) {
        return (
            <Card style={{ ...styles.container, ...style }}>
                <View style={styles.cover}>
                    <Text>{cover}</Text>
                </View>
            </Card>
        );
    }

    const { colors } = LocalTheme.useTheme();

    const languages = useMemo(
        () => bookBase.availableLanguages.map((lang) => getLocaleEmoji(lang)),
        [bookBase.availableLanguages],
    );
    const title = useMemo(
        () => removeValuesInParenthesesAndBrackets(bookBase.title),
        [bookBase.title],
    );

    // Track the active cover; reset whenever a new book or cover arrives.
    const [src, setSrc] = useState(cover);
    useEffect(() => {
        setSrc(cover);
    }, [cover]);

    // Build the base title/appearance once per book to keep renders light.
    const defaultStyle = useMemo(
        () => ({
            backgroundColor: colors.backdrop,
            color: "white",
            title: `${languages.join("")} ${title}`,
        }),
        [colors.backdrop, languages.join(""), title],
    );

    // Ensure the live title props follow the latest defaults (e.g., after long press).
    const [titleProps, setTitleProps] = useState(defaultStyle);
    useEffect(() => {
        setTitleProps(defaultStyle);
    }, [defaultStyle]);

    const [onLongPressEvent] = useTimedEvent(3000);

    const onPressHandler = () => {
        RapunzelLog.log("[BrowseItem.onPressHandler]");
        onClick(bookBase);
    };
    const onLongPressHandler = () => {
        onLongPressEvent({
            onStart: () => {
                RapunzelLog.log("[BrowseItem.onLongPressEvent.onStart]");
                setTitleProps({
                    backgroundColor: colors.primary,
                    color: colors.onPrimary,
                    title: "Book added to the Library!",
                });
            },
            onFinish: () => {
                RapunzelLog.log("[BrowseItem.onLongPressEvent.onFinish]");
                setTitleProps(defaultStyle);
            },
            onIgnore: () => {
                RapunzelLog.log("[BrowseItem.onLongPressEvent.onIgnore]");
                setTitleProps(defaultStyle);
            },
        });
        RapunzelLog.log("[BrowseItem.onLongPressEvent.onLongClick]");
        onLongClick(bookBase);
    };

    return (
        <Card
            style={{ ...styles.container, ...style }}
            onPress={onPressHandler}
            onLongPress={onLongPressHandler}
        >
            <Card.Cover
                testID="browser-item-cover"
                style={{ ...styles.cover, ...coverStyle }}
                source={{ uri: src }}
                onError={() => {
                    src &&
                        setSrc(
                            CacheUtils.replaceExtension(
                                src,
                                FallbackCacheExtension,
                            ),
                        );
                    RapunzelLog.error(
                        `[BrowserItem]: Image load failed ${src}`,
                    );
                }}
            />
            <Card.Content
                style={{
                    ...styles.topContent,
                    backgroundColor: titleProps.backgroundColor,
                }}
            >
                {bookmarked && (
                    <Chip
                        style={{ backgroundColor: titleProps.backgroundColor }}
                        textStyle={{ color: titleProps.color }}
                        icon="bookmark"
                        onPress={() => console.log("Pressed")}
                    >
                        Saved
                    </Chip>
                )}
            </Card.Content>
            <Card.Title
                testID="browser-item-title"
                titleNumberOfLines={2}
                style={{
                    ...styles.title,
                    backgroundColor: titleProps.backgroundColor,
                    ...titleStyle,
                }}
                titleStyle={{
                    color: titleProps.color,
                    lineHeight: 14,
                    textAlignVertical: "center",
                    fontSize: 12,
                    ...titleStyle,
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

    topContent: {
        position: "absolute",
        top: 0,
        right: 0,
        borderRadius: 30,
        display: "flex",
        flexDirection: "row",
        justifyContent: "flex-end",
        alignItems: "center",
        height: 30,
        margin: 4,
        paddingLeft: 0,
        paddingRight: 0,
    },

    icon: {
        width: 30,
    },

    title: {
        width: width,
        bottom: 0,
        position: "absolute",
    },
});
export default BrowseItem;
