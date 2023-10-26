const host = "http://192.168.0.133:5000";

const get = async (path: string) => {
    const response = await fetch(`${host}${path}`);
    const { result } = await response.json();
    return result;
};

//const imageUri = result.chapters[0].pages[0].uri;
const getRandomCover = async () => {
    const result = await get("/random");
    const imageUri = result.cover.uri;
    console.log(imageUri);
    return imageUri;
};
const getRandomBookFirstChapter = async () => {
    const result = await get("/random");
    const { pages } = result.chapters[0];
    const images = pages.map((page) => page.uri);
    console.log(images);
    return images;
};

const searchFirstMatch = async (query: string) => {
    const result = await get(`/search?query=${query}`);
    const { results } = result;
    const firstMatch = await get(`/get?identifier=${results[0].id}`);
    const { pages } = firstMatch.chapters[0];
    const images = pages.map((page) => page.uri);
    console.log(images);
    return images;
};

const search = async (query: string) => {
    const result = await get(`/search?query=${query}`);
    console.log(result);
    return result;
};

export const NHentai = {
    getRandomCover,
    getRandomBookFirstChapter,
    search,
    searchFirstMatch,
};
