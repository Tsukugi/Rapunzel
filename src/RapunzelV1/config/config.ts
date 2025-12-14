import { useRapunzelStore } from "../store/store";

interface ExecuteOnlyOnDebugProps<T> {
    executable: (...args: any[]) => T;
    args: any[];
}
const executeOnlyOnDebug = <T>(props: ExecuteOnlyOnDebugProps<T>) => {
    const {
        config: [config],
    } = useRapunzelStore();
    if (config.debug) return props.executable(...props.args);
    return null;
};

export const RapunzelConfig = {
    executeOnlyOnDebug,
};
