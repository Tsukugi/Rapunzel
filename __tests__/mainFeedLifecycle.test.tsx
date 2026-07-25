import React from "react";
import renderer, { act, ReactTestRenderer } from "react-test-renderer";
import { ViewNames } from "../src/components/navigators/interfaces";
import { LilithRepo } from "../src/store/interfaces";

const mockGetLatestBooks = jest.fn(() => Promise.resolve([]));
const mockGetTrendingBooks = jest.fn(() => Promise.resolve([]));
const mockVirtualList = jest.fn((props: Record<string, unknown>) => {
    void props;
    return null;
});

const mockLatest = {
    activeProcessId: "",
    bookListRecord: {},
    cachedImagesRecord: {},
    rendered: [],
    page: 1,
    lastFetchedAt: null,
    hasNextPage: true,
    scrollOffset: 0,
};
const mockTrending = {
    activeProcessId: "",
    bookListRecord: {},
    cachedImagesRecord: {},
    rendered: [],
    lastFetchedAt: null,
};

jest.mock("@react-navigation/native", () => ({
    useFocusEffect: jest.fn(),
}));

jest.mock("../src/store/store", () => ({
    useRapunzelStore: () => ({
        config: [{ debug: false }],
        latest: [mockLatest, jest.fn()],
        trending: [mockTrending, jest.fn()],
        loading: [{ latest: false, trending: false }, jest.fn()],
    }),
}));

jest.mock("../src/api/loader", () => ({
    useRapunzelLoader: () => ({
        getLatestBooks: mockGetLatestBooks,
        getTrendingBooks: mockGetTrendingBooks,
    }),
}));

jest.mock("../src/components/navigators/useRouter", () => ({
    useRouter: jest.fn(),
}));

jest.mock(
    "../src/components/virtualList/virtualList",
    () => (props: Record<string, unknown>) => {
        mockVirtualList(props);
        return null;
    },
);
jest.mock("../src/components/paper/item/mainFeedItem", () => () => null);
jest.mock("../src/components/virtualList/TrendingBooksFeed", () => ({
    TrendingBooksFeed: () => null,
}));
jest.mock("../src/tools/useVirtualListEvents", () => ({
    useVirtualListEvents: () => ({
        getVirtualItemProps: jest.fn(),
    }),
}));
jest.mock("use-debounce", () => ({
    useDebouncedCallback: (callback: () => void) => callback,
}));

describe("RapunzelMainFeed lifecycle", () => {
    beforeEach(() => {
        mockGetLatestBooks.mockClear();
        mockGetTrendingBooks.mockClear();
        mockVirtualList.mockClear();
    });

    test("loads both feed lists when the screen first mounts", async () => {
        const RapunzelMainFeed = require("../src/views/RapunzelMainFeed")
            .default;

        await act(async () => {
            renderer.create(
                <RapunzelMainFeed
                    navigation={{
                        navigate: jest.fn(),
                        canGoBack: jest.fn(() => false),
                        goBack: jest.fn(),
                    }}
                    route={ViewNames.RapunzelMainFeed}
                />,
            );
        });

        expect(mockGetTrendingBooks).toHaveBeenCalledWith(false, true);
        expect(mockGetLatestBooks).toHaveBeenCalledWith(1, false, true);
    });

    test("requests next latest page when list reaches end", async () => {
        const RapunzelMainFeed = require("../src/views/RapunzelMainFeed")
            .default;

        let screen: ReactTestRenderer | undefined;
        await act(async () => {
            screen = renderer.create(
                <RapunzelMainFeed
                    navigation={{
                        navigate: jest.fn(),
                        canGoBack: jest.fn(() => false),
                        goBack: jest.fn(),
                    }}
                    route={ViewNames.RapunzelMainFeed}
                />,
            );
        });

        const props = mockVirtualList.mock.lastCall?.[0] as {
            onEndReached?: () => void;
        };
        props.onEndReached?.();

        expect(mockGetLatestBooks).toHaveBeenCalledWith(2, false);
        screen!.unmount();
    });
});
