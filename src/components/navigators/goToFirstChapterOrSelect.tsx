import { UsesNavigation, ViewNames } from "./interfaces";
import { getRapunzelLoader } from "../../api/loader";
import { Book } from "@atsu/lilith";

export interface GoToFirstChapterOrSelectProps extends UsesNavigation {
    book: Book;
}

/**
 * Function to navigate to the first chapter of a book or to the chapter selection view.
 * @param props - The props for the function.
 */
export const goToFirstChapterOrSelectChapter = ({
    book,
    navigation,
}: GoToFirstChapterOrSelectProps) => {
    if (book?.chapters.length === 1) {
        const { loadChapter } = getRapunzelLoader();

        loadChapter(book.id, book.chapters[0].id, book.chapters[0]);
        navigation.navigate(ViewNames.RapunzelReader);
    } else {
        navigation.navigate(ViewNames.RapunzelChapterSelect);
    }
};
