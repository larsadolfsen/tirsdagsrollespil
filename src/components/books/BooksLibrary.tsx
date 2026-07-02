import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { BottomSheetPaper, Button, Card, Heading, Text } from "../ui";
import { SheetDataButtonRow, SheetDataPanel } from "../wfrp";
import { bookCatalog, bookCovers, loadChapterContent, type BookMeta } from "../../data/books";
import { ChapterTableOfContents } from "./ChapterTableOfContents";
import { extractHeadings } from "./headingSlug";
import { MarkdownContent } from "./MarkdownContent";

function findChapterIndex(book: BookMeta, chapterId: string): number {
  return book.chapters.findIndex((chapter) => chapter.id === chapterId);
}

export function BooksLibrary({
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
  const [chapterContent, setChapterContent] = useState<string | null>(null);
  const [isContentsOpen, setIsContentsOpen] = useState(false);

  const selectedBook = bookId
    ? bookCatalog.find((book) => book.id === bookId)
    : undefined;
  const selectedChapter = selectedBook && chapterId
    ? selectedBook.chapters.find((chapter) => chapter.id === chapterId)
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

  useEffect(() => {
    setIsContentsOpen(false);
  }, [selectedChapter]);

  const headings = useMemo(
    () => (chapterContent ? extractHeadings(chapterContent) : []),
    [chapterContent],
  );

  if (selectedBook && selectedChapter) {
    const chapterIndex = findChapterIndex(selectedBook, selectedChapter.id);
    const previousChapter = selectedBook.chapters[chapterIndex - 1];
    const nextChapter = selectedBook.chapters[chapterIndex + 1];
    const hasToc = headings.filter((heading) => heading.level === 2).length >= 2;

    return (
      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Button variant="subtabAction" onClick={() => onSelectChapter(null)}>
            Back to chapters
          </Button>
          {hasToc ? (
            <Button variant="subtabAction" className="lg:hidden" onClick={() => setIsContentsOpen(true)}>
              Contents
            </Button>
          ) : null}
        </div>
        {chapterContent === null ? (
          <Text variant="bodyMuted">Loading…</Text>
        ) : hasToc ? (
          <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="hidden self-start lg:block lg:sticky lg:top-4">
              <Card>
                <div className="p-4">
                  <ChapterTableOfContents headings={headings} title={selectedChapter.title} />
                </div>
              </Card>
            </aside>
            <MarkdownContent content={chapterContent} headings={headings} />
          </div>
        ) : (
          <MarkdownContent content={chapterContent} headings={headings} />
        )}
        {hasToc && isContentsOpen ? (
          <BottomSheetPaper className="lg:hidden" isPullable>
            <div className="flex w-full flex-col gap-3">
              <div className="flex items-center justify-between">
                <Text variant="bodyStrong">Contents</Text>
                <Button variant="subtabAction" onClick={() => setIsContentsOpen(false)}>
                  Close
                </Button>
              </div>
              <ChapterTableOfContents
                headings={headings}
                title={selectedChapter.title}
                onSelect={() => setIsContentsOpen(false)}
              />
            </div>
          </BottomSheetPaper>
        ) : null}
        <div className="flex flex-wrap justify-between gap-3">
          <Button
            variant="subtabAction"
            disabled={!previousChapter}
            onClick={() => previousChapter && onSelectChapter(previousChapter.id)}
          >
            Previous chapter
          </Button>
          <Button
            variant="subtabAction"
            disabled={!nextChapter}
            onClick={() => nextChapter && onSelectChapter(nextChapter.id)}
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
        <Button variant="subtabAction" onClick={() => onSelectBook(null)}>
          Back to books
        </Button>
        <Heading level={2} variant="section">{selectedBook.title}</Heading>
        <SheetDataPanel>
          {selectedBook.chapters.map((chapter) => (
            <SheetDataButtonRow
              key={chapter.id}
              className="grid-cols-[1fr_24px] px-4 py-3"
              onClick={() => onSelectChapter(chapter.id)}
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
            onClick={() => onSelectBook(book.id)}
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
