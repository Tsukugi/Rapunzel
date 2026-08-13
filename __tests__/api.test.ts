import { beforeEach, describe, expect, jest, test } from "@jest/globals";

type AdapterFetch = (
    url: string,
    options: Record<string, unknown>,
) => Promise<{
    status: number;
    text: () => Promise<string>;
    json: <T>() => Promise<T>;
}>;
type AdapterProps = { fetch?: AdapterFetch };

const mockUseLilithNHentai = jest.fn((props: AdapterProps) => {
    void props;
    return {};
});
const mockUseLilithMangaDex = jest.fn(() => ({}));

jest.mock("@atsu/lilith", () => ({
    LilithLanguage: {
        english: "english",
        spanish: "spanish",
        japanese: "japanese",
        mandarin: "mandarin",
    },
}));

jest.mock("@atsu/lilith-nhentai", () => ({
    useLilithNHentai: mockUseLilithNHentai,
}));

jest.mock("@atsu/lilith-mangadex", () => ({
    useLilithMangaDex: mockUseLilithMangaDex,
}));

jest.mock("../src/api/zenithApi", () => ({
    getZenith: jest.fn(() => ({})),
}));

jest.mock("../src/store/store", () => ({
    getRapunzelStore: () => ({
        config: [
            {
                debug: false,
                apiLoaderConfig: { cookie: "", "User-Agent": "" },
                repository: "NHentai",
            },
        ],
    }),
}));

describe("Rapunzel API transport", () => {
    beforeEach(() => {
        mockUseLilithNHentai.mockClear();
        mockUseLilithMangaDex.mockClear();
    });

    test("passes the native fetch transport to the NHentai adapter", async () => {
        const nativeFetch = jest.fn(async () => ({
            status: 200,
            text: async () => "body",
            json: async () => ({ ok: true }),
        }));
        const previousFetch = globalThis.fetch;
        globalThis.fetch = nativeFetch as unknown as typeof globalThis.fetch;

        const { getLilithAPI } = require("../src/api/api") as typeof import("../src/api/api");

        try {
            getLilithAPI();

            const props = mockUseLilithNHentai.mock.calls[0]?.[0];
            expect(props.fetch).toBeDefined();

            const response = await props.fetch?.("https://example.com", {
                method: "GET",
                headers: {},
                credentials: "include",
            });

            expect(nativeFetch).toHaveBeenCalledWith(
                "https://example.com",
                expect.objectContaining({
                    method: "GET",
                    credentials: "include",
                }),
            );
            expect(response?.status).toBe(200);
            await expect(response?.json()).resolves.toEqual({ ok: true });
        } finally {
            globalThis.fetch = previousFetch;
        }
    });
});
