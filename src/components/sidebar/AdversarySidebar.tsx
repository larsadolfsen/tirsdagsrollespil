import { useMemo, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarItemList } from "./SidebarItemList";
import { WfrpFilterChips, WfrpSearchField } from "../ui";
import { resolvedCreatureTemplates } from "../../data/rules/wfrp4e";
import type { CreatureTemplate } from "../../data/rules/wfrp4e";
import { adversaryTemplates, expandNpcTemplate, npcTemplates } from "../../data/npcs";
import type { NpcTemplate } from "../../data/npcs";

type AdversaryCategory = string;
type AdversaryTypeFilter = "npc" | "generic" | "creature";

const adversaryTypeOptions: Array<{ id: AdversaryTypeFilter; label: string }> = [
  { id: "npc", label: "NPC" },
  { id: "generic", label: "Generic" },
  { id: "creature", label: "Creature" },
];

export function AdversarySidebar({
  isOpen,
  onClose,
  onAddAdversary,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddAdversary: (template: CreatureTemplate | NpcTemplate, count: number, type: "creature" | "npc") => void;
  className?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState<AdversaryTypeFilter[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<AdversaryCategory[]>([]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const activeCategories = useMemo(() => {
    const present = new Set<string>();
    resolvedCreatureTemplates.forEach((t) => present.add(t.category));
    [...npcTemplates, ...adversaryTemplates].forEach((n) => present.add(n.category));
    return Array.from(present)
      .sort((a, b) => a.localeCompare(b))
      .map((c) => ({ id: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));
  }, []);

  const items = useMemo(() => {
    const creatures = resolvedCreatureTemplates.map((template) => {
      const count = template.defaultCount ?? 1;
      const traitNames = template.traits.map((t) => {
        const val = t.value ? ` (${Array.isArray(t.value) ? t.value.join(", ") : t.value})` : "";
        const rat = t.rating ? ` ${t.rating}` : "";
        return `${t.definition.name}${val}${rat}`;
      }).join(", ");

      const traitsText = traitNames ? `Traits: ${traitNames}.` : "No traits listed.";
      const trappingsText = template.trappings && template.trappings.length > 0
        ? ` Trappings: ${template.trappings.join(", ")}.`
        : "";

      return {
        id: template.id,
        name: template.name,
        category: template.category,
        type: "creature" as const,
        filterType: "creature" as const,
        meta: `Creature - ${template.category.charAt(0).toUpperCase() + template.category.slice(1)}`,
        description: `${traitsText}${trappingsText}`,
        actions: [
          {
            isActive: true,
            label: count > 1 ? `Add ×${count}` : "Add",
            onClick: () => onAddAdversary(template, count, "creature"),
          },
        ],
      };
    });

    const npcs = [...npcTemplates, ...adversaryTemplates]
      .flatMap(expandNpcTemplate)
      .map((npc) => {
        const scenario = npc.isNpc
          ? npc.tags.find((tag) => tag.includes("Three Feathers"))
          : undefined;

        return {
          id: npc.id,
          name: npc.name,
          category: npc.category,
          type: "npc" as const,
          isNpc: npc.isNpc,
          filterType: npc.isNpc ? "npc" as const : "generic" as const,
          meta: `${npc.isNpc ? "NPC" : "Generic"} - ${npc.category.charAt(0).toUpperCase() + npc.category.slice(1)}`,
          description: (
            <>
              <p>{npc.description ?? `A member of ${npc.group ?? "this scenario's cast"}.`}</p>
              {scenario ? <p className="mt-2">Scenario: {scenario}</p> : null}
            </>
          ),
          actions: [
            {
              isActive: true,
              label: "Add",
              onClick: () => onAddAdversary(npc, 1, "npc"),
            },
          ],
        };
      });

    const all = [...creatures, ...npcs];

    return all
      .filter((item) => {
        if (selectedTypes.length > 0 && !selectedTypes.includes(item.filterType)) return false;
        if (selectedCategories.length > 0 && !selectedCategories.includes(item.category)) return false;
        if (normalizedQuery) {
          return (
            item.name.toLowerCase().includes(normalizedQuery) ||
            item.category.toLowerCase().includes(normalizedQuery) ||
            item.meta.toLowerCase().includes(normalizedQuery)
          );
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [normalizedQuery, onAddAdversary, selectedCategories, selectedTypes]);

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="adversary-sidebar"
      onClose={onClose}
      side="right"
      title="Add Adversary"
      titleId="adversary-sidebar-title"
      closeLabel="Close adversary sidebar"
      alwaysOverlay
      contentClassName="!p-0"
      className={className}
      trapFocus
      closeOnOutsidePointerDown
    >
      <WfrpSearchField
        id="adversary-sidebar-search"
        label="Search adversaries"
        placeholder="Search adversaries"
        value={searchQuery}
        onSearch={setSearchQuery}
        onValueChange={setSearchQuery}
      />
      {activeCategories.length > 0 && (
        <div className="space-y-3 border-b border-wfrp-border bg-[#242424] px-4 py-3">
          <div className="space-y-1.5">
            <div className="wfrp-label text-wfrp-muted-text">Type</div>
            <WfrpFilterChips
              ariaLabel="Adversary type filters"
              options={adversaryTypeOptions}
              selectedIds={selectedTypes}
              onChange={setSelectedTypes}
            />
          </div>
          <div className="space-y-1.5">
            <div className="wfrp-label text-wfrp-muted-text">Category</div>
            <WfrpFilterChips
              ariaLabel="Adversary category filters"
              options={activeCategories}
              selectedIds={selectedCategories}
              onChange={setSelectedCategories}
            />
          </div>
        </div>
      )}
      <SidebarItemList
        className="!rounded-none !border-0"
        items={items}
        title="Adversary"
        emptyMessage="No adversaries match the selected filters."
      />
    </AppSidebar>
  );
}
