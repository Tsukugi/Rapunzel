import { describe, expect, jest, test } from "@jest/globals";
import React from "react";
import renderer, { act } from "react-test-renderer";
import BrowseItem from "../src/components/paper/item/browserItem";

jest.mock("@atsu/lilith", () => ({}));

jest.mock("../src/api/loader", () => ({
    FallbackCacheExtension: "webp",
}));

jest.mock("../themes", () => ({
    LocalTheme: {
        useTheme: () => ({
            colors: {
                backdrop: "backdrop",
                primary: "primary",
                onPrimary: "onPrimary",
            },
        }),
    },
}));

jest.mock("../src/tools/locales", () => ({
    getLocaleEmoji: (lang: string) => `[${lang}]`,
}));

jest.mock("../src/cache/CacheUtils", () => ({
    CacheUtils: {
        replaceExtension: (_src: string, ext: string) => `${_src}.${ext}`,
    },
}));

jest.mock("../src/config/log", () => ({
    RapunzelLog: {
        log: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
    },
}));

describe("BrowseItem", () => {
    const makeBook = (id: string, title: string, languages: string[]) =>
        ({ id, title, availableLanguages: languages } as any);

    test("updates cover and title when receiving a new book", () => {
        const initialBook = makeBook("book-1", "Title One", ["english"]);
        const nextBook = makeBook("book-2", "Title Two", ["japanese"]);

        const component = renderer.create(
            <BrowseItem bookBase={initialBook} cover="cover-1" />,
        );

        let cover = component.root.findByProps({
            testID: "browser-item-cover",
        });
        let title = component.root.findByProps({
            testID: "browser-item-title",
        });

        expect(cover.props.source.uri).toBe("cover-1");
        expect(title.props.title).toContain("Title One");
        expect(title.props.title).toContain("english");

        act(() => {
            component.update(
                <BrowseItem bookBase={nextBook} cover="cover-2" />,
            );
        });

        cover = component.root.findByProps({ testID: "browser-item-cover" });
        title = component.root.findByProps({ testID: "browser-item-title" });

        expect(cover.props.source.uri).toBe("cover-2");
        expect(title.props.title).toContain("Title Two");
        expect(title.props.title).toContain("japanese");
    });
});
