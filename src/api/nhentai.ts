import { NHentai } from "./interfaces";

const host = "http://192.168.0.133:5000";

const get = async <T>(path: string): Promise<T> => {
    if (!path) throw "[get]: Path not defined";
    const response = await fetch(`${host}${path}`);
    const { result } = await response.json();
    return result;
};

const getRandomBook = async () => {
    const result = await get<NHentai.Book>("/random");
    return result;
};

const search = async (query: string): Promise<NHentai.Search> => {
    const result = await get<NHentai.Search>(`/search?query=${query}`);
    return result;
};

const getByCode = async (code: string): Promise<NHentai.Book> => {
    const result = await get<NHentai.Book>(`/get?identifier=${code}`);
    return result;
};

const getRandomBookFirstChapter = async () => {
    const result = await getRandomBook();
    if (!result?.chapters) return [];
    const { pages } = result.chapters[0];
    const images = pages.map((page: { uri: string }) => page.uri);
    return images;
};

const searchFirstMatch = async (query: string): Promise<string[]> => {
    if (!query) return [];
    const result = await get<NHentai.Search>(`/search?query=${query}`);
    const { results } = result;
    return getByCodeFirstChapter(results[0].id);
};

const getByCodeFirstChapter = async (code: string): Promise<string[]> => {
    const result = await getByCode(code);
    const { pages } = result.chapters[0];
    const images = pages.map((page: { uri: string }) => page.uri);
    return images;
};

export const NHentaiApi = {
    getRandomBook,
    getRandomBookFirstChapter,
    search,
    searchFirstMatch,
    getByCode,
    getByCodeFirstChapter,
};
