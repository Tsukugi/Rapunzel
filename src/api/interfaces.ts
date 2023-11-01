export namespace NHentai {
    export interface Search {
        created_at: string;
        id: number;
        page: number;
        query: string;
        results: { cover: { uri: string }; id: string }[];
        total_pages: number;
        total_results: number;
        updated_at: string;
    }
}
