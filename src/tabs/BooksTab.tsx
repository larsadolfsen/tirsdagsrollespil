import { BooksLibrary } from "../components/books/BooksLibrary";

export function BooksTab({
  bookId,
  chapterId,
  onSelectBook,
  onSelectChapter,
}: {
  bookId: string | null;
  chapterId: string | null;
  onSelectBook: (bookId: string | null) => void;
  onSelectChapter: (chapterId: string | null) => void;
}) {
  return (
    <BooksLibrary
      bookId={bookId}
      chapterId={chapterId}
      onSelectBook={onSelectBook}
      onSelectChapter={onSelectChapter}
    />
  );
}
