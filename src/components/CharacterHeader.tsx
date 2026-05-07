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
      if (!campaignMenuRef.current?.contains(event.target as Node)) {
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
    <section className="bg-[#181818] px-3 py-2 rounded-t border-b border-[#303030] flex flex-row flex-wrap items-center gap-4">
      <div className="relative flex-shrink-0">
        <div className="w-12 h-12 rounded-full border border-[#c5a059] p-0.5 overflow-hidden shadow-inner cursor-pointer hover:brightness-110 transition-all">
          <img
            src="https://picsum.photos/seed/knight/200/200"
            alt="Portrait"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover grayscale brightness-90"
          />
        </div>
      </div>

      <div className="flex min-w-[160px] flex-1 flex-col justify-center overflow-hidden">
        <h1 className="text-xl font-bold font-serif tracking-tight whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
          {characterData.name}
        </h1>
        <div className="text-[10px] text-gray-500 font-serif italic whitespace-nowrap">
          {characterData.race} {characterData.career} 1
        </div>
      </div>

      <div className="ml-auto flex flex-wrap items-center justify-end gap-2 sm:gap-4">
        {headerResources && (
          <div className="flex items-center gap-3">
            {headerResources}
            <div className="h-8 w-[1px] bg-[#303030] opacity-50" />
          </div>
        )}

        <div className="flex items-center gap-1 group/campaign transition-colors">
          <div className="relative" ref={campaignMenuRef}>
            <div className="flex overflow-hidden rounded border border-white/5 bg-black/20 transition-colors hover:bg-[#242424]">
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
              <div className="my-1 h-5 w-[1px] bg-[#303030] opacity-60" />
              <button
                onClick={() => {
                  onOpenAdvance();
                  setIsCampaignMenuOpen(false);
                }}
                className="flex min-w-9 flex-col items-center px-2 py-0.5 transition-colors hover:bg-[#242424] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
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
                className="absolute right-0 top-[calc(100%+0.5rem)] z-30 min-w-[240px] overflow-hidden rounded-md border border-[#3a3324] bg-[#151515] shadow-[0_14px_40px_rgba(0,0,0,0.45)]"
                role="menu"
                aria-label="Character selection"
              >
                <div className="border-b border-[#2f2f2f] px-3 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-gray-500">
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
                            ? "bg-[#2a2417] text-wfrp-gold"
                            : "text-gray-200 hover:bg-[#222222]"
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
                <div className="border-t border-[#2f2f2f] p-1">
                  <button
                    onClick={() => {
                      onCreateCharacter();
                      setIsCampaignMenuOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-[12px] font-semibold text-gray-400 transition-colors hover:bg-[#222222] hover:text-wfrp-gold"
                    role="menuitem"
                  >
                    <Plus size={12} />
                    Create a new one
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="h-4 w-[1px] bg-[#303030] mx-1 opacity-50" />
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenDice}
              className="wfrp-icon-btn p-1.5 hover:bg-[#242424]"
              aria-label="Toggle tactical navigation dice"
            >
              <Dice5 size={14} />
            </button>
            <div className="h-4 w-[1px] bg-[#303030] opacity-50" />
            <button
              className="wfrp-icon-btn p-1.5 hover:bg-[#242424]"
              aria-label="Settings"
            >
              <Settings size={14} />
            </button>
            <button
              className="wfrp-icon-btn p-1.5 hover:bg-[#242424]"
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
