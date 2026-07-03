import { useEffect, useMemo, useState } from "react";
import { ChevronRight, SquareMenu } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { inlineSubtabButtonActiveClassName, inlineSubtabButtonBaseClassName, inlineSubtabButtonInactiveClassName } from "@/src/lib/tabStyles";
import { BottomSheetPaper, Button, Card, Heading, Text } from "../ui";
import { bookCatalog, bookCovers, loadChapterContent, type BookMeta } from "../../data/books";
import { ChapterHeading } from "./ChapterDivider";
import { ChapterTableOfContents } from "./ChapterTableOfContents";
import { LibraryNavList } from "./LibraryNavList";
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
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [sidebarMode, setSidebarMode] = useState<"headings" | "chapters">("chapters");

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
    setIsNavOpen(false);
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
                    Chapters
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
                      Content
                    </button>
                  ) : null}
                </div>
                <div className="px-2 pb-2">
                  <p className="wfrp-label mb-1.5 mt-2 truncate pl-2 pt-2 text-wfrp-muted-text">
                    {sidebarMode === "chapters" || !hasToc ? selectedBook.title : selectedChapter.title}
                  </p>
                  {!hasToc || sidebarMode === "chapters" ? (
                    <LibraryNavList
                      ariaLabel="Book chapters"
                      items={selectedBook.chapters.map((chapter) => ({
                        id: chapter.id,
                        label: chapter.title,
                        isActive: chapter.id === selectedChapter.id,
                        onClick: () => { onSelectChapter(chapter.id); setSidebarMode("headings"); },
                      }))}
                    />
                  ) : (
                    <ChapterTableOfContents headings={headings} title={selectedChapter.title} />
                  )}
                </div>
              </Card>
            </aside>
            <MarkdownContent content={chapterContent} headings={headings} />
          </div>
        )}
        <Button
          variant="fab"
          aria-label="Open navigation"
          onClick={() => setIsNavOpen(true)}
        >
          <SquareMenu aria-hidden="true" className="h-6 w-6" />
        </Button>
        {isNavOpen ? (
          <BottomSheetPaper isPullable onDismiss={() => setIsNavOpen(false)}>
            <div
              className="shrink-0 flex w-full gap-1 border-b border-wfrp-border pb-2"
              role="tablist"
              aria-label="Sidebar navigation"
            >
              <button
                type="button"
                role="tab"
                aria-selected={sidebarMode === "chapters" || !hasToc}
                onClick={() => setSidebarMode("chapters")}
                className={cn(
                  "wfrp-label h-9 cursor-pointer rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50",
                  hasToc ? "w-1/2" : "w-full",
                  sidebarMode === "chapters" || !hasToc
                    ? inlineSubtabButtonActiveClassName
                    : inlineSubtabButtonInactiveClassName,
                )}
              >
                Chapters
              </button>
              {hasToc ? (
                <button
                  type="button"
                  role="tab"
                  aria-selected={sidebarMode === "headings"}
                  onClick={() => setSidebarMode("headings")}
                  className={cn(
                    "wfrp-label h-9 w-1/2 cursor-pointer rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50",
                    sidebarMode === "headings"
                      ? inlineSubtabButtonActiveClassName
                      : inlineSubtabButtonInactiveClassName,
                  )}
                >
                  Content
                </button>
              ) : null}
            </div>
            <p className="shrink-0 wfrp-label truncate py-2 text-wfrp-muted-text">
              {sidebarMode === "chapters" || !hasToc ? selectedBook.title : selectedChapter.title}
            </p>
            <div className="overflow-y-auto flex-1 min-h-0 pb-2">
              {!hasToc || sidebarMode === "chapters" ? (
                <LibraryNavList
                  ariaLabel="Book chapters"
                  items={selectedBook.chapters.map((chapter) => ({
                    id: chapter.id,
                    label: chapter.title,
                    isActive: chapter.id === selectedChapter.id,
                    onClick: () => {
                      onSelectChapter(chapter.id);
                      setSidebarMode("headings");
                      setIsNavOpen(false);
                    },
                  }))}
                />
              ) : (
                <ChapterTableOfContents
                  headings={headings}
                  title={selectedChapter.title}
                  onSelect={() => setIsNavOpen(false)}
                />
              )}
            </div>
          </BottomSheetPaper>
        ) : null}
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
        <div className="w-full max-w-[648px] divide-y divide-wfrp-border">
          {selectedBook.chapters.map((chapter) => (
            <button
              key={chapter.id}
              type="button"
              onClick={() => onSelectChapter(chapter.id)}
              className="flex w-full items-center justify-between rounded p-3 text-left transition-colors hover:bg-wfrp-control-hover"
            >
              <Text variant="bodyStrong">{chapter.title}</Text>
              <ChevronRight size={16} className="shrink-0 text-wfrp-muted-text" aria-hidden="true" />
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="w-full max-w-[648px]">
        <ChapterHeading>Library</ChapterHeading>
      </div>
      <div className="w-full max-w-[648px] divide-y divide-wfrp-border">
        {bookCatalog.map((book) => (
          <button
            key={book.id}
            type="button"
            onClick={() => onSelectBook(book.id)}
            className="flex w-full cursor-pointer items-center gap-3 rounded p-3 text-left transition-colors hover:bg-wfrp-control-hover"
          >
            {bookCovers[book.id] ? (
              <img
                src={bookCovers[book.id]}
                alt=""
                className="h-14 w-10 shrink-0 rounded-sm object-cover shadow-sm"
              />
            ) : (
              <div className="h-14 w-10 shrink-0 rounded-sm bg-wfrp-surface" />
            )}
            <Text variant="bodyStrong" className="flex-1">{book.title}</Text>
            <ChevronRight size={16} className="shrink-0 text-wfrp-muted-text" aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
