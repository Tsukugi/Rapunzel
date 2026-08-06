import { useCallback, useEffect, useRef, useState } from "react";

export const ReaderHeaderAutoHideMs = 3000;
export const ReaderHeaderScrollThreshold = 8;

/**
 * Shows controls while the reader moves toward the beginning of the chapter.
 * Downward movement hides them immediately; when movement stops, the same
 * controls stay visible for the configured timeout.
 */
export const useReaderHeaderVisibility = (resetKey: string) => {
    const [visible, setVisible] = useState(false);
    const previousOffset = useRef(0);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearHideTimer = useCallback(() => {
        if (hideTimer.current === null) return;
        clearTimeout(hideTimer.current);
        hideTimer.current = null;
    }, []);

    const scheduleHide = useCallback(() => {
        clearHideTimer();
        hideTimer.current = setTimeout(() => {
            hideTimer.current = null;
            setVisible(false);
        }, ReaderHeaderAutoHideMs);
    }, [clearHideTimer]);

    const show = useCallback(() => {
        setVisible(true);
        scheduleHide();
    }, [scheduleHide]);

    useEffect(() => {
        previousOffset.current = 0;
        clearHideTimer();
        setVisible(false);

        return clearHideTimer;
    }, [clearHideTimer, resetKey]);

    const onScroll = useCallback(
        (offset: number) => {
            const normalizedOffset = Math.max(0, offset);
            const direction = normalizedOffset - previousOffset.current;

            if (Math.abs(direction) < ReaderHeaderScrollThreshold) return;

            previousOffset.current = normalizedOffset;

            if (direction < 0) {
                show();
                return;
            }

            if (direction > 0) {
                clearHideTimer();
                setVisible(false);
            }
        },
        [clearHideTimer, show],
    );

    return { visible, onScroll };
};
