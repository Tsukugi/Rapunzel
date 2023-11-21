import { ViewNames } from "./interfaces";
import { useRapunzelLoader } from "../../api/loader";
import { Book } from "@atsu/lilith";

export interface GoToFirstChapterOrSelectProps {
    book: Book;
    redirect: (to: ViewNames) => void;
}

/**
 * Function to navigate to the first chapter of a book or to the chpater selection view.
 * @param props - The props for the function.
 */
export const goToFirstChapterOrSelectChapter = ({
    book,
    redirect,
}: GoToFirstChapterOrSelectProps) => {
    if (book?.chapters.length === 1) {
        const { loadChapter } = useRapunzelLoader();
        loadChapter(book.chapters[0].id);
        redirect(ViewNames.RapunzelReader);
    } else {
        redirect(ViewNames.RapunzelChapterSelect);
    }
};
