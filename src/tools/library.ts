import { RapunzelLog } from "../config/log";
import { ConfigState, LibraryBook, LibraryState } from "../store/interfaces";

const buildLibraryState = (
    newLibrary: Record<string, LibraryBook>,
    config: ConfigState,
): LibraryState => {
    const newState = {
        saved: newLibrary,
        rendered: Object.keys(newLibrary)
            .filter((key) => {
                const [repo] = key.split("."); // Example "Repo.BookId"
                return repo === config.repository;
            })
            .sort((a, b) => {
                if (!newLibrary[a] || !newLibrary[b]) return 1;
                // Sort asc (newer on top)
                return newLibrary[b].savedAt - newLibrary[a].savedAt;
            }),
    };

    RapunzelLog.log(newState.rendered.map((key) => newLibrary[key].cover.uri));
    return newState;
};

export const LibraryUtils = { buildLibraryState };
