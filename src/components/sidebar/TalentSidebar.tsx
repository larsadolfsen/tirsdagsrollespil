import { useMemo, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarItemList } from "./SidebarItemList";
import { WfrpSearchField, WfrpSuggestionChips } from "../ui";
import type { ResolvedCharacterTalent } from "../../data/characters/resolved";
import type { TalentDefinition } from "../../types";

type TalentFilterType = "career";

const TALENT_FILTERS: Array<{ id: TalentFilterType; label: string }> = [
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
  purchaseTalent: (talentName: string) => void;
  talents: TalentDefinition[];
}) {
  const [activeFilters, setActiveFilters] = useState<TalentFilterType[]>(["career"]);
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
  const toggleFilter = (filter: TalentFilterType) => {
    setActiveFilters((current) =>
      current.includes(filter)
        ? current.filter((activeFilter) => activeFilter !== filter)
        : [...current, filter],
    );
  };
  const talentItems = talents
    .filter((talent) => {
      if (activeFilters.length === 0) return true;

      return activeFilters.some((filter) => {
        if (filter === "career") return careerTalentNameSet.has(talent.name);
        return false;
      });
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

      return {
        actions: [
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
      <WfrpSuggestionChips
        label="Filter"
        options={TALENT_FILTERS}
        selectedIds={activeFilters}
        onToggle={toggleFilter}
      />
      <SidebarItemList
        className="!rounded-none !border-0"
        items={talentItems}
        title="Talent"
        emptyMessage="No talents match the selected filters."
      />
    </AppSidebar>
  );
}
