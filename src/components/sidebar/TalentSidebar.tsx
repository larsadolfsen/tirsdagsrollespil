import { useMemo, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarFilterList } from "./SidebarFilterList";
import { SidebarItemList } from "./SidebarItemList";
import { WfrpSearchField } from "../ui";
import type { ResolvedCharacterTalent } from "../../data/characters/resolved";
import type { TalentDefinition } from "../../types";

type TalentFilterType = "All" | "career";

const TALENT_FILTERS: Array<{ id: TalentFilterType; label: string }> = [
  { id: "All", label: "All" },
  { id: "career", label: "Career" },
];

export function TalentSidebar({
  characterTalents,
  careerTalentNames,
  getTalentMaxDisplay,
  getTalentPurchaseCost,
  isOpen,
  onClose,
  pendingAvailableXp,
  pendingTalentPurchases,
  onRemoveTalent,
  purchaseTalent,
  talents,
}: {
  characterTalents: ResolvedCharacterTalent[];
  careerTalentNames: string[];
  getTalentMaxDisplay: (max: string) => string | number;
  getTalentPurchaseCost: (currentTimesTaken: number) => number;
  isOpen: boolean;
  onClose: () => void;
  pendingAvailableXp: number;
  pendingTalentPurchases: Record<string, number>;
  onRemoveTalent: (talentName: string) => void;
  purchaseTalent: (talentName: string) => void;
  talents: TalentDefinition[];
}) {
  const [selectedFilter, setSelectedFilter] = useState<TalentFilterType>("career");
  const [searchQuery, setSearchQuery] = useState("");
  const ownedTalentNames = useMemo(() => new Set(characterTalents.map((talent) => talent.name)), [characterTalents]);
  const careerTalentNameSet = useMemo(() => new Set(careerTalentNames), [careerTalentNames]);
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();
  const getTalentPurchaseState = (talent: TalentDefinition) => {
    const baseTakenCount = characterTalents.filter((entry) => entry.name === talent.name).length;
    const pendingTakenCount = pendingTalentPurchases[talent.name] ?? 0;
    const totalTakenCount = baseTakenCount + pendingTakenCount;
    const nextCost = getTalentPurchaseCost(totalTakenCount);
    const isCareerTalent = careerTalentNameSet.has(talent.name);
    const maxDisplay = getTalentMaxDisplay(talent.max);
    const numericMax = typeof maxDisplay === "number" ? maxDisplay : Number.parseInt(String(maxDisplay), 10);
    const canGainTalent = Number.isFinite(numericMax) ? totalTakenCount < numericMax : true;
    const canPurchase = canGainTalent && isCareerTalent && pendingAvailableXp >= nextCost;

    return {
      baseTakenCount,
      canGainTalent,
      canPurchase,
      maxDisplay,
      nextCost,
      totalTakenCount,
    };
  };
  const talentItems = talents
    .filter((talent) => {
      if (selectedFilter === "All") return true;
      if (selectedFilter === "career") return careerTalentNameSet.has(talent.name);
      return false;
    })
    .filter((talent) => {
      if (!normalizedSearchQuery) return true;

      return [
        talent.name,
        talent.description,
        talent.tests,
      ].some((value) => value?.toLowerCase().includes(normalizedSearchQuery));
    })
    .map((talent) => {
      const {
        canGainTalent,
        canPurchase,
        maxDisplay,
        nextCost,
        totalTakenCount,
      } = getTalentPurchaseState(talent);
      const isOwned = ownedTalentNames.has(talent.name);

      return {
        actions: [
          ...(isOwned ? [{
            className: "[&_span]:bg-[#4a4a4a] [&_span]:text-gray-100 hover:[&_span]:bg-[#555555]",
            label: "Remove",
            onClick: () => onRemoveTalent(talent.name),
          }] : []),
          ...(canGainTalent ? [{
            disabled: !canPurchase,
            isActive: canPurchase,
            label: `Buy for ${nextCost} XP`,
            onClick: () => purchaseTalent(talent.name),
          }] : []),
        ],
        description: talent.description,
        details: [
          { label: "Tiers", value: `${totalTakenCount}/${maxDisplay}` },
          ...(talent.tests ? [{ label: "Tests", value: talent.tests }] : []),
        ],
        id: talent.id,
        isMarked: isOwned,
        name: talent.name,
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="talent-sidebar"
      onClose={onClose}
      overlayUntil="desktop"
      side="right"
      title="Add Talent"
      titleId="talent-sidebar-title"
      closeLabel="Close talent sidebar"
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <WfrpSearchField
        id="talent-sidebar-search"
        label="Search talents"
        placeholder="Search talents"
        value={searchQuery}
        onSearch={setSearchQuery}
        onValueChange={setSearchQuery}
      />
      <div className="border-b border-wfrp-border bg-[#242424] px-4 py-3">
        <SidebarFilterList
          ariaLabel="Talent filters"
          label="Type"
          options={TALENT_FILTERS}
          value={selectedFilter}
          onChange={setSelectedFilter}
        />
      </div>
      <SidebarItemList
        className="!rounded-none !border-0"
        items={talentItems}
        title="Talent"
        emptyMessage="No talents match the selected filters."
      />
    </AppSidebar>
  );
}
