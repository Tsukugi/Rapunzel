import { describe, expect, jest, test } from "@jest/globals";
import React from "react";
import renderer from "react-test-renderer";

const mockReact = React;

jest.mock("react-native-paper", () => {
    return {
        Appbar: {
            Action: (props: any) =>
                mockReact.createElement("AppbarAction", props),
            Content: (props: any) =>
                mockReact.createElement("AppbarContent", props),
            Header: (props: any) =>
                mockReact.createElement("AppbarHeader", props),
        },
    };
});

jest.mock("../src/store/store", () => ({
    useRapunzelStore: () => ({
        reader: [{}],
        header: [{ searchValue: "" }],
        loading: [{}, jest.fn()],
    }),
}));

jest.mock("../src/components/paper/header/headerLeftBtn", () => {
    return () => mockReact.createElement("HeaderLeftBtn");
});

jest.mock("../src/components/paper/header/search", () => {
    return () => mockReact.createElement("PaperSearch");
});

jest.mock("../src/components/paper/RapunzelMenu", () => {
    return {
        RapunzelMenu: () => mockReact.createElement("RapunzelMenu"),
    };
});

jest.mock("../src/config/log", () => ({
    RapunzelLog: {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

import HeaderBar from "../src/components/paper/header/headerBar";

describe("HeaderBar", () => {
    test("does not reserve empty content space when search is shown", () => {
        const component = renderer.create(
            <HeaderBar
                navigation={{ navigate: jest.fn() } as any}
                showSearch
                leftMode={undefined}
                onBack={jest.fn()}
                openMenu={jest.fn()}
                openOptions={jest.fn()}
                openSearch={jest.fn()}
                onSubmit={jest.fn()}
            />,
        );

        expect(
            component.root.findAll((node) => String(node.type) === "AppbarContent"),
        ).toHaveLength(0);
    });
});
