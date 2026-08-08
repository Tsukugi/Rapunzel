import React from "react";
import renderer, { act } from "react-test-renderer";
import { describe, expect, beforeEach, jest, test } from "@jest/globals";
import CacheScreen from "../src/components/cache/cacheScreen";

const mockAlert = jest.fn();
const mockSetItem = jest.fn();
type UnknownMock = (...args: unknown[]) => unknown;
const mockCalculateCacheSize = jest.fn<UnknownMock>();
const mockImportLibrary = jest.fn<UnknownMock>();
const mockExportLibrary = jest.fn<UnknownMock>();
const mockClearTempCache = jest.fn<UnknownMock>();
const mockClearLibraryCache = jest.fn<UnknownMock>();
const mockApplyLibraryPatch = jest.fn<UnknownMock>();
type MockProps = {
    children?: React.ReactNode;
    [key: string]: unknown;
};

const mockUi = { snackMessage: "" };
const mockLibrary = { saved: { "NHentai.book": { title: "Book" } } };
const mockConfig = {
    cacheTempImageLocation: "Temp",
    cachelibraryLocation: "Downloads",
};

const mockStoreState = {
    ui: [mockUi],
    library: [mockLibrary],
    config: [mockConfig],
};

jest.mock("react-native", () => ({
    Alert: { alert: (...args: unknown[]) => mockAlert(...args) },
}));

jest.mock("react-native-fs", () => ({
    DocumentDirectoryPath: "Documents",
}));

jest.mock("../themes", () => ({
    LocalTheme: {
        useTheme: () => ({
            colors: {
                error: "red",
                errorContainer: "pink",
                onError: "white",
                onErrorContainer: "black",
            },
        }),
    },
}));

jest.mock("react-native-paper", () => {
    const React = jest.requireActual<typeof import("react")>("react");
    const passthrough = ({ children, ...props }: MockProps) =>
        React.createElement("View", props, children);
    const Card = (props: MockProps) =>
        React.createElement("Card", props, props.children);
    Card.Content = passthrough;

    return {
        Button: (props: MockProps) =>
            React.createElement("Button", props, props.children),
        Card,
        List: {
            Item: (props: MockProps) => React.createElement("ListItem", props),
            Section: passthrough,
        },
        Text: (props: MockProps) =>
            React.createElement("Text", props, props.children),
    };
});

jest.mock("../src/store/store", () => ({
    getRapunzelStore: () => mockStoreState,
}));

jest.mock("../src/cache/storage", () => ({
    getRapunzelStorage: () => ({
        setItem: mockSetItem,
        instance: { getMap: jest.fn(() => ({})) },
    }),
}));

jest.mock("../src/cache/cache", () => ({
    DeviceCache: {
        calculateCacheSize: (...args: unknown[]) =>
            mockCalculateCacheSize(...args),
    },
}));

jest.mock("../src/cache/Export", () => ({
    Export: {
        importLibraryFromJson: (...args: unknown[]) => mockImportLibrary(...args),
        exportLibraryAsJson: (...args: unknown[]) => mockExportLibrary(...args),
    },
}));

jest.mock("../src/cache/useRapunzelCache", () => ({
    RapunzelCache: {
        clearTempCache: (...args: unknown[]) => mockClearTempCache(...args),
        clearLibraryCache: (...args: unknown[]) => mockClearLibraryCache(...args),
        applyLibraryBookAndCoverStoragePatch: (...args: unknown[]) =>
            mockApplyLibraryPatch(...args),
    },
}));

jest.mock("../src/components/RapunzelSelect", () => ({
    RapunzelSelect: () => null,
}));

const getButtons = (tree: renderer.ReactTestRenderer) =>
    tree.root.findAll((node) => (node.type as unknown) === "Button");

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((resolvePromise) => {
        resolve = resolvePromise;
    });
    return { promise, resolve };
};

describe("CacheScreen settings actions", () => {
    beforeEach(() => {
        mockAlert.mockReset();
        mockSetItem.mockReset();
        mockCalculateCacheSize.mockReset();
        mockImportLibrary.mockReset();
        mockExportLibrary.mockReset();
        mockClearTempCache.mockReset();
        mockClearLibraryCache.mockReset();
        mockApplyLibraryPatch.mockReset();
        mockUi.snackMessage = "";
        mockStoreState.library[0].saved = {
            "NHentai.book": { title: "Book" },
        };
        mockCalculateCacheSize.mockImplementation(() => Promise.resolve(1));
        mockImportLibrary.mockImplementation(() => Promise.resolve(2));
        mockExportLibrary.mockImplementation(() =>
            Promise.resolve("backup.json"),
        );
        mockClearTempCache.mockImplementation(() => Promise.resolve(true));
        mockClearLibraryCache.mockImplementation(() => Promise.resolve(true));
        mockApplyLibraryPatch.mockImplementation((...args: unknown[]) => {
            const onSuccess = args[1] as (value: object) => void;
                onSuccess({});
                return Promise.resolve({});
        });
    });

    test("confirms a destructive action and shows loading until it finishes", async () => {
        const action = deferred<boolean>();
        mockClearLibraryCache.mockReturnValue(action.promise);
        const tree = renderer.create(<CacheScreen />);
        const clearLibraryButton = getButtons(tree)[4];

        act(() => clearLibraryButton.props.onPress());

        expect(mockAlert).toHaveBeenCalledWith(
            "Clear library images?",
            expect.any(String),
            expect.any(Array),
            expect.any(Object),
        );
        expect(mockClearLibraryCache).not.toHaveBeenCalled();

        const alertButtons = (
            mockAlert.mock.calls[0] as unknown as [
                string,
                string,
                Array<{ onPress: () => void | Promise<void> }>,
            ]
        )[2];
        await act(async () => alertButtons[1].onPress());

        expect(mockClearLibraryCache).toHaveBeenCalledTimes(1);
        expect(getButtons(tree)[4].props.loading).toBe(true);
        expect(getButtons(tree)[4].props.disabled).toBe(true);

        await act(async () => action.resolve(true));

        expect(getButtons(tree)[4].props.loading).toBe(false);
        expect(mockUi.snackMessage).toBe("Library images cleared");
    });

    test("confirms import and shows loading until the file is processed", async () => {
        const action = deferred<number | null>();
        mockImportLibrary.mockReturnValue(action.promise);
        const tree = renderer.create(<CacheScreen />);
        const importButton = getButtons(tree)[0];

        act(() => importButton.props.onPress());

        expect(mockAlert).toHaveBeenCalled();
        expect(mockImportLibrary).not.toHaveBeenCalled();

        const alertButtons = (
            mockAlert.mock.calls[0] as unknown as [
                string,
                string,
                Array<{ onPress: () => void | Promise<void> }>,
            ]
        )[2];
        await act(async () => alertButtons[1].onPress());

        expect(mockImportLibrary).toHaveBeenCalledTimes(1);
        expect(getButtons(tree)[0].props.loading).toBe(true);

        await act(async () => action.resolve(2));

        expect(getButtons(tree)[0].props.loading).toBe(false);
        expect(mockUi.snackMessage).toBe("Imported 2 library books");
    });

    test("shows loading and completion feedback for export", async () => {
        const action = deferred<string>();
        mockExportLibrary.mockReturnValue(action.promise);
        const tree = renderer.create(<CacheScreen />);
        const exportButton = getButtons(tree)[1];

        await act(async () => exportButton.props.onPress());

        expect(mockExportLibrary).toHaveBeenCalledTimes(1);
        expect(getButtons(tree)[1].props.loading).toBe(true);

        await act(async () => action.resolve("backup.json"));

        expect(getButtons(tree)[1].props.loading).toBe(false);
        expect(mockUi.snackMessage).toBe("Library exported");
    });
});
