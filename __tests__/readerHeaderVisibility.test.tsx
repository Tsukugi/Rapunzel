import React, { forwardRef, useImperativeHandle } from "react";
import renderer, { act } from "react-test-renderer";
import { describe, expect, jest, test } from "@jest/globals";

import {
    ReaderHeaderAutoHideMs,
    ReaderHeaderScrollThreshold,
    useReaderHeaderVisibility,
} from "../src/tools/useReaderHeaderVisibility";

interface HeaderVisibilityHandle {
    onScroll: (offset: number) => void;
}

const Probe = forwardRef<HeaderVisibilityHandle>((_props, ref) => {
    const { visible, onScroll } = useReaderHeaderVisibility("chapter-1");
    useImperativeHandle(ref, () => ({ onScroll }), [onScroll]);
    return <>{visible ? "visible" : "hidden"}</>;
});

describe("reader header visibility", () => {
    test("starts hidden, shows on upward scroll, and hides on downward scroll", () => {
        const ref = React.createRef<HeaderVisibilityHandle>();
        let view!: ReturnType<typeof renderer.create>;
        act(() => {
            view = renderer.create(<Probe ref={ref} />);
        });

        expect(view.toJSON()).toBe("hidden");

        act(() => {
            ref.current?.onScroll(100);
        });
        expect(view.toJSON()).toBe("hidden");

        act(() => {
            ref.current?.onScroll(80);
        });
        expect(view.toJSON()).toBe("visible");

        act(() => {
            ref.current?.onScroll(90);
        });
        expect(view.toJSON()).toBe("hidden");

        view.unmount();
    });

    test("autohides three seconds after the last upward scroll", () => {
        jest.useFakeTimers();
        const ref = React.createRef<HeaderVisibilityHandle>();
        let view!: ReturnType<typeof renderer.create>;
        act(() => {
            view = renderer.create(<Probe ref={ref} />);
        });

        act(() => {
            ref.current?.onScroll(100);
            ref.current?.onScroll(80);
            jest.advanceTimersByTime(ReaderHeaderAutoHideMs - 1);
        });
        expect(view.toJSON()).toBe("visible");

        act(() => {
            jest.advanceTimersByTime(1);
        });
        expect(view.toJSON()).toBe("hidden");

        view.unmount();
        jest.useRealTimers();
    });

    test("ignores small scroll offset jitter", () => {
        const ref = React.createRef<HeaderVisibilityHandle>();
        let view!: ReturnType<typeof renderer.create>;
        act(() => {
            view = renderer.create(<Probe ref={ref} />);
        });

        expect(view.toJSON()).toBe("hidden");

        act(() => {
            ref.current?.onScroll(100);
        });
        expect(view.toJSON()).toBe("hidden");

        act(() => {
            ref.current?.onScroll(99);
        });
        expect(view.toJSON()).toBe("hidden");

        act(() => {
            ref.current?.onScroll(100);
        });
        expect(view.toJSON()).toBe("hidden");

        act(() => {
            ref.current?.onScroll(99);
        });
        expect(view.toJSON()).toBe("hidden");

        act(() => {
            ref.current?.onScroll(100 - ReaderHeaderScrollThreshold);
        });
        expect(view.toJSON()).toBe("visible");

        view.unmount();
    });
});
