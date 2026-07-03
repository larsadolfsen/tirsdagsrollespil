import { useState } from "react";
import { bookCatalog } from "../../data/books";
import libraryCover from "../../data/books/library-cover.webp";
import { AppSidebar } from "../sidebar/AppSidebar";
import { MainTabMenu } from "../ui";
import { AppHeader, AppHeaderIdentity } from "../ui/AppHeader";

const bookOptions = bookCatalog.map((book) => ({ id: book.id, label: book.title }));

export function LibraryHeader({
  bookId,
  campaignName,
  onSelectBook,
  onNavigateHome,
}: {
  bookId: string | null;
  campaignName: string;
  onSelectBook: (bookId: string | null) => void;
  onNavigateHome: () => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <AppHeader
        portrait={(
          <img
            src={libraryCover}
            alt=""
            className="h-full w-full rounded-sm object-cover shadow-sm"
          />
        )}
        onPortraitClick={onNavigateHome}
        identity={(
          <button
            type="button"
            onClick={onNavigateHome}
            className="min-w-0 w-full text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
          >
            <AppHeaderIdentity name={campaignName} />
          </button>
        )}
        desktopActions={(
          <MainTabMenu
            activeId={bookId ?? ""}
            ariaLabel="Library books"
            options={bookOptions}
            onChange={onSelectBook}
          />
        )}
        onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
      />

      <AppSidebar
        isOpen={isMobileMenuOpen}
        motionKey="library-mobile-menu"
        onClose={() => setIsMobileMenuOpen(false)}
        overlayUntil="desktop"
        side="right"
        title="Library"
        titleId="library-mobile-menu-title"
        closeLabel="Close library menu"
        contentClassName="!p-0"
        trapFocus
        closeOnOutsidePointerDown
      >
        <nav aria-label="Library books" className="divide-y divide-white/5">
          {bookCatalog.map((book) => (
            <button
              key={book.id}
              type="button"
              onClick={() => {
                onSelectBook(book.id);
                setIsMobileMenuOpen(false);
              }}
              className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left wfrp-label text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50"
            >
              {book.title}
            </button>
          ))}
        </nav>
      </AppSidebar>
    </>
  );
}
