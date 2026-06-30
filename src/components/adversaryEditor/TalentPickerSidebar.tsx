import { useMemo, useState } from "react";
import { AppSidebar } from "../sidebar/AppSidebar";
import { SidebarItemList } from "../sidebar/SidebarItemList";
import { WfrpSearchField } from "../ui";
import { talentDefinitions } from "../../data/rules/wfrp4e/talents";

export function TalentPickerSidebar({
  isOpen,
  onClose,
  onSelect,
  excludeNames,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (name: string, grouped: boolean) => void;
  excludeNames: readonly string[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const excludeSet = useMemo(() => new Set(excludeNames), [excludeNames]);

  const items = talentDefinitions
    .filter((talent) => talent.grouped || !excludeSet.has(talent.name))
    .filter((talent) => !normalizedQuery || talent.name.toLowerCase().includes(normalizedQuery))
    .map((talent) => ({
      id: talent.id,
      name: talent.name,
      meta: talent.grouped ? talent.specialisationLabel : undefined,
      description: talent.description,
      details: [
        { label: "Max", value: talent.max },
        ...(talent.tests ? [{ label: "Tests", value: talent.tests }] : []),
      ],
      actions: [
        {
          label: "Select",
          onClick: () => {
            onSelect(talent.name, Boolean(talent.grouped));
            onClose();
          },
        },
      ],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="talent-picker-sidebar"
      onClose={onClose}
      overlayUntil="desktop"
      side="right"
      title="Add Talent"
      titleId="talent-picker-sidebar-title"
      closeLabel="Close talent picker"
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <WfrpSearchField
        id="talent-picker-search"
        label="Search talents"
        placeholder="Search talents"
        value={searchQuery}
        onSearch={setSearchQuery}
        onValueChange={setSearchQuery}
      />
      <SidebarItemList
        className="!rounded-none !border-0"
        items={items}
        title="Talent"
        emptyMessage="No talents match your search."
      />
    </AppSidebar>
  );
}
