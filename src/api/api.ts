import { useLilithNHentai } from "@atsu/lilith-nhentai";
import { useLilithMangaDex } from "@atsu/lilith-mangadex";
import { useRapunzelStore } from "../store/store";
import { LilithLanguage } from "@atsu/lilith";
import { LilithRepo } from "../store/interfaces";

// TODO implement filter languages on lilith
export const useLilithAPI = () => {
    const {
        config: [config],
    } = useRapunzelStore();

    const props = {
        headers: config.apiLoaderConfig,
        options: {
            debug: config.debug,
            requiredLanguages: Object.values(LilithLanguage),
        },
    };
    switch (config.repository) {
        case LilithRepo.NHentai:
            return useLilithNHentai(props);
        case LilithRepo.MangaDex:
            return useLilithMangaDex(props);
    }
};
