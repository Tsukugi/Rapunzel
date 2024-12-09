import { useLilithNHentai } from "@atsu/lilith-nhentai";
import { useLilithMangaDex } from "@atsu/lilith-mangadex";
import { useLilithHenTag } from "@atsu/lilith-hentag";
import { useRapunzelStore } from "../store/store";
import { LilithLanguage, RepositoryBase } from "@atsu/lilith";
import { LilithRepo } from "../store/interfaces";

// TODO implement filter languages on lilith
export const useLilithAPI = (): RepositoryBase => {
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
        case LilithRepo.HenTag:
            return useLilithHenTag(props);
        case LilithRepo.MangaDex:
            return useLilithMangaDex(props);
    }
};
