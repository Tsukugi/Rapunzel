import React from "react";
import renderer, { act } from "react-test-renderer";
import { describe, expect, jest, test } from "@jest/globals";

const mockBrowseEffect = jest.fn((onUpdate: unknown) => {
    void onUpdate;
});

const mockBrowseState = {
    cachedImagesRecord: {},
    rendered: [],
    bookListRecord: {},
    hasNextPage: false,
    page: 1,
    cacheKey: "",
    lastFetchedAt: null,
    scrollOffset: 0,
};

jest.mock("@react-navigation/native", () => ({
    useFocusEffect: jest.fn(),
}));

jest.mock("../src/store/store", () => ({
    getRapunzelStore: () => ({
        header: [{ searchValue: "" }],
        config: [{ repository: "NHentai" }],
        loading: [{ browse: false }],
        browse: [mockBrowseState, mockBrowseEffect],
    }),
}));

jest.mock("../src/api/loader", () => ({
    getRapunzelLoader: () => ({ loadSearch: jest.fn() }),
}));

jest.mock("../src/components/navigators/useRouter", () => ({
    useRouter: jest.fn(),
}));

jest.mock("../src/tools/useVirtualListEvents", () => ({
    useVirtualListEvents: () => ({
        getVirtualItemProps: jest.fn(),
    }),
}));

jest.mock("../src/components/virtualList/virtualList", () => ({
    __esModule: true,
    default: () => null,
}));

jest.mock("../src/components/paper/item/coupleItem", () => ({
    __esModule: true,
    default: () => null,
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const RapunzelBrowse = require("../src/views/RapunzelBrowse").default;

describe("RapunzelBrowse subscriptions", () => {
    test("keeps the Taihou subscription callback stable across renders", () => {
        mockBrowseEffect.mockClear();

        let view!: ReturnType<typeof renderer.create>;
        act(() => {
            view = renderer.create(
                <RapunzelBrowse navigation={{} as unknown as never} />,
            );
        });

        const firstBrowseEffect = mockBrowseEffect.mock.lastCall?.[0];

        act(() => {
            view.update(
                <RapunzelBrowse navigation={{} as unknown as never} />,
            );
        });

        expect(mockBrowseEffect.mock.lastCall?.[0]).toBe(firstBrowseEffect);

        act(() => {
            view.unmount();
        });
    });
});
