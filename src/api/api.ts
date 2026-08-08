import { useLilithNHentai as getLilithNHentai } from "@atsu/lilith-nhentai";
import { useLilithMangaDex as getLilithMangaDex } from "@atsu/lilith-mangadex";
import { getRapunzelStore } from "../store/store";
import { LilithLanguage, RepositoryBase } from "@atsu/lilith";
import { LilithRepo } from "../store/interfaces";
import { getZenith } from "./zenithApi";

// TODO implement filter languages on lilith
export const getLilithAPI = (): RepositoryBase => {
    const {
        config: [config],
    } = getRapunzelStore();

    const props = {
        headers: config.apiLoaderConfig,
        options: {
            debug: config.debug,
            requiredLanguages: Object.values(LilithLanguage),
        },
    };
    switch (config.repository) {
        case LilithRepo.NHentai:
            return getLilithNHentai(props);
        case LilithRepo.MangaDex:
            return getLilithMangaDex(props);
        case LilithRepo.EHentai:
            return getZenith();
    }
};
