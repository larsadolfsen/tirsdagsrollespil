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
import { TraitPickerSidebar } from "./TraitPickerSidebar";
import { parseSkillEntry, parseTalentEntry, parseTraitEntry } from "../../lib/adversaryRefs";
import { resolveSkillDisplay, resolveTalentDisplay, resolveTraitDisplay } from "../../lib/adversaryDisplay";
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

// Rebuild a stored "Base (Spec) value" string from its editable parts. The raw
// entries stay free text; parsing/resolution is delegated to adversaryRefs.ts.
function baseWithSpec(baseName: string, specialisation?: string): string {
  return specialisation ? `${baseName} (${specialisation})` : baseName;
}

function joinValue(base: string, value: string): string {
  return value.trim() ? `${base} ${value.trim()}` : base;
}

function UnlinkedMarker() {
  return <Text as="span" variant="bodyMuted" className="ml-1 text-xs italic">(unlinked)</Text>;
}

function SkillsField({ values, onChange }: { values: readonly string[]; onChange: (values: string[]) => void }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const rows = values.map((raw) => {
    const parsed = parseSkillEntry(raw);
    const display = resolveSkillDisplay(raw);
    return {
      base: baseWithSpec(parsed.baseName, parsed.specialisation),
      value: parsed.value !== undefined ? String(parsed.value) : "",
      displayName: display.displayName,
      isLinked: !display.unresolved,
    };
  });

  return (
    <div className="space-y-2">
      <Label>Skills</Label>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={`${row.base}-${index}`} className="flex items-center gap-2">
            <Text className="flex-1">
              {row.displayName}
              {!row.isLinked ? <UnlinkedMarker /> : null}
            </Text>
            <Input
              type="number"
              className="w-20"
              value={row.value}
              onChange={(event) => {
                const next = [...values];
                next[index] = joinValue(row.base, event.target.value);
                onChange(next);
              }}
            />
            <Button
              variant="ghost"
              autoHeight
              leadingIcon={<X size={14} />}
              aria-label={`Remove skill ${row.displayName}`}
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
        excludeNames={rows.map((row) => row.base)}
        onSelect={(name) => onChange([...values, joinValue(name, "0")])}
      />
    </div>
  );
}

function TalentsField({ values, onChange }: { values: readonly string[]; onChange: (values: string[]) => void }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const rows = values.map((raw) => {
    const parsed = parseTalentEntry(raw);
    const display = resolveTalentDisplay(raw);
    const suffixParts: string[] = [];
    if (parsed.specialisation) suffixParts.push(`(${parsed.specialisation})`);
    if (parsed.value !== undefined) suffixParts.push(String(parsed.value));
    return {
      base: parsed.baseName,
      suffix: suffixParts.join(" "),
      displayName: display.displayName,
      isLinked: !display.unresolved,
    };
  });

  return (
    <div className="space-y-2">
      <Label>Talents</Label>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={`${row.base}-${index}`} className="flex items-center gap-2">
            <Text className="flex-1">
              {row.displayName}
              {!row.isLinked ? <UnlinkedMarker /> : null}
            </Text>
            <Input
              placeholder="Specialisation / rating"
              className="w-44"
              value={row.suffix}
              onChange={(event) => {
                const next = [...values];
                next[index] = joinValue(row.base, event.target.value);
                onChange(next);
              }}
            />
            <Button
              variant="ghost"
              autoHeight
              leadingIcon={<X size={14} />}
              aria-label={`Remove talent ${row.displayName}`}
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
        excludeNames={rows.map((row) => row.base)}
        onSelect={(name) => onChange([...values, name])}
      />
    </div>
  );
}

function formatTraitEntry(base: string, spec: string, rating: string): string {
  let entry = base;
  if (spec.trim()) entry += ` (${spec.trim()})`;
  if (rating.trim()) entry += ` ${rating.trim()}`;
  return entry;
}

function TraitsField({ values, onChange }: { values: readonly string[]; onChange: (values: string[]) => void }) {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const rows = values.map((raw) => {
    const parsed = parseTraitEntry(raw);
    const display = resolveTraitDisplay(raw);
    return {
      base: parsed.baseName,
      spec: parsed.specialisation ?? "",
      rating: parsed.rating !== undefined ? String(parsed.rating) : "",
      displayName: display.displayName,
      isLinked: !display.unresolved,
    };
  });

  return (
    <div className="space-y-2">
      <Label>Traits</Label>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={`${row.base}-${index}`} className="flex items-center gap-2">
            <Text className="flex-1">
              {row.displayName}
              {!row.isLinked ? <UnlinkedMarker /> : null}
            </Text>
            <Input
              placeholder="Specialisation"
              className="w-36"
              value={row.spec}
              onChange={(event) => {
                const next = [...values];
                next[index] = formatTraitEntry(row.base, event.target.value, row.rating);
                onChange(next);
              }}
            />
            <Input
              type="number"
              placeholder="Rating"
              className="w-20"
              value={row.rating}
              onChange={(event) => {
                const next = [...values];
                next[index] = formatTraitEntry(row.base, row.spec, event.target.value);
                onChange(next);
              }}
            />
            <Button
              variant="ghost"
              autoHeight
              leadingIcon={<X size={14} />}
              aria-label={`Remove trait ${row.displayName}`}
              onClick={() => onChange(values.filter((_, i) => i !== index))}
            />
          </div>
        ))}
      </div>
      <Button
        variant="secondary"
        autoHeight
        leadingIcon={<Plus size={14} />}
        name="Add Trait"
        onClick={() => setIsPickerOpen(true)}
      />
      <TraitPickerSidebar
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        excludeNames={rows.map((row) => row.base)}
        onSelect={(name) => onChange([...values, name])}
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
            <TraitsField
              values={npcDraft.traits ?? []}
              onChange={(traits) => setNpcDraft((d) => ({ ...d, traits }))}
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
