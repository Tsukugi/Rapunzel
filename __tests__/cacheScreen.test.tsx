import React from "react";
import renderer, { act } from "react-test-renderer";
import { describe, expect, beforeEach, jest, test } from "@jest/globals";
import CacheScreen from "../src/components/cache/cacheScreen";

const mockAlert = jest.fn();
const mockSetItem = jest.fn();
const mockCalculateCacheSize = jest.fn();
const mockImportLibrary = jest.fn();
const mockExportLibrary = jest.fn();
const mockClearTempCache = jest.fn();
const mockClearLibraryCache = jest.fn();
const mockApplyLibraryPatch = jest.fn();

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
    Alert: { alert: (...args: any[]) => mockAlert(...args) },
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
    const passthrough = ({ children, ...props }: any) =>
        React.createElement("View", props, children);
    const Card = (props: any) =>
        React.createElement("Card", props, props.children);
    Card.Content = passthrough;

    return {
        Button: (props: any) =>
            React.createElement("Button", props, props.children),
        Card,
        List: {
            Item: (props: any) => React.createElement("ListItem", props),
            Section: passthrough,
        },
        Text: (props: any) => React.createElement("Text", props, props.children),
    };
});

jest.mock("../src/store/store", () => ({
    useRapunzelStore: () => mockStoreState,
}));

jest.mock("../src/cache/storage", () => ({
    useRapunzelStorage: () => ({
        setItem: mockSetItem,
        instance: { getMap: jest.fn(() => ({})) },
    }),
}));

jest.mock("../src/cache/cache", () => ({
    DeviceCache: {
        calculateCacheSize: (...args: any[]) => mockCalculateCacheSize(...args),
    },
}));

jest.mock("../src/cache/Export", () => ({
    Export: {
        importLibraryFromJson: (...args: any[]) => mockImportLibrary(...args),
        exportLibraryAsJson: (...args: any[]) => mockExportLibrary(...args),
    },
}));

jest.mock("../src/cache/useRapunzelCache", () => ({
    RapunzelCache: {
        clearTempCache: (...args: any[]) => mockClearTempCache(...args),
        clearLibraryCache: (...args: any[]) => mockClearLibraryCache(...args),
        applyLibraryBookAndCoverStoragePatch: (...args: any[]) =>
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
        (mockCalculateCacheSize as any).mockResolvedValue(1);
        (mockImportLibrary as any).mockResolvedValue(2);
        (mockExportLibrary as any).mockResolvedValue("backup.json");
        (mockClearTempCache as any).mockResolvedValue(true);
        (mockClearLibraryCache as any).mockResolvedValue(true);
        (mockApplyLibraryPatch as any).mockImplementation(
            (_storedLibrary: unknown, onSuccess: (value: object) => void) => {
                onSuccess({});
                return Promise.resolve({});
            },
        );
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

        const alertButtons = (mockAlert.mock.calls[0] as any[])[2];
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

        const alertButtons = (mockAlert.mock.calls[0] as any[])[2];
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
