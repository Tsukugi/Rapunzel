import { ViewNames } from "../components/navigators/interfaces";
import { RapunzelLog } from "../config/log";
import { getRapunzelStore } from "../store/store";

export const onAppStart = () => {
    RapunzelLog.warn("[OnAppStart]");
    const {
        config: [config],
    } = getRapunzelStore();

    // Default to main feed; routes override per navigation.
    config.initialView = ViewNames.RapunzelMainFeed;
};
