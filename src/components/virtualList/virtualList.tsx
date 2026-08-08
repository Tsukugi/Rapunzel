import React, { PropsWithChildren } from "react";
import {
    VirtualizedList,
    StyleSheet,
    ListRenderItem,
    RefreshControl,
    StyleProp,
    ViewStyle,
} from "react-native";
import { VirtualItem } from "./interfaces";
import Item from "./item";
import { LocalTheme } from "../../../themes";
import { RapunzelLog } from "../../config/log";
import { useDebugBorders } from "../../tools/debugBorder";
import { getRapunzelStore } from "../../store/store";

interface VirtualListProps<T> extends PropsWithChildren {
    data: VirtualItem<T>[];
    style?: StyleProp<ViewStyle>;
    renderer?: ListRenderItem<VirtualItem<T>>;
    getItem?: (data: VirtualItem<T>[], index: number) => VirtualItem<T>;
    getItemLayout?: (
        data: ArrayLike<VirtualItem<T>> | null | undefined,
        index: number,
    ) => { length: number; offset: number; index: number };
    onRefresh?: () => Promise<void>;
    onEndReached?: () => void;
    onStartReached?: () => void;
    contentOffset?: { x: number; y: number };
    /** Called during scrolling. The settled callback below stays end-of-scroll only. */
    onScroll?: (offset: number) => void;
    onScrollPositionChange?: (offset: number) => void;
}

const VirtualList = <T,>({
    data,
    style,
    renderer = ({ item }) => <Item value={item.value as string} />,
    getItem = (_data, index) => _data[index],
    getItemLayout,
    onRefresh = async () => {
        RapunzelLog.log("[onRefresh]: Reached");
    },
    onEndReached = () => {
        RapunzelLog.log("[onEndReached]: Reached");
    },
    onStartReached = () => {
        RapunzelLog.log("[onStartReached]: Reached");
    },
    contentOffset,
    onScroll,
    onScrollPositionChange,
}: VirtualListProps<T>) => {
    const {
        config: [config],
    } = getRapunzelStore();

    const [refreshing, setRefreshing] = React.useState(false);
    const listRef = React.useRef<VirtualizedList<VirtualItem<T>>>(null);
    const restoredOffset = React.useRef(false);

    const onRefreshHandler = React.useCallback(() => {
        setRefreshing(true);

        onRefresh().finally(() => setRefreshing(false));
    }, [onRefresh]);

    const { colors } = LocalTheme.useTheme();

    React.useEffect(() => {
        const offset = contentOffset?.y || 0;
        if (restoredOffset.current || offset <= 0 || data.length === 0) {
            return;
        }

        // Mark before scheduling so a page append cannot queue another restore
        // before the first animation frame runs.
        restoredOffset.current = true;
        const frame = requestAnimationFrame(() => {
            listRef.current?.scrollToOffset?.({
                offset,
                animated: false,
            });
        });

        return () => cancelAnimationFrame(frame);
    }, [contentOffset?.y, data.length]);

    return (
        <VirtualizedList
            ref={listRef}
            style={[styles.container, style, useDebugBorders(config.debug)]}
            data={data}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefreshHandler}
                />
            }
            initialNumToRender={3}
            maxToRenderPerBatch={6}
            windowSize={6}
            endFillColor={colors.backdrop}
            renderItem={renderer}
            keyExtractor={(item) => item.id}
            getItemCount={(_data) => _data.length}
            getItem={getItem}
            getItemLayout={getItemLayout}
            scrollEventThrottle={16}
            onScroll={(event) => onScroll?.(event.nativeEvent.contentOffset.y)}
            onMomentumScrollEnd={(event) =>
                onScrollPositionChange?.(event.nativeEvent.contentOffset.y)
            }
            onScrollEndDrag={(event) =>
                onScrollPositionChange?.(event.nativeEvent.contentOffset.y)
            }
            onStartReached={onStartReached}
            onEndReached={onEndReached}
            onEndReachedThreshold={0.5}
        />
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default VirtualList;
