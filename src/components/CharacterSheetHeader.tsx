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
  WfrpStandardBtn,
} from "./ui";
import type { ResolvedCharacterRecord } from "../data/characters/resolved";
import type { CharacterSummary } from "../data/repository";
import { UI_LABELS } from "../labels";

type CharacterSheetHeaderProps = {
  availableCharacters: CharacterSummary[];
  characterData: ResolvedCharacterRecord;
  isMobilePortraitMenuOpen: boolean;
  onCloseMobilePortraitMenu: () => void;
  onCreateCharacter: () => void;
  onOpenAdvance: () => void;
  onOpenDice: () => void;
  onOpenMobileCharacterActions: () => void;
  onOpenMobileMenu: () => void;
  onSelectCharacter: (characterId: string) => void;
  onAwardXp: (amount: number) => void;
  selectedCharacterId: string;
  variant: "desktop" | "mobile";
  xpCurrent: number;
};

export function CharacterSheetHeader({
  availableCharacters,
  characterData,
  isMobilePortraitMenuOpen,
  onCloseMobilePortraitMenu,
  onCreateCharacter,
  onOpenAdvance,
  onOpenDice,
  onOpenMobileCharacterActions,
  onOpenMobileMenu,
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
        isMobilePortraitMenuOpen={isMobilePortraitMenuOpen}
        onClosePortraitMenu={onCloseMobilePortraitMenu}
        onOpenAdvance={onOpenAdvance}
        onOpenCharacterActions={onOpenMobileCharacterActions}
        onOpenMenu={onOpenMobileMenu}
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
              <WfrpStandardBtn
                type="button"
                name="Cancel"
                onClick={() => setIsXpDialogOpen(false)}
                className="wfrp-roll-cta"
                leadingIcon={<X size={14} />}
              />
              <WfrpStandardBtn
                type="submit"
                name="Add XP"
                disabled={xpGainAmount <= 0}
                isGolden={xpGainAmount > 0}
                className="wfrp-roll-cta"
              />
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
