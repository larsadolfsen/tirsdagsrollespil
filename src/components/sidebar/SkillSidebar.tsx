import { useEffect, useMemo, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarFilterList } from "./SidebarFilterList";
import type { SidebarFilterOption } from "./SidebarFilterList";
import { SidebarItemList } from "./SidebarItemList";
import { WfrpSearchField } from "../ui";
import type { SkillSubtab } from "../../tabs/tabTypes";

type SkillFilterType = "all" | "career" | "trained" | "basic" | "advanced";

type SkillSidebarItem = {
  baseAdvances: number;
  baseCharacteristicValue: number;
  characteristicKey: string | null;
  description?: string;
  isBasicSkill: boolean;
  isCareerSkill: boolean;
  isSidebarCareerSkill?: boolean;
  isTrained: boolean;
  nextSkillCost: number;
  pendingAdvances: number;
  shortDescription?: string;
  specialization?: string;
  skillName: string;
};

const SKILL_FILTERS: Array<SidebarFilterOption<SkillFilterType>> = [
  { id: "all", label: "All" },
  { id: "career", label: "Career" },
  { id: "trained", label: "Trained" },
  { id: "basic", label: "Basic" },
  { id: "advanced", label: "Advanced", shortLabel: "Adv." },
];

const characteristicNames: Record<string, string> = {
  Ag: "Agility",
  BS: "Ballistic Skill",
  Dex: "Dexterity",
  Fel: "Fellowship",
  I: "Initiative",
  Int: "Intelligence",
  S: "Strength",
  T: "Toughness",
  WP: "Will Power",
  WS: "Weapon Skill",
};

export function SkillSidebar({
  initialFilter,
  isOpen,
  onClose,
  pendingAvailableXp,
  purchaseSkillAdvance,
  removePendingSkillAdvance,
  skills,
}: {
  initialFilter: SkillSubtab;
  isOpen: boolean;
  onClose: () => void;
  pendingAvailableXp: number;
  purchaseSkillAdvance: (skillName: string) => void;
  removePendingSkillAdvance: (skillName: string) => void;
  skills: SkillSidebarItem[];
}) {
  const [selectedFilter, setSelectedFilter] = useState<SkillFilterType>(initialFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedSearchQuery = searchQuery.trim().toLowerCase();

  useEffect(() => {
    if (isOpen) {
      setSelectedFilter(initialFilter);
    }
  }, [initialFilter, isOpen]);

  const skillItems = useMemo(() => {
    return skills
      .filter((skill) => {
        if (selectedFilter === "career") return skill.isSidebarCareerSkill ?? skill.isCareerSkill;
        if (selectedFilter === "trained") return skill.isTrained;
        if (selectedFilter === "basic") return skill.isBasicSkill;
        if (selectedFilter === "advanced") return !skill.isBasicSkill;
        return true;
      })
      .filter((skill) => {
        if (!normalizedSearchQuery) return true;

        return [
          skill.skillName,
          skill.shortDescription,
          skill.characteristicKey,
        ].some((value) => value?.toLowerCase().includes(normalizedSearchQuery));
      })
      .map((skill) => {
        const totalAdvances = skill.baseAdvances + skill.pendingAdvances;
        const totalScore = skill.baseCharacteristicValue + totalAdvances;
        const canPurchase = skill.isCareerSkill && pendingAvailableXp >= skill.nextSkillCost;

        return {
          actions: [
            ...(skill.pendingAdvances > 0 ? [{
              className: "[&_span]:bg-[#4a4a4a] [&_span]:text-wfrp-muted-text hover:[&_span]:bg-[#555555]",
              label: "Remove pending",
              onClick: () => removePendingSkillAdvance(skill.skillName),
            }] : []),
            {
              disabled: !canPurchase,
              isActive: canPurchase,
              label: `Buy for ${skill.nextSkillCost} XP`,
              onClick: () => purchaseSkillAdvance(skill.skillName),
            },
          ],
          description: skill.description,
          details: [
            {
              label: "Characteristic",
              value: skill.characteristicKey
                ? `${characteristicNames[skill.characteristicKey] ?? skill.characteristicKey} (${skill.characteristicKey})`
                : "-",
            },
            { label: "Score", value: totalScore },
            { label: "Advances", value: skill.pendingAdvances > 0 ? `${skill.baseAdvances} +${skill.pendingAdvances}` : skill.baseAdvances },
            ...(skill.specialization ? [{ label: "Specialization", value: skill.specialization }] : []),
            { label: "Type", value: skill.isBasicSkill ? "Basic" : "Advanced" },
            { label: "Career", value: skill.isCareerSkill ? "Yes" : "No" },
          ],
          id: skill.skillName,
          markerVariant: totalAdvances > 0 ? "gold" as const : skill.isSidebarCareerSkill ? "gray" as const : undefined,
          meta: (
            <span className="grid w-24 grid-cols-[3rem_2.5rem] items-center justify-end gap-2 text-right">
              <span>{skill.characteristicKey || "-"}</span>
              <span>{totalAdvances > 0 ? `+${totalAdvances}` : "-"}</span>
            </span>
          ),
          name: skill.skillName,
        };
      })
      .sort((firstSkill, secondSkill) => firstSkill.name.localeCompare(secondSkill.name));
  }, [
    normalizedSearchQuery,
    pendingAvailableXp,
    purchaseSkillAdvance,
    removePendingSkillAdvance,
    selectedFilter,
    skills,
  ]);

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="skill-sidebar"
      onClose={onClose}
      overlayUntil="desktop"
      side="right"
      title="Advance Skill"
      titleId="skill-sidebar-title"
      closeLabel="Close skill sidebar"
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <WfrpSearchField
        id="skill-sidebar-search"
        label="Search skills"
        placeholder="Search skills"
        value={searchQuery}
        onSearch={setSearchQuery}
        onValueChange={setSearchQuery}
      />
      <div className="border-b border-wfrp-border bg-[#242424] px-4 py-3">
        <SidebarFilterList
          ariaLabel="Skill filters"
          label="Type"
          options={SKILL_FILTERS}
          value={selectedFilter}
          onChange={setSelectedFilter}
        />
      </div>
      <SidebarItemList
        className="!rounded-none !border-0"
        headerMeta={(
          <span className="grid w-24 grid-cols-[3rem_2.5rem] items-center justify-end gap-2 text-right">
            <span>CHAR.</span>
            <span>ADV.</span>
          </span>
        )}
        items={skillItems}
        title="Skill"
        emptyMessage="No skills match the selected filters."
      />
    </AppSidebar>
  );
}
