import { useMemo, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { WfrpFilterChips, WfrpSearchField, Button } from "../ui";
import { resolvedCreatureTemplates } from "../../data/rules/wfrp4e";
import type { CreatureCategory, CreatureTemplate } from "../../data/rules/wfrp4e";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";

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

function MonsterItem({
  template,
  onAdd,
}: {
  template: (typeof resolvedCreatureTemplates)[number];
  onAdd: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { characteristics, wounds, movement } = template.statBlock;
  const defaultCount = template.defaultCount ?? 1;
  const traitNames = template.traits.map((t) => t.definition.name).join(", ");

  return (
    <div className="border-b border-wfrp-border last:border-b-0">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-wfrp-surface-raised hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50"
      >
        <span className="wfrp-text-strong flex-1 leading-6 text-wfrp-muted-text">
          {template.name}
        </span>
        <span className="wfrp-label shrink-0 uppercase text-wfrp-muted-text">
          {template.category}
        </span>
        {expanded ? (
          <ChevronUp size={14} className="shrink-0 text-wfrp-muted-text" />
        ) : (
          <ChevronDown size={14} className="shrink-0 text-wfrp-muted-text" />
        )}
      </button>

      {expanded && (
        <div className="flex flex-col gap-2 bg-wfrp-stone px-4 pb-3 pt-1">
          {/* Stat row */}
          <div className="flex gap-3">
            {[
              { label: "M", value: movement },
              { label: "W", value: wounds },
              { label: "WS", value: characteristics.WS },
              { label: "BS", value: characteristics.BS },
              { label: "I", value: characteristics.I },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="wfrp-label text-[9px] uppercase text-wfrp-muted-text">
                  {stat.label}
                </span>
                <span className="text-sm font-bold text-gray-100">{stat.value}</span>
              </div>
            ))}
          </div>
          {traitNames && (
            <span className="wfrp-label text-[10px] text-wfrp-muted-text">{traitNames}</span>
          )}
          <Button
            variant="secondary"
            leadingIcon={<Plus />}
            onClick={onAdd}
            className="mt-1 w-full justify-center"
          >
            {defaultCount > 1 ? `Add ×${defaultCount}` : "Add"}
          </Button>
        </div>
      )}
    </div>
  );
}

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

  const filteredTemplates = useMemo(() => {
    return resolvedCreatureTemplates
      .filter((template) => {
        if (selectedFilters.length > 0 && !selectedFilters.includes(template.category)) {
          return false;
        }
        if (normalizedQuery) {
          return (
            template.name.toLowerCase().includes(normalizedQuery) ||
            template.category.toLowerCase().includes(normalizedQuery) ||
            (template.group ?? "").toLowerCase().includes(normalizedQuery)
          );
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [normalizedQuery, selectedFilters]);

  const activeCategories = useMemo(() => {
    const present = new Set(resolvedCreatureTemplates.map((t) => t.category));
    return CATEGORY_FILTERS.filter((f) => present.has(f.id));
  }, []);

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
        <div className="border-b border-wfrp-border bg-wfrp-stone px-4 py-3">
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

      <div>
        {filteredTemplates.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-wfrp-muted-text">
            No monsters match the selected filters.
          </p>
        ) : (
          filteredTemplates.map((template) => (
            <MonsterItem
              key={template.id}
              template={template}
              onAdd={() => onAddMonster(template, template.defaultCount ?? 1)}
            />
          ))
        )}
      </div>
    </AppSidebar>
  );
}
