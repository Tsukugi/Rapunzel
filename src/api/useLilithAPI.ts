import { LilithLanguage, RepositoryBase } from "@atsu/lilith";
import { useLilithHenTag } from "@atsu/lilith-hentag";
import { useLilithMangaDex } from "@atsu/lilith-mangadex";
import { useLilithNHentai } from "@atsu/lilith-nhentai";
import { useRapunzelStore, LilithRepo } from "../store";
import { useZenith } from "../RapunzelV1/api/zenithApi";

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
        case LilithRepo.EHentai:
            return useZenith();
    }
};
