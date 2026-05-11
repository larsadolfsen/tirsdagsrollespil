import { type ReactNode, useEffect, useRef, useState } from "react";
import { Check, ChevronDown, Dice5, MoreHorizontal, Plus, Settings } from "lucide-react";
import type { ResolvedCharacterRecord } from "../data/characters/resolved";
import type { CharacterSummary } from "../data/repository";
import { UI_LABELS } from "../labels";

export function CharacterHeader({
  characterData,
  availableCharacters,
  selectedCharacterId,
  xpCurrent,
  headerResources,
  onSelectCharacter,
  onCreateCharacter,
  onOpenDice,
  onOpenAdvance,
}: {
  characterData: ResolvedCharacterRecord;
  availableCharacters: CharacterSummary[];
  selectedCharacterId: string;
  xpCurrent: number;
  headerResources?: ReactNode;
  onSelectCharacter: (characterId: string) => void;
  onCreateCharacter: () => void;
  onOpenDice: () => void;
  onOpenAdvance: () => void;
}) {
  const [isCampaignMenuOpen, setIsCampaignMenuOpen] = useState(false);
  const campaignMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCampaignMenuOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (isCampaignMenuOpen && !campaignMenuRef.current?.contains(event.target as Node)) {
        setIsCampaignMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsCampaignMenuOpen(false);
      }
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isCampaignMenuOpen]);

  return (
    <section className="flex min-h-[60px] flex-col gap-2 overflow-visible rounded-t border-b border-wfrp-border bg-wfrp-surface px-3 py-2 sm:min-h-0 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
      <div className="flex min-w-0 items-center gap-2 sm:contents">
        <div className="relative order-3 flex-shrink-0 sm:order-none">
          <div className="h-10 w-10 overflow-hidden rounded-full border border-wfrp-gold p-0.5 shadow-inner transition-all hover:brightness-110 sm:h-12 sm:w-12">
            <img
              src="https://picsum.photos/seed/knight/200/200"
              alt="Portrait"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover grayscale brightness-90"
            />
          </div>
        </div>

        <div className="order-2 flex min-w-0 flex-1 flex-col justify-center overflow-hidden sm:order-none sm:min-w-[160px]">
          <h1 className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-base font-bold leading-tight tracking-tight sm:text-xl">
            {characterData.name}
          </h1>
          <div className="overflow-hidden text-ellipsis whitespace-nowrap font-serif text-[9px] italic text-gray-500 sm:text-[10px]">
            {characterData.race} {characterData.career} 1
          </div>
        </div>
      </div>

      <div className="order-1 flex min-w-0 flex-wrap items-center justify-start gap-2 sm:order-none sm:ml-auto sm:justify-end sm:gap-4">
        {headerResources && (
          <div className="flex min-w-0 max-w-full items-center gap-2 overflow-x-auto pb-1 pr-1 no-scrollbar sm:max-w-[min(100%,58rem)] sm:gap-3 sm:overflow-visible sm:pb-0 sm:pr-0">
            {headerResources}
            <div className="h-8 w-[1px] shrink-0 bg-wfrp-border opacity-50" />
          </div>
        )}

        <div className="flex items-center gap-1 group/campaign transition-colors">
          <div className="relative hidden sm:block" ref={campaignMenuRef}>
            <div className="flex overflow-hidden rounded border border-white/5 bg-black/20 transition-colors hover:bg-wfrp-surface-muted-hover">
              <button
                onClick={() => setIsCampaignMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 px-2 py-0.5 text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                aria-label="Open character selection"
                aria-haspopup="menu"
                aria-expanded={isCampaignMenuOpen}
              >
                <div className="flex flex-col">
                  <span className="text-[8px] font-bold text-gray-500 uppercase leading-none">
                    {UI_LABELS.CAMPAIGN_HEADER}
                  </span>
                  <span className="text-[11px] font-semibold text-gray-400 whitespace-nowrap group-hover/campaign:text-wfrp-gold transition-colors">
                    {UI_LABELS.CAMPAIGN_NAME}
                  </span>
                </div>
                <ChevronDown
                  size={12}
                  className={`text-gray-500 transition-transform ${isCampaignMenuOpen ? "rotate-180 text-wfrp-gold" : "group-hover/campaign:text-wfrp-gold"}`}
                />
              </button>
              <div className="my-1 h-5 w-[1px] bg-wfrp-border opacity-60" />
              <button
                onClick={() => {
                  onOpenAdvance();
                  setIsCampaignMenuOpen(false);
                }}
                className="flex min-w-9 flex-col items-center px-2 py-0.5 transition-colors hover:bg-wfrp-surface-muted-hover cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                aria-label="Open Advance tab"
              >
                <span className="text-[8px] font-bold text-gray-500 uppercase leading-none">Exp</span>
                <span className="text-[11px] font-bold text-blue-400 whitespace-nowrap">
                  {xpCurrent}/{characterData.xpTotal}
                </span>
              </button>
            </div>

            {isCampaignMenuOpen && (
              <div
                className="absolute right-0 top-[calc(100%+0.5rem)] z-30 min-w-[240px] overflow-hidden rounded-md border border-wfrp-brass-border bg-wfrp-popover shadow-wfrp-popover"
                role="menu"
                aria-label="Character selection"
              >
                <div className="border-b border-wfrp-border-muted px-3 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-gray-500">
                  Characters
                </div>
                <div className="p-1">
                  {availableCharacters.map((character) => {
                    const isSelected = character.id === selectedCharacterId;

                    return (
                      <button
                        key={character.id}
                        onClick={() => {
                          onSelectCharacter(character.id);
                          setIsCampaignMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded px-3 py-2 text-left transition-colors ${
                          isSelected
                            ? "bg-wfrp-gold-surface text-wfrp-gold"
                            : "text-gray-200 hover:bg-wfrp-surface-raised"
                        }`}
                        role="menuitemradio"
                        aria-checked={isSelected}
                      >
                        <div className="min-w-0">
                          <div className="truncate text-[12px] font-semibold">{character.name}</div>
                          <div className="text-[9px] uppercase tracking-[0.18em] text-gray-500">
                            {character.rulesetId}
                          </div>
                        </div>
                        <span className="ml-3 flex h-4 w-4 items-center justify-center">
                          {isSelected ? <Check size={12} /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="border-t border-wfrp-border-muted p-1">
                  <button
                    onClick={() => {
                      onCreateCharacter();
                      setIsCampaignMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[12px] font-semibold text-gray-400 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold"
                    role="menuitem"
                  >
                    <Plus size={12} />
                    Create a new one
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="hidden h-4 w-[1px] bg-wfrp-border mx-1 opacity-50 sm:block" />
          <div className="hidden items-center gap-1 sm:flex">
            <button
              onClick={onOpenDice}
              className="wfrp-icon-btn p-1.5 hover:bg-wfrp-surface-muted-hover"
              aria-label="Toggle tactical navigation dice"
            >
              <Dice5 size={14} />
            </button>
            <div className="h-4 w-[1px] bg-wfrp-border opacity-50" />
            <button
              className="wfrp-icon-btn p-1.5 hover:bg-wfrp-surface-muted-hover"
              aria-label="Settings"
            >
              <Settings size={14} />
            </button>
            <button
              className="wfrp-icon-btn p-1.5 hover:bg-wfrp-surface-muted-hover"
              aria-label="More options"
            >
              <MoreHorizontal size={14} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
