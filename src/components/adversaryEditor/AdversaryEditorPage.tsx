import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AppSidebar } from "../sidebar/AppSidebar";
import { SidebarItemList } from "../sidebar/SidebarItemList";
import { Button, Text, WfrpFilterChips, WfrpSearchField } from "../ui";
import { AdversaryRecordForm } from "./AdversaryRecordForm";
import { DeleteAdversaryDialog } from "./DeleteAdversaryDialog";
import { deleteAdversary, listAdversaries, saveAdversaryCatalog } from "../../lib/adversaryEditorApi";
import type { AdversaryEditorType } from "../../data/adversaryEditorTypes";
import type { NpcTemplate } from "../../data/npcTypes";
import type { CreatureTemplate } from "../../data/rules/wfrp4e/creatureCatalog";

type AdversaryRecord = NpcTemplate | CreatureTemplate;

const tabs: { id: AdversaryEditorType; label: string }[] = [
  { id: "npc", label: "NPC" },
  { id: "generic", label: "Generic" },
  { id: "creature", label: "Creature" },
];

export function AdversaryEditorPage({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeType, setActiveType] = useState<AdversaryEditorType>("npc");
  const [entriesByType, setEntriesByType] = useState<Record<AdversaryEditorType, AdversaryRecord[]>>({
    npc: [],
    generic: [],
    creature: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingRecord, setEditingRecord] = useState<AdversaryRecord | null | undefined>(undefined);
  const [deletingRecord, setDeletingRecord] = useState<AdversaryRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadType = useCallback(async (type: AdversaryEditorType) => {
    const entries = await listAdversaries(type);
    setEntriesByType((current) => ({ ...current, [type]: entries }));
  }, []);

  const loadAll = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await Promise.all(tabs.map((tab) => loadType(tab.id)));
    } catch (error) {
      setErrorMessage((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  }, [loadType]);

  useEffect(() => {
    if (isOpen) {
      void loadAll();
    }
  }, [isOpen, loadAll]);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleEntries = useMemo(() => {
    const entries = entriesByType[activeType];
    if (!normalizedQuery) return entries;
    return entries.filter(
      (entry) =>
        entry.name.toLowerCase().includes(normalizedQuery) ||
        entry.category.toLowerCase().includes(normalizedQuery),
    );
  }, [activeType, entriesByType, normalizedQuery]);

  const existingIds = useMemo(
    () => [...entriesByType.npc, ...entriesByType.generic, ...entriesByType.creature].map((entry) => entry.id),
    [entriesByType],
  );

  async function handleSave(record: AdversaryRecord, nextType: AdversaryEditorType) {
    setErrorMessage(null);
    try {
      const editingId = editingRecord?.id;
      const originalType = editingId
        ? tabs.find((tab) => entriesByType[tab.id].some((entry) => entry.id === editingId))?.id
        : undefined;

      if (originalType && originalType !== nextType) {
        const remaining = entriesByType[originalType].filter((entry) => entry.id !== editingId);
        await saveAdversaryCatalog(originalType, remaining as never);
        setEntriesByType((current) => ({ ...current, [originalType]: remaining }));
      }

      const withoutEditing = entriesByType[nextType].filter((entry) => entry.id !== editingId);
      const nextList = [...withoutEditing, record];

      await saveAdversaryCatalog(nextType, nextList as never);
      setEntriesByType((current) => ({ ...current, [nextType]: nextList }));
      setActiveType(nextType);
      setEditingRecord(undefined);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }

  async function handleDelete(record: AdversaryRecord) {
    setErrorMessage(null);
    try {
      await deleteAdversary(activeType, record.id);
      setEntriesByType((current) => ({
        ...current,
        [activeType]: current[activeType].filter((entry) => entry.id !== record.id),
      }));
      setDeletingRecord(null);
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  }

  const items = visibleEntries
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      meta: entry.category,
      description: entry.group ?? undefined,
      details: entry.group ? [{ label: "Group", value: entry.group }] : undefined,
      actions: [
        { label: "Edit", onClick: () => setEditingRecord(entry) },
        {
          className: "[&_span]:bg-destructive/80 [&_span]:text-white hover:[&_span]:bg-destructive",
          label: "Delete",
          onClick: () => setDeletingRecord(entry),
        },
      ],
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <AppSidebar
        isOpen={isOpen}
        motionKey="adversary-editor-sidebar"
        onClose={onClose}
        side="right"
        title="Adversary Editor"
        titleId="adversary-editor-title"
        closeLabel="Close adversary editor"
        alwaysOverlay
        contentClassName="!p-0"
        trapFocus
        closeOnOutsidePointerDown={!editingRecord && !deletingRecord}
        footer={(
          <Button
            leadingIcon={<Plus size={16} />}
            name="New"
            className="w-full"
            onClick={() => setEditingRecord(null)}
          />
        )}
      >
        <WfrpSearchField
          id="adversary-editor-search"
          label="Search catalog"
          placeholder="Search catalog"
          value={searchQuery}
          onSearch={setSearchQuery}
          onValueChange={setSearchQuery}
        />
        <div className="border-b border-wfrp-border bg-[#242424] px-4 py-3">
          <div className="space-y-1.5">
            <div className="wfrp-label text-wfrp-muted-text">Type</div>
            <WfrpFilterChips
              ariaLabel="Adversary type filters"
              options={tabs}
              selectedIds={[activeType]}
              onChange={(selected) => {
                const nextType = selected.find((id) => id !== activeType);
                if (nextType) setActiveType(nextType);
              }}
            />
          </div>
        </div>

        {errorMessage ? (
          <Text className="px-4 pt-3 text-destructive">{errorMessage}</Text>
        ) : null}

        <div className="p-4">
          {isLoading ? (
            <Text variant="bodyMuted">Loading catalog…</Text>
          ) : (
            <SidebarItemList
              items={items}
              title={tabs.find((tab) => tab.id === activeType)?.label}
              emptyMessage="No entries match."
            />
          )}
        </div>
      </AppSidebar>

      {editingRecord !== undefined ? (
        <AdversaryRecordForm
          editorType={activeType}
          record={editingRecord}
          existingIds={existingIds}
          onCancel={() => setEditingRecord(undefined)}
          onSave={handleSave}
        />
      ) : null}

      {deletingRecord ? (
        <DeleteAdversaryDialog
          name={deletingRecord.name}
          onCancel={() => setDeletingRecord(null)}
          onConfirm={() => handleDelete(deletingRecord)}
        />
      ) : null}
    </>
  );
}
