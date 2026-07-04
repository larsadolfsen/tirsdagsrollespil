import { useState, type FormEvent } from "react";
import { ArrowUpFromLine, Settings, X } from "lucide-react";
import { AppHeader, AppHeaderIdentity } from "./ui/AppHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
  MainTabMenu,
  WfrpStandardIcon,
} from "./ui";
import { LibraryHeaderMenu } from "./LibraryHeaderMenu";
import type { ResolvedCharacterRecord } from "../data/characters/resolved";
import { useGameSessionContext } from "../context/GameSessionContext";
import { UI_LABELS } from "../labels";

const characterMenuOptions = [
  { id: "sheet", label: "Character Sheet" },
  { id: "edit", label: "Edit Character" },
  { id: "dice", label: "Dice Log" },
] as const;

type CharacterSheetHeaderProps = {
  activeMenuItem: "sheet" | "edit" | "dice";
  campaignId: string;
  characterData: ResolvedCharacterRecord;
  isMobilePortraitMenuOpen: boolean;
  onCloseMobilePortraitMenu: () => void;
  onOpenCharacterSheet: () => void;
  onOpenAdvance: () => void;
  onOpenDice: () => void;
  onOpenMobileCharacterActions: () => void;
  onOpenMobileGainExperience: () => void;
  onOpenMobileMenu: () => void;
  onAwardXp: (amount: number) => void;
  xpCurrent: number;
};

export function CharacterSheetHeader({
  activeMenuItem,
  campaignId,
  characterData,
  isMobilePortraitMenuOpen,
  onCloseMobilePortraitMenu,
  onOpenCharacterSheet,
  onOpenAdvance,
  onOpenDice,
  onOpenMobileCharacterActions,
  onOpenMobileGainExperience,
  onOpenMobileMenu,
  onAwardXp,
  xpCurrent,
}: CharacterSheetHeaderProps) {
  const { portraitDataUrl } = useGameSessionContext();
  const [isXpDialogOpen, setIsXpDialogOpen] = useState(false);
  const [xpGainDraft, setXpGainDraft] = useState("");
  const xpGainAmount = Math.max(0, Math.floor(Number(xpGainDraft) || 0));

  const openXpDialog = () => {
    onCloseMobilePortraitMenu();
    setXpGainDraft("");
    setIsXpDialogOpen(true);
  };

  const handleAwardXp = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (xpGainAmount <= 0) return;
    onAwardXp(xpGainAmount);
    setXpGainDraft("");
    setIsXpDialogOpen(false);
  };

  const portrait = portraitDataUrl ? (
    <img
      src={portraitDataUrl}
      alt="Portrait"
      width={48}
      height={48}
      className="wfrp-character-portrait-image"
    />
  ) : (
    <span aria-hidden="true" className="wfrp-character-portrait-fallback text-xs">
      {characterData.name.charAt(0)}
    </span>
  );

  return (
    <>
      <div className="relative">
        <AppHeader
          portrait={portrait}
          onPortraitClick={onOpenMobileCharacterActions}
          portraitLabel="Open character actions"
          portraitHasPopup="menu"
          portraitExpanded={isMobilePortraitMenuOpen}
          identity={
            <AppHeaderIdentity
              name={characterData.name}
              subtitle={`XP ${xpCurrent}/${characterData.xpTotal}`}
            />
          }
          desktopActions={(
            <>
              <MainTabMenu<"sheet" | "edit" | "dice">
                activeId={activeMenuItem}
                ariaLabel="Character menu"
                options={characterMenuOptions}
                onChange={(item) => {
                  if (item === "sheet") onOpenCharacterSheet();
                  if (item === "edit") onOpenAdvance();
                  if (item === "dice") onOpenDice();
                }}
              />
              <LibraryHeaderMenu campaignId={campaignId} />
              <WfrpStandardIcon
                label="Gain Experience"
                icon={<ArrowUpFromLine />}
                onClick={openXpDialog}
                aria-current={isXpDialogOpen ? "page" : undefined}
                className={isXpDialogOpen ? "text-white" : undefined}
              />
            </>
          )}
          onMobileMenuOpen={onOpenMobileMenu}
        />

        {isMobilePortraitMenuOpen && (
          <div
            className="absolute left-3 top-[calc(100%+0.5rem)] z-40 min-w-44 overflow-hidden rounded border border-wfrp-border bg-wfrp-popover shadow-2xl sm:hidden"
            role="menu"
            aria-label="Character actions"
          >
            <button
              type="button"
              onClick={() => {
                onCloseMobilePortraitMenu();
                onOpenAdvance();
              }}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left wfrp-label text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
              role="menuitem"
            >
              <span>Edit Character</span>
              <ArrowUpFromLine size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onOpenMobileGainExperience}
              className="flex w-full items-center justify-between gap-3 border-t border-white/5 px-4 py-3 text-left wfrp-label text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
              aria-label={`Gain Experience (${xpCurrent}/${characterData.xpTotal} XP)`}
              role="menuitem"
            >
              <span>Gain Experience</span>
              <ArrowUpFromLine size={14} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={onCloseMobilePortraitMenu}
              className="flex w-full items-center gap-3 border-t border-white/5 px-4 py-3 text-left wfrp-label text-gray-300 transition-colors hover:bg-wfrp-surface-raised hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
              role="menuitem"
            >
              <Settings size={14} />
              Settings
            </button>
          </div>
        )}
      </div>

      <Dialog open={isXpDialogOpen} onOpenChange={setIsXpDialogOpen}>
        <DialogContent className="max-w-sm">
          <form onSubmit={handleAwardXp} className="grid gap-4">
            <DialogHeader>
              <DialogTitle>Gain XP</DialogTitle>
              <DialogDescription>
                How much XP did you gain?
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-2">
              <label htmlFor="xp-gain-amount" className="wfrp-label text-wfrp-muted-text">
                XP gained
              </label>
              <Input
                id="xp-gain-amount"
                autoFocus
                inputMode="numeric"
                min={1}
                step={1}
                type="number"
                value={xpGainDraft}
                onChange={(event) => setXpGainDraft(event.target.value)}
                aria-label="XP gained"
              />
              <div className="wfrp-text-strong text-wfrp-muted-text">
                Current: {xpCurrent}/{characterData.xpTotal}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                name="Cancel"
                onClick={() => setIsXpDialogOpen(false)}
                leadingIcon={<X size={14} />}
              />
              <Button
                type="submit"
                name="Add XP"
                disabled={xpGainAmount <= 0}
                isGolden={xpGainAmount > 0}
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
