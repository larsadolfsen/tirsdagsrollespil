import { useState, type FormEvent } from "react";
import { CharacterHeader } from "./CharacterHeader";
import { MobileCharacterHeader } from "./MobileCharacterHeader";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
} from "./ui";
import type { ResolvedCharacterRecord } from "../data/characters/resolved";
import type { CharacterSummary } from "../data/repository";
import { UI_LABELS } from "../labels";

type CharacterSheetHeaderProps = {
  availableCharacters: CharacterSummary[];
  characterData: ResolvedCharacterRecord;
  isMobileNavigationOpen: boolean;
  isMobilePortraitMenuOpen: boolean;
  onCloseMobilePortraitMenu: () => void;
  onCreateCharacter: () => void;
  onOpenAdvance: () => void;
  onOpenDice: () => void;
  onOpenMobileCharacterActions: () => void;
  onOpenMobileCharacterList: () => void;
  onOpenMobileNavigation: () => void;
  onSelectCharacter: (characterId: string) => void;
  onAwardXp: (amount: number) => void;
  selectedCharacterId: string;
  variant: "desktop" | "mobile";
  xpCurrent: number;
};

export function CharacterSheetHeader({
  availableCharacters,
  characterData,
  isMobileNavigationOpen,
  isMobilePortraitMenuOpen,
  onCloseMobilePortraitMenu,
  onCreateCharacter,
  onOpenAdvance,
  onOpenDice,
  onOpenMobileCharacterActions,
  onOpenMobileCharacterList,
  onOpenMobileNavigation,
  onSelectCharacter,
  onAwardXp,
  selectedCharacterId,
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
        isMobileNavigationOpen={isMobileNavigationOpen}
        isMobilePortraitMenuOpen={isMobilePortraitMenuOpen}
        onClosePortraitMenu={onCloseMobilePortraitMenu}
        onOpenAdvance={onOpenAdvance}
        onOpenCharacterActions={onOpenMobileCharacterActions}
        onOpenCharacterList={onOpenMobileCharacterList}
        onOpenNavigation={onOpenMobileNavigation}
        onOpenXpDialog={openXpDialog}
        xpCurrent={xpCurrent}
        xpTotal={characterData.xpTotal}
      />
  ) : (
    <CharacterHeader
      characterData={characterData}
      availableCharacters={availableCharacters}
      selectedCharacterId={selectedCharacterId}
      xpCurrent={xpCurrent}
      onSelectCharacter={onSelectCharacter}
      onCreateCharacter={onCreateCharacter}
      onOpenDice={onOpenDice}
      onOpenAdvance={onOpenAdvance}
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
              <label htmlFor="xp-gain-amount" className="text-[10px] font-black uppercase tracking-widest text-wfrp-muted-text">
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
              <div className="text-xs font-semibold text-wfrp-muted-text">
                Current: {xpCurrent}/{characterData.xpTotal}
              </div>
            </div>

            <DialogFooter>
              <DialogClose className="inline-flex min-h-10 items-center justify-center rounded-lg border border-input bg-background px-4 py-2 text-sm font-bold uppercase tracking-widest text-foreground shadow-sm transition-all hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
                Cancel
              </DialogClose>
              <Button type="submit" disabled={xpGainAmount <= 0}>
                Add XP
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
