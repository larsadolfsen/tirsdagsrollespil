import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import {
  Button,
  Heading,
  Input,
  Label,
  Select,
  SelectItem,
  Text,
} from "../ui";
import { SkillPickerSidebar } from "./SkillPickerSidebar";
import { TalentPickerSidebar } from "./TalentPickerSidebar";
import { talentDefinitions } from "../../data/rules/wfrp4e/talents";
import type { NpcTemplate, NpcStatBlock } from "../../data/npcTypes";
import type {
  CreatureCategory,
  CreatureSize,
  CreatureTemplate,
  CreatureTraitInstance,
} from "../../data/rules/wfrp4e/creatureCatalog";
import { creatureTraitDefinitions } from "../../data/rules/wfrp4e/creatureTraits";
import type { AdversaryEditorType } from "../../data/adversaryEditorTypes";

const npcCharacteristicKeys: (keyof NpcStatBlock)[] = [
  "M", "WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel", "W",
];

const creatureCharacteristicKeys: (keyof CreatureTemplate["statBlock"]["characteristics"])[] = [
  "WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel",
];

const creatureCategoryOptions: CreatureCategory[] = [
  "beast", "daemon", "greenskin", "human", "monster", "skaven", "spirit", "undead",
];

const creatureSizeOptions: CreatureSize[] = [
  "tiny", "little", "small", "average", "large", "enormous", "monstrous",
];

const talentNamesByLengthDesc = [...talentDefinitions].sort((a, b) => b.name.length - a.name.length);

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function emptyNpcStatBlock(): NpcStatBlock {
  return { M: 4, WS: 20, BS: 20, S: 20, T: 20, I: 20, Ag: 20, Dex: 20, Int: 20, WP: 20, Fel: 20, W: 10 };
}

function emptyCreatureStatBlock(): CreatureTemplate["statBlock"] {
  return {
    movement: 4,
    wounds: 10,
    characteristics: { WS: 20, BS: 20, S: 20, T: 20, I: 20, Ag: 20, Dex: 20, Int: 20, WP: 20, Fel: 20 },
  };
}

function makeEmptyNpc(isNpc: boolean): NpcTemplate {
  return {
    id: "",
    name: "",
    isNpc,
    category: "human",
    tags: [],
    statBlock: emptyNpcStatBlock(),
  };
}

function makeEmptyCreature(): CreatureTemplate {
  return {
    id: "",
    name: "",
    category: "human",
    statBlock: emptyCreatureStatBlock(),
    traits: [],
    trappings: [],
  };
}

function parseSkillEntry(entry: string): { name: string; value: string } {
  const match = entry.match(/^(.*?)(?:\s+(\d+))?$/);
  return { name: match?.[1] ?? entry, value: match?.[2] ?? "" };
}

function formatSkillEntry(name: string, value: string): string {
  return value.trim() ? `${name} ${value.trim()}` : name;
}

function parseTalentEntry(entry: string): { name: string; suffix: string; isLinked: boolean } {
  const matchedTalent = talentNamesByLengthDesc.find(
    (talent) => entry === talent.name || entry.startsWith(`${talent.name} `),
  );

  if (matchedTalent) {
    return { name: matchedTalent.name, suffix: entry.slice(matchedTalent.name.length).trim(), isLinked: true };
  }

  return { name: entry, suffix: "", isLinked: false };
}

function formatTalentEntry(name: string, suffix: string): string {
  return suffix.trim() ? `${name} ${suffix.trim()}` : name;
}

function SkillsField({ values, onChange }: { values: readonly string[]; onChange: (values: string[]) => void }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const parsedEntries = values.map(parseSkillEntry);

  return (
    <div className="space-y-2">
      <Label>Skills</Label>
      <div className="space-y-2">
        {parsedEntries.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center gap-2">
            <Text className="flex-1">{entry.name}</Text>
            <Input
              type="number"
              className="w-20"
              value={entry.value}
              onChange={(event) => {
                const next = [...values];
                next[index] = formatSkillEntry(entry.name, event.target.value);
                onChange(next);
              }}
            />
            <Button
              variant="ghost"
              autoHeight
              leadingIcon={<X size={14} />}
              aria-label={`Remove skill ${entry.name}`}
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            />
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        autoHeight
        leadingIcon={<Plus size={14} />}
        name="Add Skill"
        onClick={() => setIsPickerOpen(true)}
      />
      <SkillPickerSidebar
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        excludeNames={parsedEntries.map((entry) => entry.name)}
        onSelect={(name) => onChange([...values, formatSkillEntry(name, "0")])}
      />
    </div>
  );
}

function TalentsField({ values, onChange }: { values: readonly string[]; onChange: (values: string[]) => void }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const parsedEntries = values.map(parseTalentEntry);

  return (
    <div className="space-y-2">
      <Label>Talents</Label>
      <div className="space-y-2">
        {parsedEntries.map((entry, index) => (
          <div key={`${entry.name}-${index}`} className="flex items-center gap-2">
            <Text className="flex-1">
              {entry.name}
              {!entry.isLinked ? <Text as="span" variant="bodyMuted" className="ml-1 text-xs italic">(unlinked)</Text> : null}
            </Text>
            <Input
              placeholder="Specialisation / rating"
              className="w-44"
              value={entry.suffix}
              onChange={(event) => {
                const next = [...values];
                next[index] = formatTalentEntry(entry.name, event.target.value);
                onChange(next);
              }}
            />
            <Button
              variant="ghost"
              autoHeight
              leadingIcon={<X size={14} />}
              aria-label={`Remove talent ${entry.name}`}
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            />
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        autoHeight
        leadingIcon={<Plus size={14} />}
        name="Add Talent"
        onClick={() => setIsPickerOpen(true)}
      />
      <TalentPickerSidebar
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        excludeNames={parsedEntries.map((entry) => entry.name)}
        onSelect={(name) => onChange([...values, formatTalentEntry(name, "")])}
      />
    </div>
  );
}

function TrappingsField({ values, onChange }: { values: readonly string[]; onChange: (values: string[]) => void }) {
  return (
    <div className="space-y-2">
      <Label>Trappings</Label>
      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={value}
              placeholder="Trapping"
              onChange={(event) => {
                const next = [...values];
                next[index] = event.target.value;
                onChange(next);
              }}
            />
            <Button
              variant="ghost"
              autoHeight
              leadingIcon={<X size={14} />}
              aria-label={`Remove trapping entry ${index + 1}`}
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            />
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        autoHeight
        leadingIcon={<Plus size={14} />}
        name="Add Trapping"
        onClick={() => onChange([...values, ""])}
      />
    </div>
  );
}

export function AdversaryRecordForm({
  editorType,
  record,
  existingIds,
  onCancel,
  onSave,
}: {
  editorType: AdversaryEditorType;
  record: NpcTemplate | CreatureTemplate | null;
  existingIds: readonly string[];
  onCancel: () => void;
  onSave: (record: NpcTemplate | CreatureTemplate, nextType: AdversaryEditorType) => void;
}) {
  const isCreature = editorType === "creature";
  const [npcDraft, setNpcDraft] = useState<NpcTemplate>(() =>
    !isCreature ? ((record as NpcTemplate) ?? makeEmptyNpc(editorType === "npc")) : makeEmptyNpc(false),
  );
  const [creatureDraft, setCreatureDraft] = useState<CreatureTemplate>(() =>
    isCreature ? ((record as CreatureTemplate) ?? makeEmptyCreature()) : makeEmptyCreature(),
  );
  const [idTouched, setIdTouched] = useState(Boolean(record));
  const [error, setError] = useState<string | null>(null);

  const otherIds = useMemo(
    () => existingIds.filter((id) => id !== record?.id),
    [existingIds, record],
  );

  function applyName(name: string) {
    if (isCreature) {
      setCreatureDraft((draft) => ({
        ...draft,
        name,
        id: idTouched ? draft.id : slugify(name),
      }));
    } else {
      setNpcDraft((draft) => ({
        ...draft,
        name,
        id: idTouched ? draft.id : slugify(name),
      }));
    }
  }

  function handleSave() {
    const draft = isCreature ? creatureDraft : npcDraft;

    if (!draft.id.trim()) {
      setError("An id is required.");
      return;
    }
    if (!draft.name.trim()) {
      setError("A name is required.");
      return;
    }
    if (otherIds.includes(draft.id)) {
      setError("This id is already used by another entry.");
      return;
    }

    const nextType: AdversaryEditorType = isCreature ? "creature" : npcDraft.isNpc ? "npc" : "generic";
    onSave(draft, nextType);
  }

  return (
    <div className="fixed inset-0 z-[70] flex flex-col overflow-y-auto bg-wfrp-dark font-sans">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-t-4 border-wfrp-border border-t-wfrp-red bg-sidebar px-4 py-3 md:px-8">
        <div>
          <p className="wfrp-sidebar-kicker">Adversary Editor</p>
          <Heading level={1} variant="pageSmall">
            {record ? "Edit" : "New"} {isCreature ? "Creature" : editorType === "npc" ? "NPC" : "Generic"}
          </Heading>
        </div>
        <Button onClick={onCancel} leadingIcon={<X size={14} />} name="Close" />
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 md:p-8">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="adversary-name">Name</Label>
            <Input
              id="adversary-name"
              value={isCreature ? creatureDraft.name : npcDraft.name}
              onChange={(event) => applyName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="adversary-id">Id</Label>
            <Input
              id="adversary-id"
              value={isCreature ? creatureDraft.id : npcDraft.id}
              onChange={(event) => {
                setIdTouched(true);
                const id = event.target.value;
                if (isCreature) setCreatureDraft((d) => ({ ...d, id }));
                else setNpcDraft((d) => ({ ...d, id }));
              }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="adversary-category">Category</Label>
            {isCreature ? (
              <Select
                id="adversary-category"
                value={creatureDraft.category}
                onChange={(event) =>
                  setCreatureDraft((d) => ({ ...d, category: event.target.value as CreatureCategory }))
                }
              >
                {creatureCategoryOptions.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </Select>
            ) : (
              <Input
                id="adversary-category"
                value={npcDraft.category}
                onChange={(event) => setNpcDraft((d) => ({ ...d, category: event.target.value }))}
              />
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="adversary-group">Group</Label>
            <Input
              id="adversary-group"
              value={isCreature ? creatureDraft.group ?? "" : npcDraft.group ?? ""}
              onChange={(event) => {
                const group = event.target.value || undefined;
                if (isCreature) setCreatureDraft((d) => ({ ...d, group }));
                else setNpcDraft((d) => ({ ...d, group }));
              }}
            />
          </div>
        </div>

        {!isCreature && (
          <div className="space-y-2">
            <Label htmlFor="adversary-description">Description</Label>
            <Input
              id="adversary-description"
              value={npcDraft.description ?? ""}
              onChange={(event) => setNpcDraft((d) => ({ ...d, description: event.target.value || undefined }))}
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={npcDraft.isNpc}
                disabled={editorType === "npc" || editorType === "generic"}
                onChange={(event) => setNpcDraft((d) => ({ ...d, isNpc: event.target.checked }))}
              />
              <Text variant="bodyMuted">Named NPC (uncheck for a reusable Generic template)</Text>
            </label>
          </div>
        )}

        {isCreature && (
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="creature-movement">Movement</Label>
              <Input
                id="creature-movement"
                type="number"
                value={creatureDraft.statBlock.movement}
                onChange={(event) =>
                  setCreatureDraft((d) => ({ ...d, statBlock: { ...d.statBlock, movement: Number(event.target.value) } }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creature-wounds">Wounds</Label>
              <Input
                id="creature-wounds"
                type="number"
                value={creatureDraft.statBlock.wounds}
                onChange={(event) =>
                  setCreatureDraft((d) => ({ ...d, statBlock: { ...d.statBlock, wounds: Number(event.target.value) } }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creature-size">Size</Label>
              <Select
                id="creature-size"
                value={creatureDraft.statBlock.size ?? ""}
                onChange={(event) =>
                  setCreatureDraft((d) => ({
                    ...d,
                    statBlock: { ...d.statBlock, size: (event.target.value || undefined) as CreatureSize | undefined },
                  }))
                }
              >
                <SelectItem value="">(none)</SelectItem>
                {creatureSizeOptions.map((size) => (
                  <SelectItem key={size} value={size}>{size}</SelectItem>
                ))}
              </Select>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label>Characteristics</Label>
          <div className="grid grid-cols-6 gap-2">
            {isCreature
              ? creatureCharacteristicKeys.map((key) => (
                  <div key={key} className="space-y-1">
                    <Text variant="bodyMuted" as="span" className="text-xs">{key}</Text>
                    <Input
                      type="number"
                      value={creatureDraft.statBlock.characteristics[key]}
                      onChange={(event) =>
                        setCreatureDraft((d) => ({
                          ...d,
                          statBlock: {
                            ...d.statBlock,
                            characteristics: { ...d.statBlock.characteristics, [key]: Number(event.target.value) },
                          },
                        }))
                      }
                    />
                  </div>
                ))
              : npcCharacteristicKeys.map((key) => (
                  <div key={key} className="space-y-1">
                    <Text variant="bodyMuted" as="span" className="text-xs">{key}</Text>
                    <Input
                      type="number"
                      value={npcDraft.statBlock[key]}
                      onChange={(event) =>
                        setNpcDraft((d) => ({
                          ...d,
                          statBlock: { ...d.statBlock, [key]: Number(event.target.value) },
                        }))
                      }
                    />
                  </div>
                ))}
          </div>
        </div>

        {!isCreature && (
          <>
            <SkillsField
              values={npcDraft.skills ?? []}
              onChange={(skills) => setNpcDraft((d) => ({ ...d, skills }))}
            />
            <TalentsField
              values={npcDraft.talents ?? []}
              onChange={(talents) => setNpcDraft((d) => ({ ...d, talents }))}
            />
            <TrappingsField
              values={npcDraft.trappings ?? []}
              onChange={(trappings) => setNpcDraft((d) => ({ ...d, trappings }))}
            />
          </>
        )}

        {isCreature && (
          <>
            <CreatureTraitListField
              label="Traits"
              traits={creatureDraft.traits}
              onChange={(traits) => setCreatureDraft((d) => ({ ...d, traits }))}
            />
            <CreatureTraitListField
              label="Optional traits"
              traits={creatureDraft.optionalTraits ?? []}
              onChange={(optionalTraits) => setCreatureDraft((d) => ({ ...d, optionalTraits }))}
            />
            <TrappingsField
              values={creatureDraft.trappings}
              onChange={(trappings) => setCreatureDraft((d) => ({ ...d, trappings }))}
            />
          </>
        )}

        {error ? <Text variant="bodyMuted" className="text-destructive">{error}</Text> : null}
      </main>

      <footer className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-wfrp-border bg-sidebar px-4 py-3 md:px-8">
        <Button variant="secondary" name="Cancel" onClick={onCancel} />
        <Button name="Save" onClick={handleSave} />
      </footer>
    </div>
  );
}

function CreatureTraitListField({
  label,
  traits,
  onChange,
}: {
  label: string;
  traits: readonly CreatureTraitInstance[];
  onChange: (traits: CreatureTraitInstance[]) => void;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="space-y-2">
        {traits.map((trait, index) => (
          <div key={index} className="flex items-center gap-2">
            <Select
              value={trait.id}
              onChange={(event) => {
                const next = [...traits];
                next[index] = { ...next[index], id: event.target.value as CreatureTraitInstance["id"] };
                onChange(next);
              }}
              className="w-48"
            >
              {creatureTraitDefinitions.map((definition) => (
                <SelectItem key={definition.id} value={definition.id}>{definition.name}</SelectItem>
              ))}
            </Select>
            <Input
              type="number"
              placeholder="Rating"
              className="w-24"
              value={trait.rating ?? ""}
              onChange={(event) => {
                const next = [...traits];
                const rating = event.target.value === "" ? undefined : Number(event.target.value);
                next[index] = { ...next[index], rating };
                onChange(next);
              }}
            />
            <Input
              placeholder="Value"
              value={typeof trait.value === "string" || typeof trait.value === "number" ? String(trait.value) : ""}
              onChange={(event) => {
                const next = [...traits];
                next[index] = { ...next[index], value: event.target.value || undefined };
                onChange(next);
              }}
            />
            <Button
              variant="ghost"
              autoHeight
              aria-label={`Remove ${label} entry ${index + 1}`}
              leadingIcon={<X size={14} />}
              onClick={() => onChange(traits.filter((_, i) => i !== index))}
            />
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        autoHeight
        leadingIcon={<Plus size={14} />}
        name="Add"
        onClick={() => onChange([...traits, { id: creatureTraitDefinitions[0].id as CreatureTraitInstance["id"] }])}
      />
    </div>
  );
}
