import { useMemo, useState } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarItemList } from "./SidebarItemList";
import { WfrpFilterChips, WfrpSearchField } from "../ui";
import { expandNpcTemplate, isNamedNpc, npcTemplates, type NpcTemplate } from "../../data/npcs";

export function NpcSidebar({
  isOpen,
  onClose,
  onAddNpc,
  onRemoveNpc,
  sceneNpcIds = [],
  sessionNpcIds = [],
  showActiveFilters = false,
  title = "Add NPC",
  className,
}: {
  isOpen: boolean;
  onClose: () => void;
  onAddNpc: (template: NpcTemplate, count: number) => void;
  onRemoveNpc?: (template: NpcTemplate) => void;
  sceneNpcIds?: string[];
  sessionNpcIds?: string[];
  showActiveFilters?: boolean;
  title?: string;
  className?: string;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<("in-scene" | "in-session")[]>([]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const sceneNpcIdSet = useMemo(() => new Set(sceneNpcIds), [sceneNpcIds]);
  const sessionNpcIdSet = useMemo(() => new Set(sessionNpcIds), [sessionNpcIds]);
  const namedNpcTemplates = useMemo(
    () => npcTemplates.filter(isNamedNpc).flatMap(expandNpcTemplate),
    [],
  );

  const items = useMemo(() => {
    return namedNpcTemplates
      .filter((npc) => {
        const isInScene = sceneNpcIdSet.has(npc.id);
        const isInSession = sessionNpcIdSet.has(npc.id);
        if (activeFilters.includes("in-scene") && !isInScene) return false;
        if (activeFilters.includes("in-session") && !isInSession) return false;
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
        const isInScene = sceneNpcIdSet.has(npc.id);
        const addLabel = showActiveFilters ? "Add to Scene" : "Add";
        return {
          id: npc.id,
          isMarked: isInScene,
          name: npc.name,
          meta: npc.category,
          actions: [
            {
              isActive: !isInScene,
              className: showActiveFilters && isInScene
                ? "text-red-400 hover:text-red-300 focus-visible:text-red-300"
                : undefined,
              label: showActiveFilters
                ? isInScene ? "Remove from Scene" : addLabel
                : addLabel,
              onClick: () => {
                if (showActiveFilters && isInScene && onRemoveNpc) {
                  onRemoveNpc(npc);
                  return;
                }
                onAddNpc(npc, 1);
              },
            },
          ],
        };
      });
  }, [
    namedNpcTemplates,
    normalizedQuery,
    onAddNpc,
    onRemoveNpc,
    activeFilters,
    sceneNpcIdSet,
    sessionNpcIdSet,
    showActiveFilters,
  ]);

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="npc-sidebar"
      onClose={onClose}
      side="right"
      title={title}
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
      {showActiveFilters && (
        <div className="border-b border-wfrp-border bg-[#242424] px-4 py-3">
          <div className="space-y-1.5">
            <div className="wfrp-label text-wfrp-muted-text">Active</div>
            <WfrpFilterChips
              ariaLabel="Active NPC filters"
              options={[
                { id: "in-scene" as const, label: "In Scene" },
                { id: "in-session" as const, label: "In Session" },
              ]}
              selectedIds={activeFilters}
              onChange={setActiveFilters}
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
