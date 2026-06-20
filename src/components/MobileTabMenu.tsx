import { Check, ChevronDown, Plus } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { cn } from "../lib/utils";
import type { MobileTabMenuTarget, TabOption } from "../tabs/tabTypes";
import { AppSidebar } from "./sidebar";

type MobileCharacterOption = {
  id: string;
  name: string;
  rulesetId: string;
};

interface MobileTabMenuProps {
  activeMobileMainView: MobileTabMenuTarget;
  availableCharacters: MobileCharacterOption[];
  campaignName: string;
  characterName: string;
  closeMobileNavigation: () => void;
  handleMobileMainViewSelect: (target: MobileTabMenuTarget) => void;
  isMobileCharacterListOpen: boolean;
  isMobileNavigationOpen: boolean;
  mobileTabMenuOptions: Array<TabOption<MobileTabMenuTarget>>;
  onCreateCharacter: () => void;
  onOpenDiceLog: () => void;
  selectedCharacterId: string;
  setIsMobileCharacterListOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedCharacterId: (characterId: string) => void;
}

const mobileMenuIconNameByTarget: Record<MobileTabMenuTarget, string> = {
  characteristics: "CHAR",
  skills: "SKIL",
  actions: "ACT",
  inventory: "INV",
  spells: "MAG",
  features: "TAL",
  journal: "JRN",
  career: "EDIT",
};

const mobileMenuButtonClassName =
  "flex min-h-12 w-full cursor-pointer items-center gap-3 rounded border px-3 py-2.5 text-left text-[12px] font-bold tracking-wide text-[var(--color-wfrp-muted-text)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50";

const mobileMenuIconClassName =
  "flex h-7 w-10 shrink-0 items-center justify-center rounded border border-white/10 bg-black/20 font-mono text-[9px] font-black uppercase tracking-wide text-wfrp-gold/80";

export function MobileTabMenu({
  activeMobileMainView,
  availableCharacters,
  campaignName,
  characterName,
  closeMobileNavigation,
  handleMobileMainViewSelect,
  isMobileCharacterListOpen,
  isMobileNavigationOpen,
  mobileTabMenuOptions,
  onCreateCharacter,
  onOpenDiceLog,
  selectedCharacterId,
  setIsMobileCharacterListOpen,
  setSelectedCharacterId,
}: MobileTabMenuProps) {
  return (
    <AppSidebar
      className="md:hidden"
      closeLabel="Close navigation drawer"
      closeOnOutsidePointerDown
      contentClassName="flex flex-col gap-4 p-4"
      eyebrow={campaignName}
      isOpen={isMobileNavigationOpen}
      motionKey="mobile-navigation-sidebar"
      onClose={closeMobileNavigation}
      overlayUntil="mobile"
      side="left"
      title={characterName}
      titleId="mobile-navigation-title"
      trapFocus
    >
      <section className="rounded border border-wfrp-border bg-card p-3">
        <button
          type="button"
          onClick={() => setIsMobileCharacterListOpen((isOpen) => !isOpen)}
          className="flex w-full items-center justify-between gap-3 rounded px-2 py-2 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
          aria-expanded={isMobileCharacterListOpen}
        >
          <span className="min-w-0">
            <span className="block text-[9px] font-black uppercase tracking-widest text-wfrp-muted-text">
              Character
            </span>
            <span className="mt-1 block truncate text-sm font-semibold text-gray-100">
              {characterName}
            </span>
          </span>
          <span
            aria-hidden="true"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded text-wfrp-gold/80"
          >
            <ChevronDown
              className={`transition-transform ${isMobileCharacterListOpen ? "rotate-180" : ""}`}
            />
          </span>
        </button>

        {isMobileCharacterListOpen && (
          <div className="mt-3 overflow-hidden rounded border border-wfrp-border bg-sidebar p-1">
            {availableCharacters.map((character) => {
              const isSelected = character.id === selectedCharacterId;

              return (
                <button
                  key={character.id}
                  type="button"
                  onClick={() => {
                    setSelectedCharacterId(character.id);
                    closeMobileNavigation();
                  }}
                  className={`flex w-full items-center justify-between rounded px-3 py-2.5 text-left transition-colors ${
                    isSelected
                      ? "bg-wfrp-gold-surface text-wfrp-gold"
                      : "text-gray-200 hover:bg-wfrp-surface-raised"
                  }`}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{character.name}</span>
                    <span className="block text-[9px] font-bold uppercase tracking-widest text-wfrp-muted-text">
                      {character.rulesetId}
                    </span>
                  </span>
                  <span className="ml-3 flex h-5 w-5 items-center justify-center">
                    {isSelected ? <Check size={14} /> : null}
                  </span>
                </button>
              );
            })}
            <button
              type="button"
              onClick={onCreateCharacter}
              className="mt-1 flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm font-semibold text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
            >
              <Plus size={16} aria-hidden="true" />
              Create character
            </button>
          </div>
        )}
      </section>

      <nav className="flex flex-col gap-2" aria-labelledby="mobile-navigation-title">
        {mobileTabMenuOptions.map((item) => {
          const isActive =
            item.id === "characteristics"
              ? activeMobileMainView === "characteristics"
              : activeMobileMainView === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                handleMobileMainViewSelect(item.id);
                closeMobileNavigation();
              }}
              className={cn(
                mobileMenuButtonClassName,
                isActive
                  ? "border-wfrp-border bg-white/10 text-white"
                  : "border-transparent hover:border-wfrp-border hover:bg-white/10 hover:text-white",
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <span className={mobileMenuIconClassName} aria-hidden="true">
                {mobileMenuIconNameByTarget[item.id]}
              </span>
              <span className="min-w-0 truncate">{item.label}</span>
            </button>
          );
        })}

        <div className="my-1 border-t border-wfrp-border" />

        <button
          type="button"
          onClick={onOpenDiceLog}
          className={cn(
            mobileMenuButtonClassName,
            "border-transparent hover:border-wfrp-border hover:bg-white/10 hover:text-white",
          )}
        >
          <span className={mobileMenuIconClassName} aria-hidden="true">
            DICE
          </span>
          <span className="min-w-0 truncate">Dice</span>
        </button>
      </nav>
    </AppSidebar>
  );
}
