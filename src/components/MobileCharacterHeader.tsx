import { Menu, Settings } from "lucide-react";
import { useGameSessionContext } from "../context/GameSessionContext";

interface MobileCharacterHeaderProps {
  campaignName: string;
  characterName: string;
  isMobileNavigationOpen: boolean;
  isMobilePortraitMenuOpen: boolean;
  onClosePortraitMenu: () => void;
  onOpenAdvance: () => void;
  onOpenCharacterActions: () => void;
  onOpenCharacterList: () => void;
  onOpenNavigation: () => void;
  xpCurrent: number;
  xpTotal: number;
}

export function MobileCharacterHeader({
  campaignName,
  characterName,
  isMobileNavigationOpen,
  isMobilePortraitMenuOpen,
  onClosePortraitMenu,
  onOpenAdvance,
  onOpenCharacterActions,
  onOpenCharacterList,
  onOpenNavigation,
  xpCurrent,
  xpTotal,
}: MobileCharacterHeaderProps) {
  const { portraitDataUrl } = useGameSessionContext();

  return (
    <section className="md:hidden border-b border-wfrp-border bg-wfrp-surface shadow-lg shadow-black/20">
      <div className="flex h-[60px] items-center">
        <button
          type="button"
          onClick={onOpenNavigation}
          className="flex h-full w-14 shrink-0 items-center justify-center text-wfrp-muted-text transition-colors hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
          aria-label="Open navigation drawer"
          aria-haspopup="dialog"
          aria-expanded={isMobileNavigationOpen}
        >
          <Menu size={18} />
        </button>
        <button
          type="button"
          onClick={onOpenCharacterList}
          className="flex min-w-0 flex-1 items-center gap-3 text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
          aria-label="Change character"
        >
          <span className="min-w-0">
            <span className="block truncate font-serif text-xl font-bold leading-tight text-gray-100">
              {characterName}
            </span>
            <span className="mt-0.5 block truncate text-[9px] font-black uppercase tracking-[0.22em] text-wfrp-muted-text">
              {campaignName}
            </span>
          </span>
        </button>
        <div className="relative mr-3 shrink-0">
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
              className="absolute right-0 top-[calc(100%+0.5rem)] z-40 min-w-44 overflow-hidden rounded border border-wfrp-border bg-wfrp-popover shadow-2xl"
              role="menu"
              aria-label="Character actions"
            >
              <button
                type="button"
                onClick={onOpenAdvance}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-[11px] font-black uppercase tracking-widest text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                role="menuitem"
              >
                <span>Advance</span>
                <span className="text-xs font-bold text-blue-400">{xpCurrent}/{xpTotal}</span>
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
      </div>
    </section>
  );
}
