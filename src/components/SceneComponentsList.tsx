import { useEffect, useState } from "react";
import {
  GripVertical,
  Swords,
  Trash2,
  ChevronUp,
  ChevronDown,
  EllipsisVertical,
  Skull,
  BookOpenText,
} from "lucide-react";
import { FormattedTextField } from "./FormattedTextField";
import {
  SheetDataDefinitionList,
  WfrpPanel,
  WfrpSection,
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
  HeaderResourceSlider,
  Label,
  CardDescription,
} from "./ui";
import type { CharacterSummary } from "../data/repository";
import { loadResolvedCharacter, loadCharacterProgress, saveCharacterProgress } from "../data/repository";
import { hydrateCharacterProgress, subscribeToProgressUpdates } from "../data/persistence";
import type { EncounterData, EncounterMonsterGroup, GMSceneComponent } from "../data/gmSessions";
import { npcTemplatesById, type NpcTemplate } from "../data/npcs";
import { allSpellDefinitions, creatureTemplatesById } from "../data/rules/wfrp4e";
import type { CreatureTemplate, ResolvedCreatureTemplate } from "../data/rules/wfrp4e";
import { resolvedCreatureTemplatesById } from "../data/rules/wfrp4e";
import type { SpellDefinition } from "../types";
import type { CharacterProgressData } from "../types";
import { UI_LABELS } from "../labels";
import { loadGameSession } from "../lib/gameSession";
import { isPrayerDefinition } from "../tabs/spells/spellUtils";
import { talentDefinitions } from "../data/rules/wfrp4e/talents";

export type SceneComponent = GMSceneComponent;

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

const ENCOUNTER_SECTION_DIVIDER = {
  dividerPosition: "before" as const,
  dividerClassName: "bg-wfrp-border",
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
  isNpc,
}: {
  name: string;
  category: string;
  initiative: number;
  currentWounds: number;
  maxWounds: number;
  isNpc?: boolean;
}) {
  const isDead = currentWounds === 0;
  const initials = name
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2);

  return (
    <>
      <TableCell>
        <div className={`flex h-9 w-9 items-center justify-center rounded border overflow-hidden ${
          isNpc
            ? "border-wfrp-border bg-wfrp-dark"
            : (isDead ? "border-red-900/50 bg-red-950/20" : "border-wfrp-border bg-wfrp-dark")
        }`}>
          {isNpc ? (
            <span className="text-wfrp-muted-text">{initials}</span>
          ) : (
            <Skull size={14} className={isDead ? "text-red-500/60" : "text-wfrp-muted-text/50"} />
          )}
        </div>
      </TableCell>
      <TableCell className="min-w-0">
        <span className={`block truncate font-semibold leading-tight ${(!isNpc && isDead) ? "text-wfrp-muted-text line-through" : ""}`}>
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
  const [, setProgressVersion] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void hydrateCharacterProgress(characterId).then(() => {
      if (!cancelled) setProgressVersion((version) => version + 1);
    });
    const unsubscribe = subscribeToProgressUpdates((message) => {
      if (message.characterId === characterId) {
        setProgressVersion((version) => version + 1);
      }
    });
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [characterId]);

  const session = loadGameSession(characterId);
  const char = session.character;
  const progress = session.progress;
  const woundsCurrent = Math.min(Math.max(0, char.wounds.current), char.wounds.max);
  const trainedSkills = char.skills
    .filter((skill) => skill.advances > 0)
    .sort((a, b) => a.displayName.localeCompare(b.displayName));
  const sortedTalents = [...char.talents]
    .sort((a, b) => a.name.localeCompare(b.name));
  const visibleEquipment = char.equipment
    .filter((item) => item.equipped)
    .sort((a, b) => a.name.localeCompare(b.name));
  const hasBlessTalent = char.talents.some((talent) => talent.id === "bless" || talent.name === "Bless");
  const hasInvokeTalent = char.talents.some((talent) => /^Invoke(?:\s|$)/i.test(talent.name));
  const grantedPrayers = session.ruleset.spells.filter((spell) =>
    (hasBlessTalent && spell.school?.endsWith("-prayer")) ||
    (hasInvokeTalent && spell.school?.endsWith("-miracle")),
  );
  const prayers = Array.from(
    new Map(
      [...grantedPrayers, ...char.spells.filter(isPrayerDefinition)]
        .map((prayer) => [prayer.id, prayer]),
    ).values(),
  ).sort((a, b) => a.name.localeCompare(b.name));
  const spells = char.spells
    .filter((spell) => !isPrayerDefinition(spell))
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleWoundChange = (delta: number) => {
    const fallbackProgress: CharacterProgressData = {
      woundsCurrent,
      corruptionCurrent: char.corruption,
      fortuneCurrent: session.initialFortuneCurrent,
      xpCurrent: session.initialXpCurrent,
      skills: {},
      equipment: {},
    };
    saveCharacterProgress(characterId, {
      ...fallbackProgress,
      ...progress,
      woundsCurrent: Math.max(0, Math.min(char.wounds.max, woundsCurrent + delta)),
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <WfrpPanel className="shadow-none">
        <article className="flex min-w-0 flex-col gap-5">
          <header>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Heading level={3} variant="sectionProminent">{char.name}</Heading>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-wfrp-muted-text">
                  {[char.race, char.tier, char.status].filter(Boolean).join(" • ")}
                </p>
              </div>
              <HeaderResourceSlider
                label="Wounds"
                current={woundsCurrent}
                max={char.wounds.max}
                onAdjust={handleWoundChange}
                barClassName="bg-wfrp-red"
                showSteppers={false}
                contentClassName="flex w-24 min-w-0 flex-col gap-1"
              />
            </div>
          </header>

          <WfrpSection
            title="Characteristics"
            {...ENCOUNTER_SECTION_DIVIDER}
            aria-label="Characteristics"
          >
            <div className="grid grid-cols-10 gap-x-2">
              {UI_LABELS.CHARACTERISTICS.map((characteristic) => (
                <div key={characteristic.key} className="text-center">
                  <Label className="block text-center">{characteristic.key}</Label>
                  <strong className="mt-0.5 block text-sm tabular-nums text-gray-100">
                    {char.attributes[characteristic.key] ?? 0}
                  </strong>
                </div>
              ))}
            </div>
          </WfrpSection>

          <WfrpSection
            title="Skills"
            {...ENCOUNTER_SECTION_DIVIDER}
            aria-label="Skills"
          >
            <SheetDataDefinitionList
              className="!grid grid-cols-2 gap-x-6 gap-y-1 border-t-0 pt-0"
              items={trainedSkills.map((skill) => ({
                label: skill.displayName,
                value: `${(char.attributes[skill.characteristic] ?? 0) + skill.advances} (${skill.characteristic} +${skill.advances})`,
                labelClassName: "text-white",
                valueClassName: "tabular-nums",
              }))}
            />
          </WfrpSection>

          <WfrpSection
            title="Talents"
            {...ENCOUNTER_SECTION_DIVIDER}
            aria-label="Talents"
          >
            <SheetDataDefinitionList
              className="border-t-0 pt-0"
              items={sortedTalents.map((talent) => ({
                label: <span>{talent.name}</span>,
                value: talent.description,
                labelClassName: "text-white",
              }))}
            />
          </WfrpSection>

          <WfrpSection
            title="Trappings"
            {...ENCOUNTER_SECTION_DIVIDER}
            aria-label="Trappings"
          >
            {visibleEquipment.length > 0 ? (
              <SheetDataDefinitionList
                className="border-t-0 pt-0"
                items={visibleEquipment.map((item) => ({
                  label: item.quantity && item.quantity > 1 ? `${item.name} ×${item.quantity}` : item.name,
                  value: item.description || item.type,
                  labelClassName: "text-white",
                }))}
              />
            ) : (
              <p className="text-xs leading-relaxed text-gray-300">None equipped</p>
            )}
          </WfrpSection>

          {spells.length > 0 && (
            <WfrpSection
              title="Spells"
              {...ENCOUNTER_SECTION_DIVIDER}
              aria-label="Spells"
            >
              <div className="divide-y divide-wfrp-border/60">
                {spells.map((spell) => (
                  <div key={spell.id} className="py-3 first:pt-0 last:pb-0">
                    <Heading level={5} variant="item">{spell.name}</Heading>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-300">{spell.description}</p>
                    <SheetDataDefinitionList items={[
                      { label: "CN", value: spell.cn },
                      { label: "Range", value: spell.range },
                      { label: "Target", value: spell.target },
                      { label: "Duration", value: spell.duration },
                      ...(spell.damage !== "-" ? [{ label: "Damage", value: spell.damage }] : []),
                    ]} />
                  </div>
                ))}
              </div>
            </WfrpSection>
          )}

          {prayers.length > 0 && (
            <WfrpSection
              title="Prayers"
              {...ENCOUNTER_SECTION_DIVIDER}
              aria-label="Prayers"
            >
              <div className="divide-y divide-wfrp-border/60">
                {prayers.map((prayer) => (
                  <div key={prayer.id} className="py-3 first:pt-0 last:pb-0">
                    <Heading level={5} variant="item">{prayer.name}</Heading>
                    <p className="mt-1.5 text-xs leading-relaxed text-gray-300">{prayer.description}</p>
                    <SheetDataDefinitionList items={[
                      { label: "CN", value: prayer.cn },
                      { label: "Range", value: prayer.range },
                      { label: "Target", value: prayer.target },
                      { label: "Duration", value: prayer.duration },
                      ...(prayer.damage !== "-" ? [{ label: "Damage", value: prayer.damage }] : []),
                    ]} />
                  </div>
                ))}
              </div>
            </WfrpSection>
          )}
        </article>
      </WfrpPanel>
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
      <header>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <Heading level={3} variant="sectionProminent">{displayName}</Heading>
            <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-wfrp-muted-text">
              {[size, template.category, template.group].filter(Boolean).join(" • ")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <HeaderResourceSlider
              label="Wounds"
              current={currentWounds}
              max={maxWounds}
              onAdjust={onWoundChange}
              barClassName="bg-wfrp-red"
              contentClassName="flex w-24 min-w-0 flex-col gap-1"
            />
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

      <WfrpSection
        title="Characteristics"
        {...ENCOUNTER_SECTION_DIVIDER}
        aria-label="Characteristics"
      >
          <div className="grid grid-cols-10 gap-x-2">
            {(["WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel"] as const).map((key) => {
              const value = characteristics[key] ?? 0;
              return (
                <div key={key} className="text-center">
                  <Label className="block text-center">{key}</Label>
                  <strong className="mt-0.5 block text-sm tabular-nums text-gray-100">{value}</strong>
                </div>
              );
            })}
          </div>
      </WfrpSection>

      <WfrpSection
        title="Traits"
        {...ENCOUNTER_SECTION_DIVIDER}
        aria-label="Traits"
      >
        <SheetDataDefinitionList
          className="border-t-0 pt-0"
          items={[
            {
              label: "Movement",
              value: `Walk ${movement * 2} / Run ${movement * 4}`,
              labelClassName: "text-white",
            },
            ...template.traits.map((trait) => {
              const value = traitValue(trait);
              return {
                label: `${trait.label || trait.definition.name}${value ? ` (${value})` : ""}`,
                value: `${trait.definition.summary} ${trait.definition.combatTracker}${trait.notes ? ` ${trait.notes}` : ""}`,
                labelClassName: "text-white",
              };
            }),
          ].sort((left, right) => left.label.localeCompare(right.label))}
        />
      </WfrpSection>

      <WfrpSection
        title="Trappings"
        {...ENCOUNTER_SECTION_DIVIDER}
        aria-label="Trappings"
      >
        <CardDescription>{template.trappings.join(", ") || "None"}</CardDescription>
      </WfrpSection>

      {spellcasterTraits.length > 0 && (
        <WfrpSection
          title="Spells"
          {...ENCOUNTER_SECTION_DIVIDER}
          aria-label="Spells"
        >
          {spells.length > 0 ? (
            <div className="divide-y divide-wfrp-border/60">
              {spells.map((spell) => (
                <div key={spell.id} className="py-3 first:pt-0 last:pb-0">
                  <Heading level={5} variant="item">{spell.name}</Heading>
                  <p className="mt-1.5 text-xs leading-relaxed text-gray-300">{spell.description}</p>
                  <SheetDataDefinitionList items={[
                    { label: "CN", value: spell.cn },
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

function splitNpcListEntry(entry: string) {
  const match = entry.match(/^(.*?)(?:\s+([+-]?\d+))$/);
  return {
    label: match?.[1] ?? entry,
    value: match?.[2] ?? "",
  };
}

function NpcInfoPane({
  npc,
  displayName,
  currentWounds,
  onWoundChange,
  onRemove,
}: {
  npc: NpcTemplate;
  displayName: string;
  currentWounds: number;
  onWoundChange: (delta: number) => void;
  onRemove: () => void;
}) {
  const characteristics = npc.statBlock;
  const category = npc.category.charAt(0).toUpperCase() + npc.category.slice(1);
  const skills = (npc.skills ?? [])
    .map(splitNpcListEntry)
    .sort((a, b) => a.label.localeCompare(b.label));
  const talents = (npc.talents ?? [])
    .map(splitNpcListEntry)
    .sort((a, b) => a.label.localeCompare(b.label))
    .map((talent) => {
      const definition = talentDefinitions.find(
        (t) => t.name.toLowerCase().trim() === talent.label.toLowerCase().trim()
      );
      return {
        label: talent.label,
        value: definition
          ? (talent.value ? `${talent.value} — ${definition.description}` : definition.description)
          : talent.value,
        hasDefinition: !!definition,
      };
    });
  const trappings = [...(npc.trappings ?? [])].sort((a, b) => a.localeCompare(b));

  return (
    <div className="flex flex-col gap-3">
      <WfrpPanel className="shadow-none">
        <article className="flex min-w-0 flex-col gap-5">
          <header>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Heading level={3} variant="sectionProminent">{displayName}</Heading>
                <p className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-wfrp-muted-text">
                  {[category, npc.group].filter(Boolean).join(" • ")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <HeaderResourceSlider
                  label="Wounds"
                  current={currentWounds}
                  max={npc.statBlock.W}
                  onAdjust={onWoundChange}
                  barClassName="bg-wfrp-red"
                  showSteppers
                  contentClassName="flex w-24 min-w-0 flex-col gap-1"
                />
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

          <WfrpSection
            title="Characteristics"
            {...ENCOUNTER_SECTION_DIVIDER}
            aria-label="Characteristics"
          >
            <div className="grid grid-cols-10 gap-x-2">
              {(["WS", "BS", "S", "T", "I", "Ag", "Dex", "Int", "WP", "Fel"] as const).map((key) => (
                <div key={key} className="text-center">
                  <Label className="block text-center">{key}</Label>
                  <strong className="mt-0.5 block text-sm tabular-nums text-gray-100">
                    {characteristics[key]}
                  </strong>
                </div>
              ))}
            </div>
          </WfrpSection>

          <WfrpSection title="Skills" {...ENCOUNTER_SECTION_DIVIDER} aria-label="Skills">
            {skills.length > 0 ? (
              <SheetDataDefinitionList
                className="!grid grid-cols-2 gap-x-6 gap-y-1 border-t-0 pt-0"
                items={skills.map((skill) => ({
                  label: skill.label,
                  value: skill.value,
                  labelClassName: "text-white",
                  valueClassName: "tabular-nums",
                }))}
              />
            ) : (
              <p className="text-xs leading-relaxed text-gray-300">No trained skills listed</p>
            )}
          </WfrpSection>

          <WfrpSection title="Talents" {...ENCOUNTER_SECTION_DIVIDER} aria-label="Talents">
            {talents.length > 0 ? (
              <SheetDataDefinitionList
                className="border-t-0 pt-0"
                items={talents.map((talent) => ({
                  label: talent.label,
                  value: talent.value,
                  labelClassName: "text-white",
                  valueClassName: talent.hasDefinition ? undefined : "tabular-nums",
                }))}
              />
            ) : (
              <p className="text-xs leading-relaxed text-gray-300">No talents listed</p>
            )}
          </WfrpSection>

          <WfrpSection title="Trappings" {...ENCOUNTER_SECTION_DIVIDER} aria-label="Trappings">
            {trappings.length > 0 ? (
              <SheetDataDefinitionList
                className="border-t-0 pt-0"
                items={trappings.map((trapping) => ({
                  label: trapping,
                  value: "",
                  labelClassName: "text-white",
                }))}
              />
            ) : (
              <p className="text-xs leading-relaxed text-gray-300">None equipped</p>
            )}
          </WfrpSection>
        </article>
      </WfrpPanel>
    </div>
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
    | { kind: "monster"; id: string; groupId: string; instanceIndex: number; initiative: number; agility: number; name: string; category: string; currentWounds: number; maxWounds: number; isNpc?: boolean };

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
      const npc = group.source === "npc" ? npcTemplatesById[group.templateId] : undefined;
      return group.wounds.map((currentWounds, i) => ({
        kind: "monster" as const,
        id: `monster-${group.id}-${i}`,
        groupId: group.id,
        instanceIndex: i,
        initiative: npc?.statBlock.I ?? template?.statBlock.characteristics.I ?? 0,
        agility: npc?.statBlock.Ag ?? template?.statBlock.characteristics.Ag ?? 0,
        name: group.name,
        category: npc?.category ?? template?.category ?? "",
        currentWounds,
        maxWounds: npc?.statBlock.W ?? template?.statBlock.wounds ?? group.wounds[i] ?? 0,
        isNpc: group.source === "npc",
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
    const npc = group.source === "npc" ? npcTemplatesById[group.templateId] : undefined;
    const maxWounds = npc?.statBlock.W ?? template?.statBlock.wounds ?? group.wounds[instanceIndex] ?? 0;
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
        {/* Shared action and participant-column header */}
        <div className="grid h-12 shrink-0 grid-cols-[412px_minmax(0,1fr)] border-b border-wfrp-border bg-wfrp-surface/60">
          <div className="min-w-0 border-r border-wfrp-border/40">
            <Table className="h-full table-fixed">
              <colgroup>
                <col className="w-12" />
                <col className="w-14" />
                <col />
                <col className="w-[72px]" />
                <col className="w-16" />
              </colgroup>
              <TableHeader>
                <TableRow className="h-12 border-0 hover:bg-transparent">
                  <TableHead className="h-12 p-0" />
                  <TableHead className="h-12 w-14" />
                  <TableHead className="h-12">Name</TableHead>
                  <TableHead className="h-12 w-[72px] text-center">Initiative</TableHead>
                  <TableHead className="h-12 w-16 text-right">Wounds</TableHead>
                </TableRow>
              </TableHeader>
            </Table>
          </div>
          <div className="flex items-center justify-end px-4">
            <Button
              variant="secondary"
              onClick={() => onOpenMonsterSidebar(handleAddMonster)}
            >
              Add Monster
            </Button>
          </div>
        </div>

        <div className="grid min-h-0 grid-cols-[412px_minmax(0,1fr)]">
          {/* Participant list */}
          <div className="min-w-0 border-r border-wfrp-border/40">
            <Table className="table-fixed">
              <colgroup>
                <col className="w-12" />
                <col className="w-14" />
                <col />
                <col className="w-[72px]" />
                <col className="w-16" />
              </colgroup>
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
                          isNpc={participant.isNpc}
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
              const group = monsterGroups.find((entry) => entry.id === selectedParticipant.groupId);
              const npc = group?.source === "npc" ? npcTemplatesById[group.templateId] : undefined;
              if (npc) {
                return (
                  <NpcInfoPane
                    npc={npc}
                    displayName={selectedParticipant.name}
                    currentWounds={selectedParticipant.currentWounds}
                    onWoundChange={(delta) =>
                      handleMonsterWoundChange(selectedParticipant.groupId, selectedParticipant.instanceIndex, delta)
                    }
                    onRemove={() => handleRemoveMonsterGroup(selectedParticipant.groupId)}
                  />
                );
              }
              const resolved = resolvedCreatureTemplatesById[
                group?.templateId as keyof typeof resolvedCreatureTemplatesById
              ];
              if (!resolved) {
                return (
                  <p className="text-sm text-wfrp-muted-text">
                    No details are available for {selectedParticipant.name}.
                  </p>
                );
              }
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
              <div className="py-2 pl-8">
                <FormattedTextField
                  className="max-w-[400px]"
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
