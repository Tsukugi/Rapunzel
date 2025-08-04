import { RapunzelConfig } from "./config";

const log = (...args: any) => {
    RapunzelConfig.executeOnlyOnDebug({
        executable: () => console.log("RapunzelLog: ", ...args),
        args,
    });
};
const warn = (...args: any[]) =>
    RapunzelConfig.executeOnlyOnDebug({
        executable: () => console.warn("RapunzelLog: ", ...args),
        args,
    });
const error = (...args: any[]) =>
    RapunzelConfig.executeOnlyOnDebug({
        executable: () => console.error("RapunzelLog: ", ...args),
        args,
    });

export const RapunzelLog = {
    log,
    warn,
    error,
};
