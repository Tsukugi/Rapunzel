import { RapunzelConfig } from "./config";

const log = (...args: unknown[]) => {
    RapunzelConfig.executeOnlyOnDebug<unknown[], void>({
        executable: () => console.log("RapunzelLog: ", ...args),
        args,
    });
};
const warn = (...args: unknown[]) =>
    RapunzelConfig.executeOnlyOnDebug<unknown[], void>({
        executable: () => console.warn("RapunzelLog: ", ...args),
        args,
    });
const error = (...args: unknown[]) =>
    RapunzelConfig.executeOnlyOnDebug<unknown[], void>({
        executable: () => console.error("RapunzelLog: ", ...args),
        args,
    });

export const RapunzelLog = {
    log,
    warn,
    error,
};
