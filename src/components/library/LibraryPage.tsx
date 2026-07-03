import { useEffect, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { inlineSubtabButtonActiveClassName, inlineSubtabButtonBaseClassName, inlineSubtabButtonInactiveClassName } from "@/src/lib/tabStyles";
import { BottomSheetPaper, Button, Card, Heading, Text } from "../ui";
import { SheetDataButtonRow, SheetDataPanel } from "../wfrp";
import { bookCatalog, bookCovers, loadChapterContent, type BookMeta } from "../../data/books";
import { ChapterTableOfContents } from "./ChapterTableOfContents";
import { extractHeadings } from "./headingSlug";
import { MarkdownContent } from "./MarkdownContent";

function findChapterIndex(book: BookMeta, chapterId: string): number {
  return book.chapters.findIndex((chapter) => chapter.id === chapterId);
}

export function LibraryPage({
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
  const [sidebarMode, setSidebarMode] = useState<"headings" | "chapters">("headings");

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
    setSidebarMode("headings");
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
        {hasToc ? (
          <div className="flex justify-end lg:hidden">
            <Button variant="subtabAction" onClick={() => setIsContentsOpen(true)}>
              Contents
            </Button>
          </div>
        ) : null}
        {chapterContent === null ? (
          <Text variant="bodyMuted">Loading…</Text>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[288px_minmax(0,1fr)]">
            <aside className="hidden self-start lg:block lg:sticky lg:top-4">
              <Card className="overflow-hidden">
                <div
                  className="flex w-full border-b border-wfrp-border"
                  role="tablist"
                  aria-label="Sidebar navigation"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={sidebarMode === "chapters" || !hasToc}
                    onClick={() => setSidebarMode("chapters")}
                    className={cn(
                      "wfrp-label h-9 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50",
                      hasToc ? "w-1/2" : "w-full",
                      sidebarMode === "chapters" || !hasToc
                        ? inlineSubtabButtonActiveClassName
                        : inlineSubtabButtonInactiveClassName,
                    )}
                  >
                    Book
                  </button>
                  {hasToc ? (
                    <button
                      type="button"
                      role="tab"
                      aria-selected={sidebarMode === "headings"}
                      onClick={() => setSidebarMode("headings")}
                      className={cn(
                        "wfrp-label h-9 w-1/2 cursor-pointer border-l border-black/20 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50",
                        sidebarMode === "headings"
                          ? inlineSubtabButtonActiveClassName
                          : inlineSubtabButtonInactiveClassName,
                      )}
                    >
                      Chapter
                    </button>
                  ) : null}
                </div>
                <div className="px-2 pb-2 pt-2">
                  <p className="wfrp-label mb-1.5 truncate text-wfrp-muted-text">
                    {sidebarMode === "chapters" || !hasToc ? selectedBook.title : selectedChapter.title}
                  </p>
                  {!hasToc || sidebarMode === "chapters" ? (
                    <nav aria-label="Book chapters" className="flex flex-col gap-1">
                      {selectedBook.chapters.map((chapter) => (
                        <button
                          key={chapter.id}
                          type="button"
                          onClick={() => {
                            onSelectChapter(chapter.id);
                            setSidebarMode("headings");
                          }}
                          className={cn(
                            "rounded px-2 py-1 text-sm text-left text-gray-300 transition-colors",
                            "hover:bg-wfrp-control-hover hover:text-gray-100",
                            chapter.id === selectedChapter.id && "bg-wfrp-control-hover text-gray-100",
                          )}
                        >
                          {chapter.title}
                        </button>
                      ))}
                    </nav>
                  ) : (
                    <ChapterTableOfContents headings={headings} title={selectedChapter.title} />
                  )}
                </div>
              </Card>
            </aside>
            <MarkdownContent content={chapterContent} headings={headings} />
          </div>
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
      <div className="w-full max-w-[648px]">
        <SheetDataPanel>
          {bookCatalog.map((book) => (
            <SheetDataButtonRow
              key={book.id}
              className="grid-cols-[1fr_24px] px-4 py-3"
              onClick={() => onSelectBook(book.id)}
            >
              <Text variant="bodyStrong">{book.title}</Text>
              <ChevronRight size={16} className="justify-self-end text-wfrp-muted-text" aria-hidden="true" />
            </SheetDataButtonRow>
          ))}
        </SheetDataPanel>
      </div>
    </div>
  );
}
