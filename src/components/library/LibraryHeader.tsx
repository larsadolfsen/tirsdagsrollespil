import { useState } from "react";
import { Menu } from "lucide-react";
import { bookCatalog } from "../../data/books";
import { AppSidebar } from "../sidebar/AppSidebar";
import { MainTabMenu, WfrpStandardIcon } from "../ui";

const bookOptions = bookCatalog.map((book) => ({ id: book.id, label: book.title }));

export function LibraryHeader({
  bookId,
  onSelectBook,
}: {
  bookId: string | null;
  onSelectBook: (bookId: string | null) => void;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <section className="flex h-14 max-h-14 items-center gap-4 overflow-visible rounded-t border-b border-t-4 border-wfrp-border border-t-wfrp-red bg-sidebar px-3 py-1">
        <button
          type="button"
          onClick={() => onSelectBook(null)}
          className="min-w-0 cursor-pointer overflow-hidden text-ellipsis whitespace-nowrap text-left font-serif text-base font-semibold leading-tight tracking-tight transition-colors hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 sm:text-xl"
        >
          Library
        </button>

        <div className="hidden h-12 items-stretch sm:flex ml-auto">
          <MainTabMenu
            activeId={bookId ?? ""}
            ariaLabel="Library books"
            options={bookOptions}
            onChange={onSelectBook}
          />
        </div>

        <WfrpStandardIcon
          onClick={() => setIsMobileMenuOpen(true)}
          className="ml-auto sm:hidden"
          label="Open library menu"
          aria-haspopup="dialog"
          icon={<Menu />}
        />
      </section>

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
