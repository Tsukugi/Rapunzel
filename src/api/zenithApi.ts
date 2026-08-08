import {
    RepositoryBase,
    Chapter,
    GetBookOptions,
    SearchQueryOptions,
    BookListResults,
} from "@atsu/lilith";

export const getZenith = (): RepositoryBase => {
    const host = "192.168.0.248";
    const port = 1313;
    const baseUrl = `http://${host}:${port}`;

    const fetchWithQuery = async <T>(
        path: string,
        query?: object,
    ) => {
        const queryString = Object.entries(
            (query ?? {}) as Record<string, unknown>,
        )
            .filter(([, value]) => value !== undefined)
            .map(
                ([key, value]) =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
            )
            .join("&");

        const params = `${queryString ? `?${queryString}` : ""}`;
        const url = `${baseUrl}/${path}${params}`;
        try {
            const response = await fetch(url);
            if (![200, 201].includes(response.status)) {
                throw new Error(`${response.status} - ${response.url}`);
            }
            return response.json() as T;
        } catch (error) {
            console.error(error);
            throw new Error("Not Found");
        }
    };

    return {
        getChapter: async (id: string) => {
            const res = await fetchWithQuery<Chapter>("chapter", { id });
            console.warn(res.pages.length);
            return res;
        },
        getBook: async (id: string, options?: Partial<GetBookOptions>) => {
            void options;
            return fetchWithQuery("book", { id });
        },
        search: async (
            query: string,
            options?: Partial<SearchQueryOptions>,
        ) => {
            return fetchWithQuery("search", { query, ...options });
        },
        getLatestBooks: async (page: number) => {
            const res = await fetchWithQuery<BookListResults>("latest", {
                page,
            });
            return res;
        },
        getRandomBook: async (retry?: number) => {
            return fetchWithQuery("random", { retry });
        },
        getTrendingBooks: async () => {
            return fetchWithQuery("popular");
        },
    };
};
