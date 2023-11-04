export namespace NHentai {
    export interface Search {
        created_at: string;
        id: string;
        page: number;
        query: string;
        results: Book[];
        total_pages: number;
        total_results: number;
        updated_at: string;
    }

    export interface Book {
        authors: string[];
        chapters: Chapter[];
        chapters_count: number;
        cover: Page;
        created_at: string;
        genres: Genre[];
        id: string;
        thumbnail: Page;
        title: Title;
        updated_at: string;
    }
}

interface Title {
    english: string;
    japanese: string;
    other: string;
}

interface Genre {
    id: string;
    name: string;
}

interface Chapter {
    id: string;
    pages: Page[];
}
interface Page {
    height: number;
    uri: string;
    width: number;
}
