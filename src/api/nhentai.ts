import { NHentai } from "./interfaces";

const host = "http://192.168.0.133:5000";

const get = async (path: string) => {
    if (!path) throw "[get]: Path not defined";
    const response = await fetch(`${host}${path}`);
    const { result } = await response.json();
    return result;
};

const getRandomCover = async () => {
    const result = await get("/random");
    const imageUri = result.cover.uri;
    return imageUri;
};
const getRandomBookFirstChapter = async () => {
    const result = await get("/random");
    const { pages } = result.chapters[0];
    const images = pages.map((page: { uri: string }) => page.uri);
    return images;
};

const searchFirstMatch = async (query: string) => {
    const result = await get(`/search?query=${query}`);
    const { results } = result;
    return getByCode(results[0].id);
};

const search = async (query: string): Promise<NHentai.Search> => {
    const result = await get(`/search?query=${query}`);
    return result;
};

const getByCode = async (code: string): Promise<string[]> => {
    const result = await get(`/get?identifier=${code}`);
    const { pages } = result.chapters[0];
    const images = pages.map((page: { uri: string }) => page.uri);
    return images;
};

export const NHentaiApi = {
    getRandomCover,
    getRandomBookFirstChapter,
    search,
    searchFirstMatch,
    getByCode,
};
