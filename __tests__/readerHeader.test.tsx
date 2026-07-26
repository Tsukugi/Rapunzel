import { describe, expect, jest, test } from "@jest/globals";
import React from "react";
import renderer from "react-test-renderer";

import { ReaderImageFit, ReaderMode } from "../src/store/interfaces";

const mockReact = React;

jest.mock("react-native-paper", () => {
    const component = (name: string) => (props: any) =>
        mockReact.createElement(name, props);
    const Dialog = component("Dialog") as any;
    Dialog.Title = component("DialogTitle");
    Dialog.Content = component("DialogContent");
    Dialog.Actions = component("DialogActions");

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
    RapunzelMenu: (props: any) =>
        mockReact.createElement("RapunzelMenu", props),
}));

import ReaderHeader from "../src/components/reader/readerHeader";

describe("ReaderHeader layout", () => {
    test("keeps the Paper header root layer measurable when overlaid", () => {
        const component = renderer.create(
            <ReaderHeader
                navigation={{ goBack: jest.fn() } as any}
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
        const header = component.root.findByType("AppbarHeader" as any);

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
