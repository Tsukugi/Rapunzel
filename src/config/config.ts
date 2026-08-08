import { getRapunzelStore } from "../store/store";

interface ExecuteOnlyOnDebugProps<TArgs extends unknown[], TResult> {
    executable: (...args: TArgs) => TResult;
    args: TArgs;
}
const executeOnlyOnDebug = <TArgs extends unknown[], TResult>(
    props: ExecuteOnlyOnDebugProps<TArgs, TResult>,
) => {
    const {
        config: [config],
    } = getRapunzelStore();
    if (config.debug) return props.executable(...props.args);
    return null;
};

export const RapunzelConfig = {
    executeOnlyOnDebug,
};
