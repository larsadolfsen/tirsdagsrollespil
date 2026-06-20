import { ArrowUpFromLine, Settings } from "lucide-react";
import { useGameSessionContext } from "../context/GameSessionContext";

interface MobileCharacterHeaderProps {
  campaignName: string;
  characterName: string;
  isMobilePortraitMenuOpen: boolean;
  onClosePortraitMenu: () => void;
  onOpenAdvance: () => void;
  onOpenCharacterActions: () => void;
  onOpenXpDialog: () => void;
  xpCurrent: number;
  xpTotal: number;
}

export function MobileCharacterHeader({
  campaignName,
  characterName,
  isMobilePortraitMenuOpen,
  onClosePortraitMenu,
  onOpenAdvance,
  onOpenCharacterActions,
  onOpenXpDialog,
  xpCurrent,
  xpTotal,
}: MobileCharacterHeaderProps) {
  const { portraitDataUrl } = useGameSessionContext();

  return (
    <section className="md:hidden border-b border-wfrp-border bg-wfrp-surface shadow-lg shadow-black/20">
      <div className="flex h-[60px] items-center">
        <div className="relative ml-3 shrink-0">
          <button
            type="button"
            onClick={onOpenCharacterActions}
            className="wfrp-character-portrait-button flex h-10 w-10 items-center justify-center"
            aria-label="Open character actions"
            aria-haspopup="menu"
            aria-expanded={isMobilePortraitMenuOpen}
          >
            {portraitDataUrl ? (
              <img
                src={portraitDataUrl}
                alt=""
                width={40}
                height={40}
                className="wfrp-character-portrait-image"
              />
            ) : (
              <span
                aria-hidden="true"
                className="wfrp-character-portrait-fallback text-xs"
              >
                {characterName.charAt(0)}
              </span>
            )}
          </button>
          {isMobilePortraitMenuOpen && (
            <div
              className="absolute left-0 top-[calc(100%+0.5rem)] z-40 min-w-44 overflow-hidden rounded border border-wfrp-border bg-wfrp-popover shadow-2xl"
              role="menu"
              aria-label="Character actions"
            >
              <button
                type="button"
                onClick={onOpenAdvance}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                role="menuitem"
              >
                <span>Edit Character</span>
                <ArrowUpFromLine size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onOpenXpDialog}
                className="flex w-full items-center justify-between gap-3 border-t border-white/5 px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                aria-label={`Add XP (${xpCurrent}/${xpTotal})`}
                role="menuitem"
              >
                <span>Add XP</span>
                <ArrowUpFromLine size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onClosePortraitMenu}
                className="flex w-full items-center gap-3 border-t border-white/5 px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                role="menuitem"
              >
                <Settings size={14} />
                Settings
              </button>
            </div>
          )}
        </div>
        <div className="ml-3 flex min-w-0 flex-1 items-center gap-3 text-left">
          <span className="min-w-0">
            <span className="block truncate font-serif text-xl font-bold leading-tight text-gray-100">
              {characterName}
            </span>
            <span className="mt-0.5 block truncate text-[9px] font-black uppercase tracking-[0.22em] text-wfrp-muted-text">
              {campaignName}
            </span>
          </span>
        </div>
      </div>
    </section>
  );
}
