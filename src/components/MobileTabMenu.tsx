import { Check, ChevronDown, Menu, Plus } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { Dispatch, SetStateAction } from "react";
import { cn } from "../lib/utils";
import {
  mobileTabButtonActiveClassName,
  mobileTabButtonBaseClassName,
  mobileTabButtonInactiveClassName,
} from "../lib/tabStyles";
import type { MobileTabMenuTarget, TabOption } from "../tabs/tabTypes";

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
    <AnimatePresence>
      {isMobileNavigationOpen && (
        <motion.div
          className="fixed inset-0 z-50 md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation drawer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-black/65"
            aria-label="Close navigation drawer"
            onClick={closeMobileNavigation}
          />
          <motion.aside
            className="absolute left-0 top-0 flex h-full w-[min(86vw,340px)] flex-col border-r border-wfrp-brass-border bg-sidebar shadow-2xl"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 260 }}
          >
            <div className="border-b border-wfrp-border bg-sidebar px-5 py-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <Menu size={18} className="mt-1 shrink-0 text-wfrp-gold/70" />
                  <div className="min-w-0">
                    <h2 className="truncate font-serif text-2xl font-bold text-wfrp-gold">
                      {characterName}
                    </h2>
                    <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-widest text-wfrp-muted-text">
                      {campaignName}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileCharacterListOpen((isOpen) => !isOpen)}
                  className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-wfrp-muted-text transition-colors hover:bg-white/5 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                  aria-label="Change character"
                  aria-expanded={isMobileCharacterListOpen}
                >
                  <ChevronDown
                    size={20}
                    className={`transition-transform ${isMobileCharacterListOpen ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {isMobileCharacterListOpen && (
                <div className="mt-4 overflow-hidden rounded border border-wfrp-border bg-sidebar p-1">
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
                    className="mt-1 flex w-full items-center gap-3 rounded px-3 py-2.5 text-left text-sm font-semibold text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold"
                  >
                    <Plus size={16} />
                    Create character
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-3">
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
                      mobileTabButtonBaseClassName,
                      isActive ? mobileTabButtonActiveClassName : mobileTabButtonInactiveClassName,
                    )}
                    aria-current={isActive ? "page" : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}

              <div className="my-3 border-t border-wfrp-border" />

              <button
                type="button"
                onClick={onOpenDiceLog}
                className={cn(mobileTabButtonBaseClassName, mobileTabButtonInactiveClassName)}
              >
                Dice
              </button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
