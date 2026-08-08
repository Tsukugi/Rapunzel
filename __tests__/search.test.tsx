import { describe, expect, jest, test } from "@jest/globals";
import React from "react";
import renderer, { act } from "react-test-renderer";

let mockHeader: { searchValue: string };

jest.mock("react-native-paper", () => {
    const React = require("react");
    return {
        Appbar: {
            Action: (props: any) => React.createElement("AppbarAction", props),
        },
        Searchbar: (props: any) => React.createElement("Searchbar", props),
    };
});

jest.mock("@react-navigation/native", () => ({
    useFocusEffect: (effect: () => void) => {
        const React = require("react");
        React.useEffect(effect, []);
    },
}));

jest.mock("../src/store/store", () => ({
    useRapunzelStore: () => ({
        header: [mockHeader, jest.fn()],
    }),
}));

jest.mock("../src/config/log", () => ({
    RapunzelLog: {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

import PaperSearch from "../src/components/paper/header/search";

describe("PaperSearch", () => {
    test("clears local and store query when closed", () => {
        mockHeader = { searchValue: "english" };
        const component = renderer.create(<PaperSearch />);

        let searchbar = component.root.findByType("Searchbar");
        expect(searchbar.props.value).toBe("english");

        act(() => {
            searchbar.props.onTraileringIconPress();
        });

        expect(mockHeader.searchValue).toBe("");
        expect(component.root.findByType("AppbarAction")).toBeTruthy();

        act(() => {
            component.root.findByType("AppbarAction").props.onPress();
        });
        searchbar = component.root.findByType("Searchbar");
        expect(searchbar.props.value).toBe("");
    });

    test("allows the expanded search field to shrink inside the header", () => {
        mockHeader = { searchValue: "english" };
        const component = renderer.create(<PaperSearch />);
        const searchbar = component.root.findByType("Searchbar" as any);

        expect(searchbar.props.style).toEqual(
            expect.objectContaining({ flexShrink: 1, width: "100%" }),
        );
    });

    test("keeps the expanded search field centered inside the appbar height", () => {
        mockHeader = { searchValue: "english" };
        const component = renderer.create(<PaperSearch />);
        const searchbar = component.root.findByType("Searchbar" as any);
        const searchContainer = component.root.find(
            (node) => String(node.type) === "View",
        );

        expect(searchContainer.props.style).toEqual(
            expect.objectContaining({
                alignSelf: "stretch",
                justifyContent: "center",
            }),
        );
        expect(searchbar.props.style).toEqual(
            expect.objectContaining({
                flexGrow: 0,
                flexShrink: 1,
                height: 48,
                width: "100%",
            }),
        );
        expect(searchbar.props.inputStyle).toEqual(
            expect.objectContaining({ minHeight: 0 }),
        );
        expect(searchbar.props.inputStyle).toEqual(
            expect.objectContaining({
                paddingVertical: 0,
                textAlignVertical: "center",
            }),
        );
    });
});
