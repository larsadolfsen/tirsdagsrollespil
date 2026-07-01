import { useState, type FormEvent } from "react";
import { X } from "lucide-react";
import { CharacterHeader } from "./CharacterHeader";
import { MobileCharacterHeader } from "./MobileCharacterHeader";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Button,
} from "./ui";
import type { ResolvedCharacterRecord } from "../data/characters/resolved";
import { UI_LABELS } from "../labels";

type CharacterSheetHeaderProps = {
  activeMenuItem: "sheet" | "edit" | "dice" | "books";
  characterData: ResolvedCharacterRecord;
  isMobilePortraitMenuOpen: boolean;
  onCloseMobilePortraitMenu: () => void;
  onOpenCharacterSheet: () => void;
  onOpenAdvance: () => void;
  onOpenDice: () => void;
  onOpenBooks: () => void;
  onOpenMobileCharacterActions: () => void;
  onOpenMobileGainExperience: () => void;
  onOpenMobileMenu: () => void;
  onAwardXp: (amount: number) => void;
  variant: "desktop" | "mobile";
  xpCurrent: number;
};

export function CharacterSheetHeader({
  activeMenuItem,
  characterData,
  isMobilePortraitMenuOpen,
  onCloseMobilePortraitMenu,
  onOpenCharacterSheet,
  onOpenAdvance,
  onOpenDice,
  onOpenBooks,
  onOpenMobileCharacterActions,
  onOpenMobileGainExperience,
  onOpenMobileMenu,
  onAwardXp,
  variant,
  xpCurrent,
}: CharacterSheetHeaderProps) {
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

    if (xpGainAmount <= 0) {
      return;
    }

    onAwardXp(xpGainAmount);
    setXpGainDraft("");
    setIsXpDialogOpen(false);
  };

  const header = variant === "mobile" ? (
      <MobileCharacterHeader
        campaignName={UI_LABELS.CAMPAIGN_NAME}
        characterName={characterData.name}
        isMobilePortraitMenuOpen={isMobilePortraitMenuOpen}
        onClosePortraitMenu={onCloseMobilePortraitMenu}
        onOpenAdvance={onOpenAdvance}
        onOpenCharacterActions={onOpenMobileCharacterActions}
        onOpenMenu={onOpenMobileMenu}
        onOpenXpDialog={onOpenMobileGainExperience}
        xpCurrent={xpCurrent}
        xpTotal={characterData.xpTotal}
      />
  ) : (
    <CharacterHeader
      activeMenuItem={isXpDialogOpen ? "experience" : activeMenuItem}
      characterData={characterData}
      xpCurrent={xpCurrent}
      onOpenCharacterSheet={onOpenCharacterSheet}
      onOpenDice={onOpenDice}
      onOpenAdvance={onOpenAdvance}
      onOpenBooks={onOpenBooks}
      onOpenXpDialog={openXpDialog}
    />
  );

  return (
    <>
      {header}
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
