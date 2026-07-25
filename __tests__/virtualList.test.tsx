import React from "react";
import renderer, { act } from "react-test-renderer";
import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { VirtualItem } from "../src/components/virtualList/interfaces";
import VirtualList from "../src/components/virtualList/virtualList";

interface CapturedListProps {
    contentOffset?: { x: number; y: number };
    keyExtractor: (item: VirtualItem<string>, index: number) => string;
    onEndReachedThreshold?: number;
}

const mockVirtualizedList = jest.fn((props: Record<string, unknown>) => {
    void props;
    return null;
});

jest.mock("react-native", () => {
    const ReactActual = jest.requireActual<typeof React>("react");

    return {
        VirtualizedList: ReactActual.forwardRef(
            (
                props: Record<string, unknown>,
                ref: React.ForwardedRef<unknown>,
            ) => {
                mockVirtualizedList(props);
                void ref;
                return null;
            },
        ),
        RefreshControl: () => null,
        StyleSheet: {
            create: (styles: Record<string, unknown>) => styles,
        },
    };
});

jest.mock("../themes", () => ({
    LocalTheme: {
        useTheme: () => ({ colors: { backdrop: "white" } }),
    },
}));

jest.mock("../src/store/store", () => ({
    useRapunzelStore: () => ({
        config: [{ debug: false }],
    }),
}));

describe("VirtualList pagination behavior", () => {
    beforeEach(() => {
        mockVirtualizedList.mockClear();
    });

    test("keeps native scroll uncontrolled and preserves item identity when a page appends", () => {
        const firstPage: VirtualItem<string>[] = [
            { id: "book-1", value: "Book 1" },
            { id: "book-2", value: "Book 2" },
        ];
        const secondPage = [
            ...firstPage,
            { id: "book-3", value: "Book 3" },
        ];
        const list = renderer.create(
            <VirtualListForTest
                data={firstPage}
                contentOffset={{ x: 0, y: 240 }}
            />,
        );

        list.update(
            <VirtualListForTest
                data={secondPage}
                contentOffset={{ x: 0, y: 240 }}
            />,
        );

        const props = mockVirtualizedList.mock.lastCall?.[0];
        expect(props).toBeDefined();
        const capturedProps = props as unknown as CapturedListProps;

        expect(capturedProps.contentOffset).toBeUndefined();
        expect(capturedProps.keyExtractor(secondPage[0], 0)).toBe("book-1");
        expect(capturedProps.keyExtractor(secondPage[2], 2)).toBe("book-3");
        expect(capturedProps.onEndReachedThreshold).toBeLessThanOrEqual(1);

        list.unmount();
    });

    test("does not queue a second offset restore while a page appends", () => {
        const originalRequestAnimationFrame = global.requestAnimationFrame;
        const originalCancelAnimationFrame = global.cancelAnimationFrame;
        const requestAnimationFrame = jest.fn(() => 1);
        const cancelAnimationFrame = jest.fn();
        global.requestAnimationFrame = requestAnimationFrame as unknown as typeof global.requestAnimationFrame;
        global.cancelAnimationFrame = cancelAnimationFrame as unknown as typeof global.cancelAnimationFrame;

        try {
            const firstPage: VirtualItem<string>[] = [
                { id: "book-1", value: "Book 1" },
            ];
            const list = renderer.create(
                <VirtualList
                    data={firstPage}
                    contentOffset={{ x: 0, y: 240 }}
                />,
            );

            act(() => {
                list.update(
                    <VirtualList
                        data={[...firstPage, { id: "book-2", value: "Book 2" }]}
                        contentOffset={{ x: 0, y: 240 }}
                    />,
                );
            });

            expect(requestAnimationFrame).toHaveBeenCalledTimes(1);
            list.unmount();
        } finally {
            global.requestAnimationFrame = originalRequestAnimationFrame;
            global.cancelAnimationFrame = originalCancelAnimationFrame;
        }
    });
});

const VirtualListForTest = (
    props: React.ComponentProps<typeof VirtualList>,
) => <VirtualList {...props} />;
