import { useState } from "react";

interface UseTimedEventHandlers {
    onStart: () => void;
    onFinish: () => void;
    onIgnore: () => void;
}

export const useTimedEvent = (delay: number) => {
    const [timer, setTimer] = useState<number | null>(null);
    const event = (handlers: Partial<UseTimedEventHandlers>) => {
        const _handlers: UseTimedEventHandlers = {
            onStart: () => {},
            onFinish: () => {},
            onIgnore: () => {},
            ...handlers,
        };

        const id = setTimeout(() => {
            if (id === timer) {
                setTimer(null);
                return _handlers.onFinish();
            }
            return _handlers.onIgnore();
        }, delay);

        timer && clearTimeout(timer);
        setTimer(id);
        return _handlers.onStart();
    };

    return [event];
};
