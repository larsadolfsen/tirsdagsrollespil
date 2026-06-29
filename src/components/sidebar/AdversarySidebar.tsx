import { useMemo, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarItemList } from "./SidebarItemList";
import { WfrpFilterChips, WfrpSearchField } from "../ui";
import { resolvedCreatureTemplates } from "../../data/rules/wfrp4e";
import type { CreatureTemplate } from "../../data/rules/wfrp4e";
import { npcTemplates } from "../../data/npcs";
import type { NpcTemplate } from "../../data/npcs";

type AdversaryCategory = string;

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
  const [selectedFilters, setSelectedFilters] = useState<AdversaryCategory[]>([]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const activeCategories = useMemo(() => {
    const present = new Set<string>();
    resolvedCreatureTemplates.forEach((t) => present.add(t.category));
    npcTemplates.forEach((n) => present.add(n.category));
    return Array.from(present)
      .sort()
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

    const npcs = npcTemplates.map((npc) => {
      const count = npc.count ?? 1;
      const skillsText = npc.skills && npc.skills.length > 0
        ? `Skills: ${npc.skills.join(", ")}.`
        : "";
      const talentsText = npc.talents && npc.talents.length > 0
        ? ` Talents: ${npc.talents.join(", ")}.`
        : "";
      const trappingsText = npc.trappings && npc.trappings.length > 0
        ? ` Trappings: ${npc.trappings.join(", ")}.`
        : "";

      const description = `${skillsText}${talentsText}${trappingsText}`.trim() || "No skills, talents, or trappings listed.";

      return {
        id: npc.id,
        name: npc.name,
        category: npc.category,
        type: "npc" as const,
        meta: `NPC - ${npc.category.charAt(0).toUpperCase() + npc.category.slice(1)}`,
        description,
        actions: [
          {
            isActive: true,
            label: count > 1 ? `Add ×${count}` : "Add",
            onClick: () => onAddAdversary(npc, count, "npc"),
          },
        ],
      };
    });

    const all = [...creatures, ...npcs];

    return all
      .filter((item) => {
        if (selectedFilters.length > 0 && !selectedFilters.includes(item.category)) return false;
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
  }, [normalizedQuery, onAddAdversary, selectedFilters]);

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
        <div className="border-b border-wfrp-border bg-[#242424] px-4 py-3">
          <div className="space-y-1.5">
            <div className="wfrp-label text-wfrp-muted-text">Category</div>
            <WfrpFilterChips
              ariaLabel="Adversary category filters"
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
        title="Adversary"
        emptyMessage="No adversaries match the selected filters."
      />
    </AppSidebar>
  );
}
