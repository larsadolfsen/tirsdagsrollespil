import { ArrowUpFromLine, Dice5, FileText, Pencil } from "lucide-react";
import { AppSidebar } from "./AppSidebar";

export function MobileMenuSidebar({
  isOpen,
  onClose,
  onOpenCharacterSheet,
  onOpenDiceLog,
  onOpenEditCharacter,
  onOpenGainExperience,
}: {
  isOpen: boolean;
  onClose: () => void;
  onOpenCharacterSheet: () => void;
  onOpenDiceLog: () => void;
  onOpenEditCharacter: () => void;
  onOpenGainExperience: () => void;
}) {
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
        <button
          type="button"
          onClick={onOpenCharacterSheet}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50"
        >
          <FileText size={16} aria-hidden="true" />
          Character Sheet
        </button>
        <button
          type="button"
          onClick={onOpenEditCharacter}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50"
        >
          <Pencil size={16} aria-hidden="true" />
          Edit Character
        </button>
        <button
          type="button"
          onClick={onOpenGainExperience}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50"
        >
          <ArrowUpFromLine size={16} aria-hidden="true" />
          Gain Experience
        </button>
        <button
          type="button"
          onClick={onOpenDiceLog}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-4 text-left text-[11px] font-black uppercase tracking-widest text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50"
        >
          <Dice5 size={16} aria-hidden="true" />
          Dice Log
        </button>
      </nav>
    </AppSidebar>
  );
}
