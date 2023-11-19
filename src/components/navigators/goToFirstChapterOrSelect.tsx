import { ViewNames } from "./interfaces";
import { useRapunzelLoader } from "../../api/loader";
import { Book } from "@atsu/lilith";
import { RapunzelLog } from "../../config/log";

export interface GoToFirstChapterOrSelectProps {
    book: Book;
    redirect: (to: ViewNames) => void;
}

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
