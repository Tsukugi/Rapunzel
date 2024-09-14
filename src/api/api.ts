import { useLilithNHentai } from "@atsu/lilith-nhentai";
import { useRapunzelStore } from "../store/store";
import { LilithLanguage } from "@atsu/lilith";

// TODO implement filter languages on lilith
export const useLilithAPI = () => {
    const {
        config: [config],
    } = useRapunzelStore();

    const nhLoader = useLilithNHentai({
        headers: config.apiLoaderConfig,
        options: {
            debug: config.debug,
            requiredLanguages: Object.values(LilithLanguage),
        },
    });

    return nhLoader;
};
