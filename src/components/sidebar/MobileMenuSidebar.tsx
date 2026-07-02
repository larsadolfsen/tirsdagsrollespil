import { useState } from "react";
import { ArrowUpFromLine, BookOpen, ChevronDown, Dice5, ExternalLink, FileText, Pencil } from "lucide-react";
import { bookCatalog } from "../../data/books";
import { buildCampaignLibraryPath } from "../../lib/campaignRoutes";
import { AppSidebar } from "./AppSidebar";

const menuButtonClassName =
  "flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left wfrp-label text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50";

function openInNewTab(path: string) {
  window.open(path, "_blank", "noopener,noreferrer");
}

export function MobileMenuSidebar({
  isOpen,
  campaignId,
  onClose,
  onOpenCharacterSheet,
  onOpenDiceLog,
  onOpenEditCharacter,
  onOpenGainExperience,
}: {
  isOpen: boolean;
  campaignId: string;
  onClose: () => void;
  onOpenCharacterSheet: () => void;
  onOpenDiceLog: () => void;
  onOpenEditCharacter: () => void;
  onOpenGainExperience: () => void;
}) {
  const [isLibraryExpanded, setIsLibraryExpanded] = useState(false);

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="mobile-menu-sidebar"
      onClose={onClose}
      overlayUntil="desktop"
      side="right"
      title="Menu"
      titleId="mobile-menu-sidebar-title"
      closeLabel="Close menu"
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <nav aria-label="Mobile menu" className="divide-y divide-white/5">
        <button type="button" onClick={onOpenCharacterSheet} className={menuButtonClassName}>
          <FileText size={16} aria-hidden="true" />
          Character Sheet
        </button>
        <button type="button" onClick={onOpenEditCharacter} className={menuButtonClassName}>
          <Pencil size={16} aria-hidden="true" />
          Edit Character
        </button>
        <button type="button" onClick={onOpenGainExperience} className={menuButtonClassName}>
          <ArrowUpFromLine size={16} aria-hidden="true" />
          Gain Experience
        </button>
        <button type="button" onClick={onOpenDiceLog} className={menuButtonClassName}>
          <Dice5 size={16} aria-hidden="true" />
          Dice Log
        </button>
        <div>
          <button
            type="button"
            onClick={() => setIsLibraryExpanded((expanded) => !expanded)}
            className={menuButtonClassName}
            aria-expanded={isLibraryExpanded}
            aria-controls="mobile-menu-library-list"
          >
            <BookOpen size={16} aria-hidden="true" />
            Library
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`ml-auto transition-transform ${isLibraryExpanded ? "rotate-180" : ""}`}
            />
          </button>
          {isLibraryExpanded ? (
            <div id="mobile-menu-library-list" className="bg-wfrp-surface-raised/40">
              <button
                type="button"
                onClick={() => openInNewTab(buildCampaignLibraryPath({ campaignId }))}
                className={`${menuButtonClassName} pl-10`}
              >
                <ExternalLink size={14} aria-hidden="true" />
                Library overview
              </button>
              {bookCatalog.map((book) => (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => openInNewTab(buildCampaignLibraryPath({ campaignId, bookId: book.id }))}
                  className={`${menuButtonClassName} pl-10`}
                >
                  <ExternalLink size={14} aria-hidden="true" />
                  {book.title}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </nav>
    </AppSidebar>
  );
}
