import { CharacterHeader } from "./CharacterHeader";
import { MobileCharacterHeader } from "./MobileCharacterHeader";
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
  selectedCharacterId,
  variant,
  xpCurrent,
}: CharacterSheetHeaderProps) {
  if (variant === "mobile") {
    return (
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
        xpCurrent={xpCurrent}
        xpTotal={characterData.xpTotal}
      />
    );
  }

  return (
    <CharacterHeader
      characterData={characterData}
      availableCharacters={availableCharacters}
      selectedCharacterId={selectedCharacterId}
      xpCurrent={xpCurrent}
      onSelectCharacter={onSelectCharacter}
      onCreateCharacter={onCreateCharacter}
      onOpenDice={onOpenDice}
      onOpenAdvance={onOpenAdvance}
    />
  );
}
