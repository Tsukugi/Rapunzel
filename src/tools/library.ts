import { ConfigState, LibraryBook, LibraryState } from '../store';

const buildLibraryState = (
  newLibrary: Record<string, LibraryBook>,
  config: ConfigState,
): LibraryState => {
  const rendered = Object.keys(newLibrary)
    .filter((key) => {
      const [repo] = key.split('.');
      return repo === config.repository;
    })
    .sort((a, b) => {
      const first = newLibrary[a];
      const second = newLibrary[b];
      if (!first || !second) return 1;
      return second.savedAt - first.savedAt;
    });

  return {
    saved: newLibrary,
    rendered,
  };
};

export const LibraryUtils = {
  buildLibraryState,
};
