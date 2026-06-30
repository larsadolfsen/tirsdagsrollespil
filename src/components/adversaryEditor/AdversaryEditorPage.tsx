import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import {
  Button,
  Heading,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tabs,
  TabsList,
  TabsTrigger,
  Text,
  WfrpSearchField,
} from "../ui";
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

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent className="w-full max-w-4xl">
          <SheetHeader>
            <SheetTitle>Adversary Editor</SheetTitle>
          </SheetHeader>

          <div className="mt-4 space-y-4">
            <Tabs value={activeType} onValueChange={(value) => setActiveType(value as AdversaryEditorType)}>
              <TabsList>
                {tabs.map((tab) => (
                  <TabsTrigger key={tab.id} value={tab.id}>{tab.label}</TabsTrigger>
                ))}
              </TabsList>
            </Tabs>

            <div className="flex items-center gap-3">
              <WfrpSearchField
                id="adversary-editor-search"
                label="Search catalog"
                value={searchQuery}
                onValueChange={setSearchQuery}
                className="flex-1 border-0 bg-transparent px-0 py-0"
              />
              <Button
                leadingIcon={<Plus size={16} />}
                name="New"
                onClick={() => setEditingRecord(null)}
              />
            </div>

            {errorMessage ? <Text className="text-destructive">{errorMessage}</Text> : null}

            {isLoading ? (
              <Text variant="bodyMuted">Loading catalog…</Text>
            ) : visibleEntries.length === 0 ? (
              <Text variant="bodyMuted">No entries match.</Text>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Group</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleEntries.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.name}</TableCell>
                      <TableCell>{entry.category}</TableCell>
                      <TableCell>{entry.group ?? ""}</TableCell>
                      <TableCell className="flex justify-end gap-2 text-right">
                        <Button variant="secondary" autoHeight name="Edit" onClick={() => setEditingRecord(entry)} />
                        <Button variant="destructive" autoHeight name="Delete" onClick={() => setDeletingRecord(entry)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </SheetContent>
      </Sheet>

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
