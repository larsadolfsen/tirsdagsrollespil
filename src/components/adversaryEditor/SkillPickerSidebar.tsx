import { useMemo, useState } from "react";
import { AppSidebar } from "../sidebar/AppSidebar";
import { SidebarItemList } from "../sidebar/SidebarItemList";
import { WfrpFilterChips, WfrpSearchField } from "../ui";
import { skillCharacteristicById } from "../../data/rules/wfrp4e";
import {
  buildResolvedSkillOptions,
  skillDefinitions,
  skillSpecialisationDefinitions,
} from "../../data/rules/wfrp4e/skills";

type SkillTypeFilter = "basic" | "advanced";

const SKILL_TYPE_FILTERS: Array<{ id: SkillTypeFilter; label: string }> = [
  { id: "basic", label: "Basic" },
  { id: "advanced", label: "Advanced" },
];

const skillPickerOptions = buildResolvedSkillOptions(skillDefinitions, skillSpecialisationDefinitions).map((option) => {
  const definition = skillDefinitions.find((skill) => skill.id === option.skillId)!;
  return {
    id: option.id,
    name: option.name,
    type: definition.type,
    characteristic: skillCharacteristicById[option.skillId] ?? "",
  };
});

export function SkillPickerSidebar({
  isOpen,
  onClose,
  onSelect,
  excludeNames,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (name: string) => void;
  excludeNames: readonly string[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<SkillTypeFilter[]>([]);
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const excludeSet = useMemo(() => new Set(excludeNames), [excludeNames]);

  const items = skillPickerOptions
    .filter((option) => !excludeSet.has(option.name))
    .filter((option) => selectedFilters.length === 0 || selectedFilters.includes(option.type))
    .filter((option) => !normalizedQuery || option.name.toLowerCase().includes(normalizedQuery))
    .map((option) => ({
      id: option.id,
      name: option.name,
      meta: option.characteristic,
      actions: [
        {
          label: "Select",
          onClick: () => {
            onSelect(option.name);
            onClose();
          },
        },
      ],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="skill-picker-sidebar"
      onClose={onClose}
      overlayUntil="desktop"
      side="right"
      title="Add Skill"
      titleId="skill-picker-sidebar-title"
      closeLabel="Close skill picker"
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <WfrpSearchField
        id="skill-picker-search"
        label="Search skills"
        placeholder="Search skills"
        value={searchQuery}
        onSearch={setSearchQuery}
        onValueChange={setSearchQuery}
      />
      <div className="border-b border-wfrp-border bg-[#242424] px-4 py-3">
        <div className="space-y-1.5">
          <div className="wfrp-label text-wfrp-muted-text">Type</div>
          <WfrpFilterChips
            ariaLabel="Skill type filters"
            options={SKILL_TYPE_FILTERS}
            selectedIds={selectedFilters}
            onChange={setSelectedFilters}
          />
        </div>
      </div>
      <SidebarItemList
        className="!rounded-none !border-0"
        items={items}
        title="Skill"
        emptyMessage="No skills match the selected filters."
      />
    </AppSidebar>
  );
}
