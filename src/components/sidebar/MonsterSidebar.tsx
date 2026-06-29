import { useMemo, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarItemList } from "./SidebarItemList";
import { WfrpFilterChips, WfrpSearchField } from "../ui";
import { resolvedCreatureTemplates } from "../../data/rules/wfrp4e";
import type { CreatureCategory, CreatureTemplate } from "../../data/rules/wfrp4e";

type CategoryFilter = CreatureCategory;

const CATEGORY_FILTERS: Array<{ id: CategoryFilter; label: string }> = [
  { id: "beast", label: "Beast" },
  { id: "daemon", label: "Daemon" },
  { id: "greenskin", label: "Greenskin" },
  { id: "human", label: "Human" },
  { id: "monster", label: "Monster" },
  { id: "skaven", label: "Skaven" },
  { id: "spirit", label: "Spirit" },
  { id: "undead", label: "Undead" },
];

export function MonsterSidebar({
  isOpen,
  onClose,
  onAddMonster,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddMonster: (template: CreatureTemplate, count: number) => void;
  className?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<CategoryFilter[]>([]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const activeCategories = useMemo(() => {
    const present = new Set(resolvedCreatureTemplates.map((t) => t.category));
    return CATEGORY_FILTERS.filter((f) => present.has(f.id));
  }, []);

  const items = useMemo(() => {
    return resolvedCreatureTemplates
      .filter((template) => {
        if (selectedFilters.length > 0 && !selectedFilters.includes(template.category)) return false;
        if (normalizedQuery) {
          return (
            template.name.toLowerCase().includes(normalizedQuery) ||
            template.category.toLowerCase().includes(normalizedQuery) ||
            (template.group ?? "").toLowerCase().includes(normalizedQuery)
          );
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((template) => {
        const count = template.defaultCount ?? 1;
        const traitNames = template.traits.map((t) => t.definition.name).join(", ");
        return {
          id: template.id,
          name: template.name,
          meta: template.category,
          details: [
            { label: "M", value: template.statBlock.movement },
            { label: "W", value: template.statBlock.wounds },
            { label: "WS", value: template.statBlock.characteristics.WS },
            { label: "BS", value: template.statBlock.characteristics.BS },
            { label: "I", value: template.statBlock.characteristics.I },
            ...(traitNames ? [{ label: "Traits", value: traitNames }] : []),
          ],
          actions: [
            {
              isActive: true,
              label: count > 1 ? `Add ×${count}` : "Add",
              onClick: () => onAddMonster(template, count),
            },
          ],
        };
      });
  }, [normalizedQuery, onAddMonster, selectedFilters]);

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="monster-sidebar"
      onClose={onClose}
      side="right"
      title="Add Monster"
      titleId="monster-sidebar-title"
      closeLabel="Close monster sidebar"
      alwaysOverlay
      contentClassName="!p-0"
      className={className}
      trapFocus
      closeOnOutsidePointerDown
    >
      <WfrpSearchField
        id="monster-sidebar-search"
        label="Search monsters"
        placeholder="Search monsters"
        value={searchQuery}
        onSearch={setSearchQuery}
        onValueChange={setSearchQuery}
      />
      {activeCategories.length > 0 && (
        <div className="border-b border-wfrp-border bg-[#242424] px-4 py-3">
          <div className="space-y-1.5">
            <div className="wfrp-label text-wfrp-muted-text">Category</div>
            <WfrpFilterChips
              ariaLabel="Monster category filters"
              options={activeCategories}
              selectedIds={selectedFilters}
              onChange={setSelectedFilters}
            />
          </div>
        </div>
      )}
      <SidebarItemList
        className="!rounded-none !border-0"
        items={items}
        title="Monster"
        emptyMessage="No monsters match the selected filters."
      />
    </AppSidebar>
  );
}
