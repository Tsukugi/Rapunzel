import { useLilithNHentai as getLilithNHentai } from "@atsu/lilith-nhentai";
import { useLilithMangaDex as getLilithMangaDex } from "@atsu/lilith-mangadex";
import { getRapunzelStore } from "../store/store";
import { CustomFetch, LilithLanguage, RepositoryBase } from "@atsu/lilith";
import { LilithRepo } from "../store/interfaces";
import { getZenith } from "./zenithApi";

const useReactNativeFetch: CustomFetch = async (url, options) => {
    const response = await fetch(url, {
        method: options.method,
        headers: options.headers,
        credentials: options.credentials,
        body: options.body,
    });

    return {
        text: () => response.text(),
        json: <T>() => response.json() as Promise<T>,
        status: response.status,
    };
};

// TODO implement filter languages on lilith
export const getLilithAPI = (): RepositoryBase => {
    const {
        config: [config],
    } = getRapunzelStore();

    const props = {
        headers: config.apiLoaderConfig,
        fetch: useReactNativeFetch,
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
