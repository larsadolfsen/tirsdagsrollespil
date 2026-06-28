import { useEffect, useState } from "react";
import {
  GripVertical,
  Swords,
  Trash2,
  ChevronUp,
  ChevronDown,
  EllipsisVertical,
  Plus,
  Minus,
  Skull,
  ArrowDownWideNarrow,
  BookOpenText,
  Sparkles,
} from "lucide-react";
import { FormattedTextField } from "./FormattedTextField";
import {
  SheetDataDefinitionList,
  WfrpPanel,
  WfrpSection,
  WfrpStatusBadge,
} from "./wfrp";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Heading,
  CardDescription,
} from "./ui";
import type { CharacterSummary } from "../data/repository";
import { loadResolvedCharacter, loadCharacterProgress } from "../data/repository";
import { hydrateCharacterProgress, subscribeToProgressUpdates } from "../data/persistence";
import type { EncounterData, EncounterMonsterGroup } from "../data/gmSessions";
import { allSpellDefinitions, creatureTemplatesById } from "../data/rules/wfrp4e";
import type { CreatureTemplate, ResolvedCreatureTemplate } from "../data/rules/wfrp4e";
import { resolvedCreatureTemplatesById } from "../data/rules/wfrp4e";
import type { SpellDefinition } from "../types";
import { UI_LABELS } from "../labels";

export type SceneComponent = {
  id: string;
  type: "text" | "encounter";
  text: string;
  title?: string;
  encounterData?: EncounterData;
};

type SceneComponentsListProps = {
  sceneId: string;
  sceneNumber: number;
  components: SceneComponent[];
  characters: CharacterSummary[];
  onReorderComponents: (components: SceneComponent[]) => void;
  onRemoveComponent: (componentId: string) => void;
  onUpdateComponentText: (componentId: string, text: string) => void;
  onUpdateComponentTitle: (componentId: string, title: string) => void;
  onUpdateComponentEncounterData: (componentId: string, data: EncounterData) => void;
  onOpenMonsterSidebar: (onAdd: (template: CreatureTemplate, count: number) => void) => void;
  onRollInitiative?: (name: string, bonus: number) => void;
};

function getEncounterData(component: SceneComponent): EncounterData {
  if (component.encounterData) return component.encounterData;
  return {
    monsterGroups: [],
    playerOrder: component.text ? component.text.split(",").filter(Boolean) : [],
  };
}

function getPlayerCharacteristic(characterId: string, key: string): number {
  const char = loadResolvedCharacter(characterId);
  if (!char) return 0;
  const progress = loadCharacterProgress(characterId);
  const attrs = char.attributes as Record<string, number>;
  const baseAdvances = (char.characteristicAdvances ?? {}) as Record<string, number>;
  const curAdvances = ((progress?.characteristicAdvances ?? char.characteristicAdvances ?? {})) as Record<string, number>;
  const baseAdv = baseAdvances[key] ?? 0;
  const curAdv = curAdvances[key] ?? baseAdv;
  return (attrs[key] ?? 0) + (curAdv - baseAdv);
}

// ── Monster participant row ──────────────────────────────────────────────────

function MonsterParticipantRow({
  name,
  category,
  initiative,
  currentWounds,
  maxWounds,
}: {
  name: string;
  category: string;
  initiative: number;
  currentWounds: number;
  maxWounds: number;
}) {
  const isDead = currentWounds === 0;
  return (
    <>
      <TableCell>
        <div className={`flex h-9 w-9 items-center justify-center rounded border ${
          isDead ? "border-red-900/50 bg-red-950/20" : "border-wfrp-border bg-wfrp-dark"
        }`}>
          <Skull size={14} className={isDead ? "text-red-500/60" : "text-wfrp-muted-text/50"} />
        </div>
      </TableCell>
      <TableCell className="min-w-0">
        <span className={`block truncate font-semibold leading-tight ${isDead ? "text-wfrp-muted-text line-through" : ""}`}>
          {name}
        </span>
        <span className="block truncate capitalize text-wfrp-muted-text">{category}</span>
      </TableCell>
      <TableCell className="text-center font-semibold tabular-nums">{initiative}</TableCell>
      <TableCell className="text-right tabular-nums">
        <span className={`font-semibold ${isDead ? "text-red-400" : ""}`}>{currentWounds}</span>
        <span className={isDead ? "text-red-400" : "text-wfrp-muted-text"}>/{maxWounds}</span>
      </TableCell>
    </>
  );
}

// ── Player participant row ───────────────────────────────────────────────────

function PlayerParticipantRow({
  characterSummary,
  initiative,
}: {
  characterSummary: CharacterSummary;
  initiative: number;
}) {
  const character = loadResolvedCharacter(characterSummary.id);
  const [portraitDataUrl, setPortraitDataUrl] = useState("");
  const [characterName, setCharacterName] = useState(character.name);
  const [wounds, setWounds] = useState({
    current: character.wounds.current,
    max: character.wounds.max,
  });

  useEffect(() => {
    let cancelled = false;
    void hydrateCharacterProgress(characterSummary.id).then(() => {
      if (cancelled) return;
      const progress = loadCharacterProgress(characterSummary.id);
      setPortraitDataUrl(progress?.portraitDataUrl ?? "");
      setCharacterName(progress?.characterName?.trim() || character.name);
      setWounds({ current: progress?.woundsCurrent ?? character.wounds.current, max: character.wounds.max });
    });
    const unsub = subscribeToProgressUpdates((msg) => {
      if (cancelled || msg.characterId !== characterSummary.id) return;
      if (msg.type === "save") {
        setWounds({ current: msg.progress.woundsCurrent ?? character.wounds.current, max: character.wounds.max });
        if (msg.progress.characterName) setCharacterName(msg.progress.characterName.trim());
      } else if (msg.type === "clear") {
        setWounds({ current: character.wounds.current, max: character.wounds.max });
        setCharacterName(character.name);
      }
    });
    return () => { cancelled = true; unsub(); };
  }, [characterSummary.id, character.wounds.current, character.wounds.max, character.name]);

  const initials = characterName.split(" ").map((p) => p.charAt(0)).join("").slice(0, 2);
  const safeWoundsCurrent = Math.min(Math.max(0, wounds.current), wounds.max);
  const isDead = safeWoundsCurrent === 0;

  return (
    <>
      <TableCell>
        <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded border border-wfrp-border bg-wfrp-dark">
          {portraitDataUrl ? (
            <img src={portraitDataUrl} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="text-wfrp-muted-text">{initials}</span>
          )}
        </div>
      </TableCell>
      <TableCell className="min-w-0">
        <span className="block truncate font-semibold leading-tight">{characterName}</span>
        <span className="block truncate text-wfrp-muted-text">{character.tier}</span>
      </TableCell>
      <TableCell className="text-center font-semibold tabular-nums">{initiative}</TableCell>
      <TableCell className="text-right tabular-nums">
        <span className={`font-semibold ${isDead ? "text-red-400" : ""}`}>{safeWoundsCurrent}</span>
        <span className={isDead ? "text-red-400" : "text-wfrp-muted-text"}>/{wounds.max}</span>
      </TableCell>
    </>
  );
}


// ── Player info pane ─────────────────────────────────────────────────────────

function PlayerInfoPane({ characterId }: { characterId: string }) {
  const char = loadResolvedCharacter(characterId);
  const progress = loadCharacterProgress(characterId);
  if (!char) return null;

  const baseCharAdvances = char.characteristicAdvances ?? {};
  const currentAdvances = progress?.characteristicAdvances ?? baseCharAdvances;
  const attributes = Object.fromEntries(
    Object.entries(char.attributes).map(([key, value]) => {
      const baseAdv = baseCharAdvances[key] ?? 0;
      const curAdv = currentAdvances[key] ?? baseAdv;
      return [key, value + (curAdv - baseAdv)];
    }),
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="text-center">
        <span className="font-serif text-base font-semibold text-gray-100">{char.name}</span>
        <span className="wfrp-label block text-[10px] uppercase tracking-widest text-wfrp-muted-text mt-0.5">
          {char.tier}
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {UI_LABELS.CHARACTERISTICS.map((characteristic) => {
          const value = attributes[characteristic.key] || 0;
          const bonus = Math.floor(value / 10);
          return (
            <div key={characteristic.key} className="flex flex-col items-center">
              <span className="mb-1 text-[9px] font-semibold uppercase tracking-tight text-wfrp-muted-text leading-none">
                {characteristic.key}
              </span>
              <div className="relative">
                <div className="flex h-11 w-9 flex-col items-center justify-center rounded border border-wfrp-border bg-wfrp-surface shadow">
                  <span className="text-xs font-bold text-gray-100">{value}</span>
                  <div className="absolute -bottom-1 left-1/2 z-10 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border border-wfrp-border bg-wfrp-surface">
                    <span className="text-[7px] font-semibold text-wfrp-muted-text">{bonus}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Monster info pane ─────────────────────────────────────────────────────────

function MonsterInfoPane({
  template,
  displayName,
  currentWounds,
  maxWounds,
  onWoundChange,
  onRemove,
}: {
  template: ResolvedCreatureTemplate;
  displayName: string;
  currentWounds: number;
  maxWounds: number;
  onWoundChange: (delta: number) => void;
  onRemove: () => void;
}) {
  const { characteristics, movement, size } = template.statBlock;
  const isDead = currentWounds === 0;
  const traitValue = (trait: ResolvedCreatureTemplate["traits"][number]) => {
    const value = trait.value;
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (value !== undefined) return String(value);
    if (trait.rating !== undefined) return String(trait.rating);
    return "";
  };
  const spellcasterTraits = template.traits.filter((trait) => trait.id === "spellcaster");
  const spellSearchTerms = spellcasterTraits.flatMap((trait) => {
    if (Array.isArray(trait.value)) return trait.value;
    if (typeof trait.value === "string") return trait.value.split(/[,;]/);
    return [];
  }).map((value) => value.trim().toLowerCase()).filter(Boolean);
  const spells = allSpellDefinitions.filter((spell) => {
    if (spellSearchTerms.length === 0) return false;
    const spellName = spell.name.toLowerCase();
    const spellId = spell.id.toLowerCase();
    return spellSearchTerms.some((term) => {
      if (term === spellName || term === spellId) return true;
      if ((term.includes("fire") || term.includes("aqshy")) && spell.schools?.includes("fire")) return true;
      return false;
    });
  }) as SpellDefinition[];

  return (
    <WfrpPanel className="shadow-none">
    <article className="flex min-w-0 flex-col gap-5">
      <header className="border-b border-wfrp-gold/35 pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Heading level={3} variant="sectionProminent">{displayName}</Heading>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-wfrp-muted-text">
              {[size, template.category, template.group].filter(Boolean).join(" • ")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-semibold uppercase tracking-widest text-wfrp-muted-text">Move</span>
              <WfrpStatusBadge tone="gold" className="min-w-8 justify-center text-sm tabular-nums">
                {movement}
              </WfrpStatusBadge>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label={`${displayName} actions`}
                className="wfrp-standard-icon cursor-pointer"
              >
                <span className="wfrp-standard-icon__glyph" aria-hidden="true">
                  <EllipsisVertical />
                </span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem variant="destructive" onClick={onRemove}>
                  <Trash2 className="mr-2 size-4" aria-hidden="true" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-col">
        <section className="border-t border-wfrp-border/70 py-3" aria-labelledby={`characteristics-${template.id}`}>
          <Heading id={`characteristics-${template.id}`} level={4} variant="panel">
            Characteristics
          </Heading>
          <div className="grid grid-cols-10 gap-x-2">
            {(["WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel"] as const).map((key) => {
              const value = characteristics[key] ?? 0;
              return (
                <div key={key} className="text-center">
                  <span className="block text-[9px] font-semibold uppercase text-wfrp-muted-text">{key}</span>
                  <strong className="mt-0.5 block text-sm tabular-nums text-gray-100">{value}</strong>
                </div>
              );
            })}
          </div>
        </section>

        {/* Wounds tracker */}
        <section className="border-y border-wfrp-border/70 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.18em] text-wfrp-muted-text">Wounds</span>
              <span className={`mt-1 block text-2xl font-bold leading-none tabular-nums ${isDead ? "text-red-400" : "text-gray-100"}`}>
                {currentWounds}<span className="text-base font-medium text-wfrp-muted-text"> / {maxWounds}</span>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="secondary"
                onClick={() => onWoundChange(-1)}
                disabled={isDead}
                className="h-9 w-9 justify-center p-0"
                aria-label="Decrease wounds"
              >
                <Minus size={15} />
              </Button>
              <Button
                variant="secondary"
                onClick={() => onWoundChange(+1)}
                disabled={currentWounds >= maxWounds}
                className="h-9 w-9 justify-center p-0"
                aria-label="Increase wounds"
              >
                <Plus size={15} />
              </Button>
            </div>
            {isDead && <span className="sr-only">Incapacitated</span>}
          </div>
        </section>
      </div>

      {template.traits.length > 0 && (
        <WfrpSection
          title="Traits"
          actions={<WfrpStatusBadge>{template.traits.length}</WfrpStatusBadge>}
          aria-label="Traits"
        >
          <div className="divide-y divide-wfrp-border/60">
            {template.traits.map((trait) => {
              const value = traitValue(trait);
              const parameter = value
                ? `${trait.definition.parameter?.label ? `${trait.definition.parameter.label} ` : ""}${value}`
                : "";
              return (
                <div
                  key={`${trait.id}-${value}`}
                  className="py-3 first:pt-0 last:pb-0"
                >
                  <CardDescription>
                    <strong>
                      {trait.label || trait.definition.name}{parameter ? ` (${parameter})` : ""}.
                    </strong>{" "}
                    {trait.definition.summary}{" "}
                    {trait.definition.combatTracker}
                  </CardDescription>
                  {trait.notes && (
                    <CardDescription className="mt-1">{trait.notes}</CardDescription>
                  )}
                </div>
              );
            })}
          </div>
        </WfrpSection>
      )}

      {spellcasterTraits.length > 0 && (
        <WfrpSection
          title={<span className="flex items-center gap-2"><Sparkles size={15} className="text-wfrp-gold" /> Spells</span>}
          aria-label="Spells"
        >
          {spells.length > 0 ? (
            <div className="divide-y divide-wfrp-border/60">
              {spells.map((spell) => (
                <div key={spell.id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Heading level={5} variant="item">{spell.name}</Heading>
                    <WfrpStatusBadge tone="gold">CN {spell.cn}</WfrpStatusBadge>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-300">{spell.description}</p>
                  <SheetDataDefinitionList items={[
                    { label: "Range", value: spell.range },
                    { label: "Target", value: spell.target },
                    { label: "Duration", value: spell.duration },
                    ...(spell.damage !== "-" ? [{ label: "Damage", value: spell.damage }] : []),
                  ]} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-2 rounded border border-wfrp-border bg-wfrp-dark/35 p-3 text-xs leading-relaxed text-wfrp-muted-text">
              <BookOpenText size={15} className="mt-0.5 shrink-0" />
              <p>
                Spellcasting is listed as <span className="text-gray-300">{spellSearchTerms.join(", ") || "configured"}</span>,
                but no matching spell entries are available for this creature yet.
              </p>
            </div>
          )}
        </WfrpSection>
      )}
    </article>
    </WfrpPanel>
  );
}

// ── Encounter component ───────────────────────────────────────────────────────

function EncounterComponent({
  component,
  characters,
  onUpdateEncounterData,
  onOpenMonsterSidebar,
}: {
  component: SceneComponent;
  characters: CharacterSummary[];
  onUpdateEncounterData: (data: EncounterData) => void;
  onOpenMonsterSidebar: (onAdd: (template: CreatureTemplate, count: number) => void) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedParticipantIndex, setDraggedParticipantIndex] = useState<number | null>(null);

  const encounterData = getEncounterData(component);
  const { monsterGroups } = encounterData;

  // Build combined participant list
  type Participant =
    | { kind: "player"; id: string; characterId: string; initiative: number; agility: number }
    | { kind: "monster"; id: string; groupId: string; instanceIndex: number; initiative: number; agility: number; name: string; category: string; currentWounds: number; maxWounds: number };

  const allParticipants: Participant[] = [
    ...characters.map((char) => ({
      kind: "player" as const,
      id: `player-${char.id}`,
      characterId: char.id,
      initiative: getPlayerCharacteristic(char.id, "I"),
      agility: getPlayerCharacteristic(char.id, "Ag"),
    })),
    ...monsterGroups.flatMap((group): Participant[] => {
      const template = creatureTemplatesById[group.templateId as keyof typeof creatureTemplatesById];
      return group.wounds.map((currentWounds, i) => ({
        kind: "monster" as const,
        id: `monster-${group.id}-${i}`,
        groupId: group.id,
        instanceIndex: i,
        initiative: template?.statBlock.characteristics.I ?? 0,
        agility: template?.statBlock.characteristics.Ag ?? 0,
        name: group.name,
        category: template?.category ?? "",
        currentWounds,
        maxWounds: template?.statBlock.wounds ?? group.wounds[i] ?? 0,
      }));
    }),
  ];

  const monsterNameCounts = new Map<string, number>();
  for (const participant of allParticipants) {
    if (participant.kind !== "monster") continue;
    monsterNameCounts.set(participant.name, (monsterNameCounts.get(participant.name) ?? 0) + 1);
  }

  const monsterNameIndexes = new Map<string, number>();
  const namedParticipants = allParticipants.map((participant): Participant => {
    if (participant.kind !== "monster" || (monsterNameCounts.get(participant.name) ?? 0) < 2) {
      return participant;
    }
    const index = (monsterNameIndexes.get(participant.name) ?? 0) + 1;
    monsterNameIndexes.set(participant.name, index);
    return { ...participant, name: `${participant.name} (${index})` };
  });

  // Apply manual order if set; new participants fall back to rule sort at end
  const { manualOrder } = encounterData;
  const participants: Participant[] = (() => {
    if (manualOrder && manualOrder.length > 0) {
      const orderMap = new Map(manualOrder.map((id, i) => [id, i]));
      return [...namedParticipants].sort((a, b) => {
        const ai = orderMap.has(a.id) ? (orderMap.get(a.id) as number) : Infinity;
        const bi = orderMap.has(b.id) ? (orderMap.get(b.id) as number) : Infinity;
        if (ai !== bi) return ai - bi;
        return b.initiative - a.initiative || b.agility - a.agility;
      });
    }
    return [...namedParticipants].sort((a, b) => b.initiative - a.initiative || b.agility - a.agility);
  })();

  const totalCount = participants.length;

  const handleSelect = (id: string) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const handleParticipantDragStart = (index: number, event: React.DragEvent) => {
    setDraggedParticipantIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index.toString());
  };

  const handleParticipantDragEnter = (targetIndex: number) => {
    if (draggedParticipantIndex === null || draggedParticipantIndex === targetIndex) return;
    const reordered = [...participants];
    const [moved] = reordered.splice(draggedParticipantIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    onUpdateEncounterData({ ...encounterData, manualOrder: reordered.map((p) => p.id) });
    setDraggedParticipantIndex(targetIndex);
  };

  const handleParticipantDragEnd = () => setDraggedParticipantIndex(null);

  const handleSortByRules = () => {
    const sorted = [...participants].sort((a, b) => b.initiative - a.initiative || b.agility - a.agility);
    onUpdateEncounterData({ ...encounterData, manualOrder: sorted.map((p) => p.id) });
  };

  const handleAddMonster = (template: CreatureTemplate, count: number) => {
    const newGroup: EncounterMonsterGroup = {
      id: `monster-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      templateId: template.id,
      name: template.name,
      count,
      wounds: Array(count).fill(template.statBlock.wounds),
    };
    onUpdateEncounterData({
      ...encounterData,
      monsterGroups: [...monsterGroups, newGroup],
    });
  };

  const handleMonsterWoundChange = (groupId: string, instanceIndex: number, delta: number) => {
    const group = monsterGroups.find((g) => g.id === groupId);
    if (!group) return;
    const template = creatureTemplatesById[group.templateId as keyof typeof creatureTemplatesById];
    const maxWounds = template?.statBlock.wounds ?? 0;
    onUpdateEncounterData({
      ...encounterData,
      monsterGroups: monsterGroups.map((g) => {
        if (g.id !== groupId) return g;
        const nextWounds = [...g.wounds];
        nextWounds[instanceIndex] = Math.max(0, Math.min(maxWounds, (nextWounds[instanceIndex] ?? 0) + delta));
        return { ...g, wounds: nextWounds };
      }),
    });
  };

  const handleRemoveMonsterGroup = (groupId: string) => {
    const removedIds = monsterGroups
      .find((g) => g.id === groupId)
      ?.wounds.map((_, i) => `monster-${groupId}-${i}`) ?? [];
    if (removedIds.includes(selectedId ?? "")) setSelectedId(null);
    onUpdateEncounterData({
      ...encounterData,
      monsterGroups: monsterGroups.filter((g) => g.id !== groupId),
    });
  };

  // Resolve selected participant for info pane
  const selectedParticipant = participants.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="mt-3 flex flex-col gap-0 overflow-hidden rounded border border-wfrp-border">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-wfrp-border bg-wfrp-surface/60 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="wfrp-label text-[11px] uppercase tracking-widest text-wfrp-muted-text">
              Initiative ({totalCount})
            </span>
            <Button
              variant="wfrpIcon"
              onClick={handleSortByRules}
              aria-label="Sort by initiative"
              title="Sort by Initiative (highest first)"
              leadingIcon={<ArrowDownWideNarrow />}
            />
          </div>
          <Button
            variant="secondary"
            onClick={() => onOpenMonsterSidebar(handleAddMonster)}
          >
            Add Monster
          </Button>
        </div>

        <div className="grid min-h-0 grid-cols-[340px_minmax(0,1fr)]">
          {/* Participant list */}
          <div className="min-w-0 border-r border-wfrp-border/40">
            <Table className="table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-6 p-0" />
                  <TableHead className="w-14" />
                  <TableHead>Name</TableHead>
                  <TableHead className="w-[72px] text-center">Initiative</TableHead>
                  <TableHead className="w-16 text-right">Wounds</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {participants.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-wfrp-muted-text">
                      <Swords size={20} className="mx-auto mb-2 opacity-30" />
                      <span className="italic">No participants yet</span>
                    </TableCell>
                  </TableRow>
                )}
                {participants.map((participant, index) => {
                  const isSelected = selectedId === participant.id;
                  const isDragging = draggedParticipantIndex === index;
                  return (
                    <TableRow
                      key={participant.id}
                      draggable
                      data-state={isSelected ? "selected" : undefined}
                      onClick={() => handleSelect(participant.id)}
                      onDragStart={(e) => handleParticipantDragStart(index, e)}
                      onDragEnter={() => handleParticipantDragEnter(index)}
                      onDragEnd={handleParticipantDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={`cursor-pointer ${isDragging ? "opacity-30" : ""}`}
                    >
                      <TableCell
                        className="cursor-grab p-0 text-center text-wfrp-muted-text active:cursor-grabbing"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <GripVertical size={12} className="mx-auto" />
                      </TableCell>
                      {participant.kind === "player" && (
                        <PlayerParticipantRow
                          characterSummary={characters.find((c) => c.id === participant.characterId)!}
                          initiative={participant.initiative}
                        />
                      )}
                      {participant.kind === "monster" && (
                        <MonsterParticipantRow
                          name={participant.name}
                          category={participant.category}
                          initiative={participant.initiative}
                          currentWounds={participant.currentWounds}
                          maxWounds={participant.maxWounds}
                        />
                      )}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Info pane */}
          <div className="flex min-w-0 flex-col justify-start p-4 sm:p-5">
            {!selectedParticipant && (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <Swords size={22} className="mb-2 text-wfrp-muted-text/30" />
                <span className="text-sm italic text-wfrp-muted-text font-sans">
                  Select a participant to view details
                </span>
              </div>
            )}
            {selectedParticipant?.kind === "player" && (
              <PlayerInfoPane characterId={selectedParticipant.characterId} />
            )}
            {selectedParticipant?.kind === "monster" && (() => {
              const resolved = resolvedCreatureTemplatesById[
                monsterGroups.find((g) => g.id === selectedParticipant.groupId)?.templateId as keyof typeof resolvedCreatureTemplatesById
              ];
              if (!resolved) return null;
              return (
                <div className="flex flex-col gap-3">
                  <MonsterInfoPane
                    template={resolved}
                    displayName={selectedParticipant.name}
                    currentWounds={selectedParticipant.currentWounds}
                    maxWounds={selectedParticipant.maxWounds}
                    onWoundChange={(delta) =>
                      handleMonsterWoundChange(selectedParticipant.groupId, selectedParticipant.instanceIndex, delta)
                    }
                    onRemove={() => handleRemoveMonsterGroup(selectedParticipant.groupId)}
                  />
                </div>
              );
            })()}
          </div>
        </div>
      </div>
  );
}

// ── SceneComponentsList ───────────────────────────────────────────────────────

export function SceneComponentsList({
  sceneId,
  sceneNumber,
  components,
  characters,
  onReorderComponents,
  onRemoveComponent,
  onUpdateComponentText,
  onUpdateComponentTitle,
  onUpdateComponentEncounterData,
  onOpenMonsterSidebar,
}: SceneComponentsListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [titleDraft, setTitleDraft] = useState("");

  const handleDragStart = (index: number, event: React.DragEvent) => {
    setDraggedIndex(index);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragEnter = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const nextComponents = [...components];
    const [draggedItem] = nextComponents.splice(draggedIndex, 1);
    nextComponents.splice(targetIndex, 0, draggedItem);
    onReorderComponents(nextComponents);
    setDraggedIndex(targetIndex);
  };

  const handleDragEnd = () => setDraggedIndex(null);

  const moveComponent = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= components.length) return;
    const nextComponents = [...components];
    const [movedItem] = nextComponents.splice(index, 1);
    nextComponents.splice(targetIndex, 0, movedItem);
    onReorderComponents(nextComponents);
  };

  if (components.length === 0) return null;

  return (
    <div className="mt-6 flex flex-col gap-6">
      {components.map((component, index) => {
        const isDragging = draggedIndex === index;
        const defaultTitle = component.type === "text" ? "Text field" : "Encounter";
        const title = component.title || defaultTitle;

        return (
          <div
            key={component.id}
            draggable
            onDragStart={(event) => handleDragStart(index, event)}
            onDragEnter={() => handleDragEnter(index)}
            onDragEnd={handleDragEnd}
            onDragOver={(event) => event.preventDefault()}
            className={`group/item flex flex-col border-b border-wfrp-border/40 pb-6 last:border-b-0 last:pb-0 transition-all duration-200 ${
              isDragging ? "opacity-30 scale-[0.98]" : ""
            }`}
          >
            {/* Control bar */}
            <div className="flex min-h-10 items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-8 w-6 cursor-grab items-center justify-center rounded text-wfrp-muted-text hover:text-white transition-colors active:cursor-grabbing"
                  title="Drag to reorder"
                >
                  <GripVertical size={16} aria-hidden="true" />
                </div>
                <div className="flex items-center font-serif text-base text-gray-200">
                  <span className="mr-1 select-none text-wfrp-muted-text/60">{index + 1}:</span>
                  {editingTitleId === component.id ? (
                    <input
                      type="text"
                      value={titleDraft}
                      onChange={(e) => setTitleDraft(e.target.value)}
                      onBlur={() => {
                        onUpdateComponentTitle(component.id, titleDraft.trim() || defaultTitle);
                        setEditingTitleId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          onUpdateComponentTitle(component.id, titleDraft.trim() || defaultTitle);
                          setEditingTitleId(null);
                        } else if (e.key === "Escape") {
                          setEditingTitleId(null);
                        }
                      }}
                      autoFocus
                      className="w-48 border-0 border-b border-wfrp-gold/50 bg-transparent p-0 font-serif text-base text-gray-200 outline-none"
                    />
                  ) : (
                    <span
                      onClick={() => { setTitleDraft(title); setEditingTitleId(component.id); }}
                      className="cursor-pointer border-b border-dashed border-transparent hover:border-wfrp-muted-text/50 hover:text-white transition-colors"
                      title="Click to rename"
                    >
                      {title}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="wfrpIcon"
                  onClick={() => moveComponent(index, "up")}
                  disabled={index === 0}
                  aria-label="Move component up"
                  leadingIcon={<ChevronUp />}
                />
                <Button
                  variant="wfrpIcon"
                  onClick={() => moveComponent(index, "down")}
                  disabled={index === components.length - 1}
                  aria-label="Move component down"
                  leadingIcon={<ChevronDown />}
                />
                <DropdownMenu>
                  <DropdownMenuTrigger
                    aria-label={`${title} actions`}
                    className="wfrp-standard-icon cursor-pointer"
                  >
                    <span className="wfrp-standard-icon__glyph" aria-hidden="true">
                      <EllipsisVertical />
                    </span>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => onRemoveComponent(component.id)}
                      className="text-red-400 hover:text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Body */}
            {component.type === "text" && (
              <div className="py-2">
                <FormattedTextField
                  value={component.text}
                  onChange={(text) => onUpdateComponentText(component.id, text)}
                  ariaLabel={`Scene ${sceneNumber} text field`}
                  placeholder="Write the scene text here…"
                />
              </div>
            )}
            {component.type === "encounter" && (
              <EncounterComponent
                component={component}
                characters={characters}
                onUpdateEncounterData={(data) => onUpdateComponentEncounterData(component.id, data)}
                onOpenMonsterSidebar={onOpenMonsterSidebar}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
