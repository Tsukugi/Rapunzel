import { Book, BookBase } from '@atsu/lilith';
import { useRapunzelLoader } from '../api/loader';
import { RapunzelStorage } from '../storage/rapunzelStorage';
import { DateUtils } from '../tools/date';
import { LibraryUtils } from '../tools/library';
import { useRapunzelStore, LibraryBook } from '../store';

export const useLibraryManager = () => {
  const {
    config: [config],
    library: [library],
    ui: [ui],
  } = useRapunzelStore();
  const loader = useRapunzelLoader();

  const getLibraryId = (bookId: string) => `${config.repository}.${bookId}`;
  const isSaved = (bookId: string) => !!library.saved[getLibraryId(bookId)];

  const persistLibrary = async (saved: Record<string, LibraryBook>) => {
    const { rendered } = LibraryUtils.buildLibraryState(saved, config);
    library.saved = saved;
    library.rendered = rendered;
    await RapunzelStorage.saveLibrary(saved);
  };

  const saveBook = async (book: Book) => {
    const id = getLibraryId(book.id);
    const nextSaved = {
      ...library.saved,
      [id]: { ...book, savedAt: DateUtils.getEpoch() },
    };
    await persistLibrary(nextSaved);
    ui.snackMessage = `Saved "${book.title || book.id}" to library`;
    return id;
  };

  const removeBook = async (bookBase: BookBase) => {
    const id = getLibraryId(bookBase.id);
    if (!library.saved[id]) return;
    const nextSaved = { ...library.saved };
    delete nextSaved[id];
    await persistLibrary(nextSaved);
    ui.snackMessage = `Removed "${bookBase.title || bookBase.id}" from library`;
  };

  const toggleLibrary = async (bookBase: BookBase) => {
    if (isSaved(bookBase.id)) {
      await removeBook(bookBase);
      return false;
    }

    const book = await loader.loadBook(bookBase.id, {
      chapterList: { page: 1, size: 10, orderBy: 'desc' },
    });
    if (!book) return false;
    await saveBook(book);
    return true;
  };

  return {
    getLibraryId,
    isSaved,
    saveBook,
    removeBook,
    toggleLibrary,
  };
};
