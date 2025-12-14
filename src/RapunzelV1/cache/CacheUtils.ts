// TODO Add the source into the name

import { isNumeric } from "../tools/string";

export interface CachedImageInfo {
    book: string;
    chapter?: string;
    pageNumber?: number;
    extension: string;
}

const getFileName = (info: CachedImageInfo) => {
    const chapter = info.chapter ? `.${info.chapter}` : "";
    const pageNumber = info.pageNumber ? `.${info.pageNumber}` : "";
    const result = `${info.book}${chapter}${pageNumber}.${info.extension}`;

    return result;
};

const removeFileExtension = (path: string) => {
    const fileNameWithoutExtension = path.replace(/\.[^/.]+$/, ""); // Remove everything after the last dot
    return fileNameWithoutExtension;
};

const getFilenameInfo = (filename: string) => {
    const parts = filename.split(".");

    const isSpecialType = isNumeric(parts[1]);
    return {
        id: parts[0],
        page: !isSpecialType ? parts[1] : null,
        type: isSpecialType ? parts[1] : null,
        extension: parts[2],
    };
};

/**
 *  Get word after last dot
 * */
const getExtensionFromUri = (uri: string) => {
    const parts = uri.split(".");
    return parts[parts.length - 1];
};

const replaceExtension = (uri: string, newExt: string) => {
    return `${removeFileExtension(uri)}.${newExt}`;
};

export const CacheUtils = {
    getFilenameInfo,
    getFileName,
    removeFileExtension,
    getExtensionFromUri,
    replaceExtension,
};
