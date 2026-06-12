import { AppSidebar } from "./AppSidebar";
import { SidebarItemList } from "./SidebarItemList";
import type { ResolvedCharacterTalent } from "../../data/characters/resolved";
import type { TalentDefinition } from "../../types";

export function TalentSidebar({
  addTalentForFree,
  characterTalents,
  getTalentMaxDisplay,
  getTalentPurchaseCost,
  isOpen,
  onClose,
  pendingAvailableXp,
  pendingTalentPurchases,
  purchaseTalent,
  removeTalent,
  talents,
}: {
  addTalentForFree: (talentName: string) => void;
  characterTalents: ResolvedCharacterTalent[];
  getTalentMaxDisplay: (max: string) => string | number;
  getTalentPurchaseCost: (currentTimesTaken: number) => number;
  isOpen: boolean;
  onClose: () => void;
  pendingAvailableXp: number;
  pendingTalentPurchases: Record<string, number>;
  purchaseTalent: (talentName: string) => void;
  removeTalent: (talentName: string) => void;
  talents: TalentDefinition[];
}) {
  const ownedTalentNames = new Set(characterTalents.map((talent) => talent.name));
  const talentItems = talents
    .map((talent) => {
      const baseTakenCount = characterTalents.filter((entry) => entry.name === talent.name).length;
      const pendingTakenCount = pendingTalentPurchases[talent.name] ?? 0;
      const totalTakenCount = baseTakenCount + pendingTakenCount;
      const nextCost = getTalentPurchaseCost(baseTakenCount + pendingTakenCount);
      const maxDisplay = getTalentMaxDisplay(talent.max);
      const numericMax = typeof maxDisplay === "number" ? maxDisplay : Number.parseInt(String(maxDisplay), 10);
      const canGainTalent = Number.isFinite(numericMax) ? totalTakenCount < numericMax : true;

      return {
        actions: [
          ...(canGainTalent && pendingAvailableXp >= nextCost ? [{
            disabled: pendingAvailableXp < nextCost,
            isActive: true,
            label: `Buy for ${nextCost} XP`,
            onClick: () => purchaseTalent(talent.name),
          }] : []),
          ...(canGainTalent ? [{
            label: "Add for free",
            onClick: () => addTalentForFree(talent.name),
          }] : []),
          ...(totalTakenCount > 0 ? [{
            label: "Remove",
            onClick: () => removeTalent(talent.name),
          }] : []),
        ],
        description: talent.description,
        details: [
          { label: "Tiers", value: `${totalTakenCount}/${maxDisplay}` },
          ...(talent.tests ? [{ label: "Tests", value: talent.tests }] : []),
        ],
        id: talent.id,
        isMarked: ownedTalentNames.has(talent.name),
        name: talent.name,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="talent-sidebar"
      onClose={onClose}
      side="right"
      title="Add Talent"
      titleId="talent-sidebar-title"
      closeLabel="Close talent sidebar"
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <SidebarItemList
        className="!rounded-none !border-0"
        items={talentItems}
        title="Talent"
        emptyMessage="No talents available."
      />
    </AppSidebar>
  );
}
