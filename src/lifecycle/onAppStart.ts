import { ViewNames } from "../components/navigators/interfaces";
import { RapunzelLog } from "../config/log";
import { LilithRepo } from "../store/interfaces";
import { useRapunzelStore } from "../store/store";

export const onAppStart = () => {
    RapunzelLog.warn("[OnAppStart]");
    const {
        config: [config],
    } = useRapunzelStore();

    // Here is an easy way to do the auto webview for NH only
    // This is because they have cloudfire clearance requirement
    if (config.repository === LilithRepo.NHentai) {
        config.initialView = ViewNames.RapunzelWebView;
    }
};
