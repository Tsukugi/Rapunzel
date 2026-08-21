import React from "react";
import renderer, { act } from "react-test-renderer";
import { describe, expect, jest, beforeEach, test } from "@jest/globals";

const mockFocusEffect = jest.fn();
const mockLibraryEffect = jest.fn();
const mockGetMap = jest.fn(() => ({}));
const mockLibraryState = {
    saved: {},
    rendered: [] as string[],
};
const mockConfig = { repository: "NHentai" };

jest.mock("@react-navigation/native", () => ({
    useFocusEffect: mockFocusEffect,
}));

jest.mock("../src/store/store", () => ({
    getRapunzelStore: () => ({
        config: [mockConfig],
        library: [mockLibraryState, mockLibraryEffect],
    }),
}));

jest.mock("../src/cache/storage", () => ({
    getRapunzelStorage: () => ({
        instance: { getMap: mockGetMap },
    }),
}));

jest.mock("react-native-fs", () => ({
    DocumentDirectoryPath: "",
    DownloadDirectoryPath: "",
    TemporaryDirectoryPath: "",
}));

jest.mock("../src/components/navigators/useRouter", () => ({
    useRouter: jest.fn(),
}));

jest.mock("../src/tools/useVirtualListEvents", () => ({
    useVirtualListEvents: () => ({
        getVirtualItemProps: jest.fn(),
        onRemoveFromLibraryHandler: jest.fn(),
        onBookSelectHandler: jest.fn(),
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
const RapunzelLibrary = require("../src/views/RapunzelLibrary").default;

describe("RapunzelLibrary focus refresh", () => {
    beforeEach(() => {
        mockFocusEffect.mockClear();
        mockLibraryEffect.mockClear();
        mockGetMap.mockClear();
        mockLibraryState.saved = {};
        mockLibraryState.rendered = [];
    });

    test("keeps the focus callback stable when rendered library entries change", () => {
        let view!: ReturnType<typeof renderer.create>;

        act(() => {
            view = renderer.create(
                <RapunzelLibrary navigation={{} as unknown as never} />,
            );
        });

        const firstFocusEffect = mockFocusEffect.mock.lastCall?.[0];
        const firstLibraryEffect = mockLibraryEffect.mock.lastCall?.[0];

        mockLibraryState.rendered = ["NHentai.book-1"];

        act(() => {
            view.update(
                <RapunzelLibrary navigation={{} as unknown as never} />,
            );
        });

        expect(mockFocusEffect.mock.lastCall?.[0]).toBe(firstFocusEffect);
        expect(mockLibraryEffect.mock.lastCall?.[0]).toBe(firstLibraryEffect);

        act(() => {
            view.unmount();
        });
    });
});
