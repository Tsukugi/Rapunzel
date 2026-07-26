import { useCallback, useEffect, useRef, useState } from "react";

export const ReaderHeaderAutoHideMs = 3000;

/**
 * Shows controls while the reader moves toward the beginning of the chapter.
 * Downward movement hides them immediately; when movement stops, the same
 * controls stay visible for the configured timeout.
 */
export const useReaderHeaderVisibility = (resetKey: string) => {
    const [visible, setVisible] = useState(true);
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
        show();

        return clearHideTimer;
    }, [clearHideTimer, resetKey, show]);

    const onScroll = useCallback(
        (offset: number) => {
            const normalizedOffset = Math.max(0, offset);
            const direction = normalizedOffset - previousOffset.current;
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
