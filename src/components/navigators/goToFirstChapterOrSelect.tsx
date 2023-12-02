import { UsesNavigation, ViewNames } from "./interfaces";
import { useRapunzelLoader } from "../../api/loader";
import { Book } from "@atsu/lilith";

export interface GoToFirstChapterOrSelectProps extends UsesNavigation {
    book: Book;
}

/**
 * Function to navigate to the first chapter of a book or to the chpater selection view.
 * @param props - The props for the function.
 */
export const goToFirstChapterOrSelectChapter = ({
    book,
    navigation,
}: GoToFirstChapterOrSelectProps) => {
    if (book?.chapters.length === 1) {
        const { loadChapter } = useRapunzelLoader();
        loadChapter(book.chapters[0].id);
        navigation.navigate(ViewNames.RapunzelReader);
    } else {
        navigation.navigate(ViewNames.RapunzelChapterSelect);
    }
};
