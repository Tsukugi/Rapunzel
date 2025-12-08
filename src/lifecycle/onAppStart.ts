import { ViewNames } from "../components/navigators/interfaces";
import { RapunzelLog } from "../config/log";
import { useRapunzelStore } from "../store/store";

export const onAppStart = () => {
    RapunzelLog.warn("[OnAppStart]");
    const {
        config: [config],
    } = useRapunzelStore();

    config.initialView = ViewNames.RapunzelMainFeed;
};
