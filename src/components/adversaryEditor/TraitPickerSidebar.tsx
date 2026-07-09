// Right-hand picker sidebar listing the bestiary creature-trait catalog so the
// adversary editor can add NPC/generic traits by name. Mirrors SkillPickerSidebar
// / TalentPickerSidebar; selection returns the trait's display name.
import { useMemo, useState } from "react";
import { AppSidebar } from "../sidebar/AppSidebar";
import { SidebarItemList } from "../sidebar/SidebarItemList";
import { WfrpSearchField } from "../ui";
import { creatureTraitDefinitions } from "../../data/rules/wfrp4e/creatureTraits";

export function TraitPickerSidebar({
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
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const excludeSet = useMemo(() => new Set(excludeNames), [excludeNames]);

  const items = creatureTraitDefinitions
    .filter((trait) => trait.parameter || !excludeSet.has(trait.name))
    .filter((trait) => !normalizedQuery || trait.name.toLowerCase().includes(normalizedQuery))
    .map((trait) => ({
      id: trait.id,
      name: trait.name,
      meta: trait.parameter ? trait.parameter.label : undefined,
      description: trait.summary,
      actions: [
        {
          label: "Select",
          onClick: () => {
            onSelect(trait.name);
            onClose();
          },
        },
      ],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="trait-picker-sidebar"
      onClose={onClose}
      overlayUntil="desktop"
      side="right"
      title="Add Trait"
      titleId="trait-picker-sidebar-title"
      closeLabel="Close trait picker"
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <WfrpSearchField
        id="trait-picker-search"
        label="Search traits"
        placeholder="Search traits"
        value={searchQuery}
        onSearch={setSearchQuery}
        onValueChange={setSearchQuery}
      />
      <SidebarItemList
        className="!rounded-none !border-0"
        items={items}
        title="Trait"
        emptyMessage="No traits match your search."
      />
    </AppSidebar>
  );
}
