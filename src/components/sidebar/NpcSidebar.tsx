import { useMemo, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarItemList } from "./SidebarItemList";
import { WfrpFilterChips, WfrpSearchField } from "../ui";
import { npcTemplates, type NpcTemplate } from "../../data/npcs";

export function NpcSidebar({
  isOpen,
  onClose,
  onAddNpc,
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddNpc: (template: NpcTemplate, count: number) => void;
  className?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const activeCategories = useMemo(() => {
    const present = [...new Set(npcTemplates.map((n) => n.category))].sort();
    return present.map((c) => ({ id: c, label: c.charAt(0).toUpperCase() + c.slice(1) }));
  }, []);

  const items = useMemo(() => {
    return npcTemplates
      .filter((npc) => {
        if (selectedFilters.length > 0 && !selectedFilters.includes(npc.category)) return false;
        if (normalizedQuery) {
          return (
            npc.name.toLowerCase().includes(normalizedQuery) ||
            npc.category.toLowerCase().includes(normalizedQuery) ||
            (npc.group ?? "").toLowerCase().includes(normalizedQuery)
          );
        }
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((npc) => {
        const count = npc.count ?? 1;
        return {
          id: npc.id,
          name: npc.name,
          meta: npc.category,
          details: [
            { label: "M", value: npc.statBlock.M },
            { label: "W", value: npc.statBlock.W },
            { label: "WS", value: npc.statBlock.WS },
            { label: "BS", value: npc.statBlock.BS },
            { label: "I", value: npc.statBlock.I },
          ],
          actions: [
            {
              isActive: true,
              label: count > 1 ? `Add ×${count}` : "Add",
              onClick: () => onAddNpc(npc, count),
            },
          ],
        };
      });
  }, [normalizedQuery, onAddNpc, selectedFilters]);

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="npc-sidebar"
      onClose={onClose}
      side="right"
      title="Add NPC"
      titleId="npc-sidebar-title"
      closeLabel="Close NPC sidebar"
      alwaysOverlay
      contentClassName="!p-0"
      className={className}
      trapFocus
      closeOnOutsidePointerDown
    >
      <WfrpSearchField
        id="npc-sidebar-search"
        label="Search NPCs"
        placeholder="Search NPCs"
        value={searchQuery}
        onSearch={setSearchQuery}
        onValueChange={setSearchQuery}
      />
      {activeCategories.length > 0 && (
        <div className="border-b border-wfrp-border bg-[#242424] px-4 py-3">
          <div className="space-y-1.5">
            <div className="wfrp-label text-wfrp-muted-text">Category</div>
            <WfrpFilterChips
              ariaLabel="NPC category filters"
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
        title="NPC"
        emptyMessage="No NPCs match the selected filters."
      />
    </AppSidebar>
  );
}
