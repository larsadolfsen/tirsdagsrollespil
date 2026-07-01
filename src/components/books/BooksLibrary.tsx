import { useEffect, useState } from "react";
import { ChevronRight } from "lucide-react";
import { Button, Heading, Text } from "../ui";
import { SheetDataButtonRow, SheetDataPanel } from "../wfrp";
import { bookCatalog, bookCovers, loadChapterContent, type BookMeta } from "../../data/books";
import { MarkdownContent } from "./MarkdownContent";

function findChapterIndex(book: BookMeta, chapterId: string): number {
  return book.chapters.findIndex((chapter) => chapter.id === chapterId);
}

export function BooksLibrary() {
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [chapterContent, setChapterContent] = useState<string | null>(null);

  const selectedBook = selectedBookId
    ? bookCatalog.find((book) => book.id === selectedBookId)
    : undefined;
  const selectedChapter = selectedBook && selectedChapterId
    ? selectedBook.chapters.find((chapter) => chapter.id === selectedChapterId)
    : undefined;

  useEffect(() => {
    if (!selectedBook || !selectedChapter) {
      setChapterContent(null);
      return;
    }

    let isCancelled = false;
    setChapterContent(null);

    void loadChapterContent(selectedBook.id, selectedChapter.id).then((content) => {
      if (!isCancelled) setChapterContent(content);
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedBook, selectedChapter]);

  if (selectedBook && selectedChapter) {
    const chapterIndex = findChapterIndex(selectedBook, selectedChapter.id);
    const previousChapter = selectedBook.chapters[chapterIndex - 1];
    const nextChapter = selectedBook.chapters[chapterIndex + 1];

    return (
      <div className="flex flex-col gap-4 p-4">
        <Button variant="subtabAction" onClick={() => setSelectedChapterId(null)}>
          Back to chapters
        </Button>
        <Heading level={2} variant="section">{selectedChapter.title}</Heading>
        {chapterContent === null ? (
          <Text variant="bodyMuted">Loading…</Text>
        ) : (
          <MarkdownContent content={chapterContent} />
        )}
        <div className="flex flex-wrap justify-between gap-3">
          <Button
            variant="subtabAction"
            disabled={!previousChapter}
            onClick={() => previousChapter && setSelectedChapterId(previousChapter.id)}
          >
            Previous chapter
          </Button>
          <Button
            variant="subtabAction"
            disabled={!nextChapter}
            onClick={() => nextChapter && setSelectedChapterId(nextChapter.id)}
          >
            Next chapter
          </Button>
        </div>
      </div>
    );
  }

  if (selectedBook) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Button variant="subtabAction" onClick={() => setSelectedBookId(null)}>
          Back to books
        </Button>
        <Heading level={2} variant="section">{selectedBook.title}</Heading>
        <SheetDataPanel>
          {selectedBook.chapters.map((chapter) => (
            <SheetDataButtonRow
              key={chapter.id}
              className="grid-cols-[1fr_24px] px-4 py-3"
              onClick={() => setSelectedChapterId(chapter.id)}
            >
              <Text variant="bodyStrong">{chapter.title}</Text>
              <ChevronRight size={16} className="justify-self-end text-wfrp-muted-text" aria-hidden="true" />
            </SheetDataButtonRow>
          ))}
        </SheetDataPanel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="wfrp-landing-list">
        {bookCatalog.map((book) => (
          <button
            key={book.id}
            type="button"
            onClick={() => setSelectedBookId(book.id)}
            className="wfrp-landing-character-card"
            aria-label={`Open ${book.title}`}
          >
            <div className="wfrp-landing-portrait">
              {bookCovers[book.id] ? (
                <img
                  src={bookCovers[book.id]}
                  alt=""
                  className="wfrp-landing-portrait-image"
                />
              ) : (
                <span aria-hidden="true" className="wfrp-landing-initials">
                  {book.title.charAt(0)}
                </span>
              )}
            </div>
            <div className="wfrp-landing-card-body">
              <Heading level={2} variant="card">
                {book.title}
              </Heading>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
