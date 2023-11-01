import { DeviceCache, StartLoadingImagesProps } from "../cache/cache";
import { NHentaiApi } from "./nhentai";

export const requestSearch = async (searchValue: string) => {
    if (!searchValue) return;
    const uris: string[] = await NHentaiApi.searchFirstMatch(searchValue);
    return uris;
};

export const loadImageList = async ({
    data,
    onImageLoaded,
}: StartLoadingImagesProps) => {
    if (data.length === 0) return;
    DeviceCache.startLoadingImages({
        data,
        onImageLoaded,
    });
};
