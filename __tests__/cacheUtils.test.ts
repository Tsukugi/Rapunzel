import { describe, expect, test } from "@jest/globals";
import { CacheUtils } from "../src/cache/CacheUtils";

describe("CacheUtils", () => {
    test("builds filenames with optional fields", () => {
        expect(
            CacheUtils.getFileName({
                book: "book",
                extension: "png",
            }),
        ).toBe("book.png");

        expect(
            CacheUtils.getFileName({
                book: "book",
                chapter: "ch1",
                pageNumber: 5,
                extension: "jpg",
            }),
        ).toBe("book.ch1.5.jpg");
    });

    test("parses filename parts including numeric type", () => {
        expect(CacheUtils.getFilenameInfo("abc.def.jpg")).toEqual({
            id: "abc",
            page: "def",
            type: null,
            extension: "jpg",
        });
        expect(CacheUtils.getFilenameInfo("abc.123.jpg")).toEqual({
            id: "abc",
            page: null,
            type: "123",
            extension: "jpg",
        });
    });

    test("gets and replaces extensions", () => {
        expect(CacheUtils.getExtensionFromUri("path/to/file.webp")).toBe("webp");
        expect(CacheUtils.removeFileExtension("path/to/file.webp")).toBe(
            "path/to/file",
        );
        expect(CacheUtils.replaceExtension("path/to/file.webp", "png")).toBe(
            "path/to/file.png",
        );
    });
});
