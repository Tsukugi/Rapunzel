import React from "react";
import renderer, { act } from "react-test-renderer";
import { describe, expect, jest, beforeEach, test } from "@jest/globals";

import { ReaderImageFit, ReaderMode } from "../src/store/interfaces";

const mockVirtualList = jest.fn((props: Record<string, unknown>) => {
    void props;
    return null;
});
const mockReaderHeader = jest.fn((props: Record<string, unknown>) => {
    void props;
    return null;
});
interface MockReaderState extends Record<string, unknown> {
    cachedImages: Array<{
        id: string;
        value: { uri: string; width: number; height: number };
    }>;
}
let mockReaderState: MockReaderState;

jest.mock("@react-navigation/native", () => {
    const ReactActual = jest.requireActual<typeof React>("react");

    return {
        useFocusEffect: (effect: () => void | (() => void)) => {
            ReactActual.useEffect(effect, [effect]);
        },
    };
});

jest.mock("../src/store/store", () => ({
    getRapunzelStore: () => ({
        reader: [mockReaderState, jest.fn()],
        library: [{ saved: {}, rendered: [] }, jest.fn()],
    }),
}));

jest.mock("react-native-fs", () => ({
    DocumentDirectoryPath: "",
    DownloadDirectoryPath: "",
    TemporaryDirectoryPath: "",
}));

jest.mock("react-native-mmkv-storage", () => ({}));

jest.mock("../src/components/navigators/useRouter", () => ({
    useRouter: jest.fn(),
}));

jest.mock("../src/cache/storage", () => ({
    getRapunzelStorage: () => ({ setItem: jest.fn() }),
}));

jest.mock("../src/components/cache/library", () => ({
    getRapunzelLibrary: () => ({
        getLibraryId: (bookId: string) => `NHentai.${bookId}`,
        saveBookToLibrary: jest.fn(async () => undefined),
        removeBookFromLibrary: jest.fn(async () => undefined),
    }),
}));

jest.mock("../src/components/virtualList/virtualList", () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => {
        mockVirtualList(props);
        return null;
    },
}));

jest.mock("../src/components/virtualList/imageItem", () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock("../src/components/reader/readerHeader", () => ({
    __esModule: true,
    default: (props: Record<string, unknown>) => {
        mockReaderHeader(props);
        return null;
    },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const RapunzelReader = require("../src/views/RapunzelReader").default;

describe("RapunzelReader header wiring", () => {
    beforeEach(() => {
        mockVirtualList.mockClear();
        mockReaderHeader.mockClear();
        mockReaderState = {
            activeProcessId: "process-1",
            book: { id: "book-1", title: "Book 1" },
            chapter: { id: "chapter-1" },
            cachedImages: [
                {
                    id: "1",
                    value: { uri: "page-1", width: 100, height: 140 },
                },
            ],
            chapterPage: 1,
            mode: ReaderMode.Scroll,
            imageFit: ReaderImageFit.Width,
        };
    });

    test("shows the header, hides it on downward scroll, and shows it on upward scroll", () => {
        let view!: ReturnType<typeof renderer.create>;
        act(() => {
            view = renderer.create(
                <RapunzelReader
                    navigation={{ goBack: jest.fn() } as unknown as never}
                />,
            );
        });
        const listProps = mockVirtualList.mock.lastCall?.[0] as Record<
            string,
            unknown
        >;
        const headerProps = () =>
            mockReaderHeader.mock.lastCall?.[0] as unknown as Record<
                string,
                unknown
            >;
        const onScroll = listProps.onScroll as (offset: number) => void;

        expect(headerProps().visible).toBe(false);

        act(() => {
            onScroll(120);
        });
        expect(headerProps().visible).toBe(false);

        act(() => {
            onScroll(80);
        });
        expect(headerProps().visible).toBe(true);

        act(() => {
            view.unmount();
        });
    });

    test("keeps the header hidden when progressive image loading changes the cache array", () => {
        let view!: ReturnType<typeof renderer.create>;
        act(() => {
            view = renderer.create(
                <RapunzelReader
                    navigation={{ goBack: jest.fn() } as unknown as never}
                />,
            );
        });

        const listProps = mockVirtualList.mock.lastCall?.[0] as Record<
            string,
            unknown
        >;
        const headerProps = () =>
            mockReaderHeader.mock.lastCall?.[0] as unknown as Record<
                string,
                unknown
            >;
        const onScroll = listProps.onScroll as (offset: number) => void;

        act(() => {
            onScroll(120);
        });
        expect(headerProps().visible).toBe(false);

        act(() => {
            mockReaderState = {
                ...mockReaderState,
                cachedImages: [
                    ...mockReaderState.cachedImages,
                    {
                        id: "2",
                        value: { uri: "page-2", width: 100, height: 140 },
                    },
                ],
            };
            view.update(
                <RapunzelReader
                    navigation={{ goBack: jest.fn() } as unknown as never}
                />,
            );
        });

        expect(headerProps().visible).toBe(false);

        act(() => {
            view.unmount();
        });
    });

    test("provides stable page layouts for fast reader scrolling", () => {
        let view!: ReturnType<typeof renderer.create>;
        act(() => {
            view = renderer.create(
                <RapunzelReader
                    navigation={{ goBack: jest.fn() } as unknown as never}
                />,
            );
        });

        const listProps = mockVirtualList.mock.lastCall?.[0] as Record<
            string,
            unknown
        >;
        const getItemLayout = listProps.getItemLayout as (
            data: unknown,
            index: number,
        ) => { length: number; offset: number; index: number };

        expect(getItemLayout).toEqual(expect.any(Function));
        expect(getItemLayout(listProps.data, 0)).toMatchObject({
            index: 0,
            length: expect.any(Number),
            offset: 0,
        });
        expect(getItemLayout(listProps.data, 1).offset).toBeGreaterThan(0);

        act(() => {
            view.unmount();
        });
    });
});
