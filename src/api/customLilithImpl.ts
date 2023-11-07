import {
    UseDomParser,
    UseDomParserImpl,
    ElementProps,
    Attributes,
    CustomFetch,
    CustomFetchResponse,
} from "@atsu/lilith";
import { AnyNode, Cheerio, load } from "cheerio";

export const useCheerioDomParser: UseDomParser = (stringDom: string) => {
    const $ = load(stringDom);

    const parser = (el: Cheerio<AnyNode>): UseDomParserImpl => {
        const find = (query: string) => parser(el.find(query).first());
        const findAll = (query: string) =>
            el
                .find(query)
                .map((_, element) => parser($(element)))
                .get();
        const getElement = (): ElementProps => {
            const attributes: Partial<Attributes> = {
                href: el.attr("href") || "",
                "data-src": el.attr("data-src") || "",
                width: parseInt(el.attr("width") || "0", 10),
                height: parseInt(el.attr("height") || "0", 10),
            };
            return {
                textContent: el.text(),
                attributes,
            };
        };

        return { find, findAll, getElement };
    };

    return parser($("html"));
};

export const customFetchImpl: CustomFetch = async (
    url,
    options,
): Promise<CustomFetchResponse> => {
    const res = await fetch(url, options);
    return {
        text: () => res.text(), // We need this to avoid fetch/node-fetch "cannot find property 'disturbed' from undefined"
        json: <T>() => res.json() as T,
        status: res.status,
    };
};
