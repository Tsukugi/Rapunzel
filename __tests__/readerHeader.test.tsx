import { describe, expect, jest, test } from "@jest/globals";
import React from "react";
import renderer from "react-test-renderer";

import { ReaderImageFit, ReaderMode } from "../src/store/interfaces";

const mockReact = React;
type MockProps = Record<string, unknown>;

jest.mock("react-native-paper", () => {
    const component = (name: string) => (props: MockProps) =>
        mockReact.createElement(name, props);
    const Dialog = Object.assign(component("Dialog"), {
        Title: component("DialogTitle"),
        Content: component("DialogContent"),
        Actions: component("DialogActions"),
    });

    return {
        Appbar: {
            Action: component("AppbarAction"),
            BackAction: component("AppbarBackAction"),
            Content: component("AppbarContent"),
            Header: component("AppbarHeader"),
        },
        Button: component("Button"),
        Dialog,
        Portal: component("Portal"),
        RadioButton: {
            Group: component("RadioButtonGroup"),
            Item: component("RadioButtonItem"),
        },
        Text: component("Text"),
    };
});

jest.mock("../src/components/paper/RapunzelMenu", () => ({
    RapunzelMenu: (props: MockProps) =>
        mockReact.createElement("RapunzelMenu", props),
}));

import ReaderHeader from "../src/components/reader/readerHeader";

describe("ReaderHeader layout", () => {
    test("keeps the Paper header root layer measurable when overlaid", () => {
        const component = renderer.create(
            <ReaderHeader
                navigation={{ goBack: jest.fn() } as unknown as never}
                title="Book 1"
                visible
                saved={false}
                mode={ReaderMode.Scroll}
                imageFit={ReaderImageFit.Width}
                onToggleSaved={jest.fn()}
                onModeChange={jest.fn()}
                onImageFitChange={jest.fn()}
            />,
        );

        const overlay = component.root.findByProps({
            testID: "reader-header-overlay",
        });
        const header = component.root.findAll(
            (node) => String(node.type) === "AppbarHeader",
        )[0];

        expect(overlay.props.style).toEqual(
            expect.objectContaining({
                left: 0,
                position: "absolute",
                right: 0,
            }),
        );
        expect(header.props.style).not.toEqual(
            expect.objectContaining({ position: "absolute" }),
        );
    });
});
