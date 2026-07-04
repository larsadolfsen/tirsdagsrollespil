import { skillDefinitions, skillSpecialisationDefinitions } from "../data/rules/wfrp4e";
import { talentDefinitions } from "../data/rules/wfrp4e/talents";
import { creatureTraitDefinitions } from "../data/rules/wfrp4e/creatureTraits";

// NPC / generic stat blocks store skills, talents, and traits as free-text display
// strings ("Dodge 54", "Strike to Stun", "Weapon (Sword) +8"). These parsers resolve
// them to prefixed catalog ids. Field-specific by design (id-collision safety): a
// talent parser never resolves against the trait catalog and vice-versa.

function toSnakeCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

// Build name -> id maps, stripping any parenthetical from catalog names so a grouped
// definition like "Hatred (Group)" is keyed as "hatred".
function nameKey(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, "").trim().toLowerCase();
}
function buildNameToId(defs: ReadonlyArray<{ id: string; name: string }>): Record<string, string> {
  const map: Record<string, string> = {};
  for (const def of defs) {
    map[nameKey(def.name)] = def.id;
  }
  return map;
}

const skillNameToId = buildNameToId(skillDefinitions);
const talentNameToId = buildNameToId(talentDefinitions);
const traitNameToId = buildNameToId(creatureTraitDefinitions);
const specIds = new Set(skillSpecialisationDefinitions.map((spec) => spec.id));

export interface ParsedEntry {
  baseName: string;
  specialisation?: string;
  /** trailing target/rating number ("Dodge 54" -> 54, "Weapon (Sword) +8" -> 8) */
  value?: number;
  /** a second trailing "(N)" ("Ranged (Whip) +6 (6)" -> 6) */
  extra?: number;
}

/** Split a raw stat-block entry into base name, specialisation, and trailing numbers. */
export function tokenizeEntry(raw: string): ParsedEntry {
  let s = raw.trim();
  let extra: number | undefined;
  let value: number | undefined;

  // trailing "(N)" -> extra
  const extraMatch = s.match(/\s*\((\d+)\)\s*$/);
  if (extraMatch) {
    extra = Number(extraMatch[1]);
    s = s.slice(0, extraMatch.index).trim();
  }
  // trailing "+N" or "N" -> value
  const valueMatch = s.match(/\s*\+?(\d+)\s*$/);
  if (valueMatch) {
    value = Number(valueMatch[1]);
    s = s.slice(0, valueMatch.index).trim();
  }
  // remaining "(spec)" -> specialisation
  let specialisation: string | undefined;
  const specMatch = s.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (specMatch) {
    specialisation = specMatch[2].trim();
    s = specMatch[1].trim();
  }
  return { baseName: s, specialisation, value, extra };
}

export interface ParsedSkillEntry extends ParsedEntry {
  kind: "skill";
  baseId?: string;
  skillRef?: string;
  unresolved: boolean;
}
export function parseSkillEntry(raw: string): ParsedSkillEntry {
  const token = tokenizeEntry(raw);
  const baseId = skillNameToId[token.baseName.toLowerCase()];
  const skillRef =
    baseId && token.specialisation ? `${baseId}_${toSnakeCase(token.specialisation)}` : baseId;
  return { ...token, kind: "skill", baseId, skillRef, unresolved: !baseId };
}

export interface ParsedTalentEntry extends ParsedEntry {
  kind: "talent";
  talentId?: string;
  conditionTag?: string;
  unresolved: boolean;
}
export function parseTalentEntry(raw: string): ParsedTalentEntry {
  const token = tokenizeEntry(raw);
  const talentId = talentNameToId[token.baseName.toLowerCase()];
  const conditionTag = token.specialisation ? `target:${toSnakeCase(token.specialisation)}` : undefined;
  return { ...token, kind: "talent", talentId, conditionTag, unresolved: !talentId };
}

export interface ParsedTraitEntry extends ParsedEntry {
  kind: "trait";
  traitId?: string;
  /** the trait's parametric value (spec name, e.g. "Sword") */
  rating?: number;
  conditionTag?: string;
  unresolved: boolean;
}
export function parseTraitEntry(raw: string): ParsedTraitEntry {
  const token = tokenizeEntry(raw);
  const traitId = traitNameToId[token.baseName.toLowerCase()];
  const conditionTag = token.specialisation ? `using:${toSnakeCase(token.specialisation)}` : undefined;
  return { ...token, kind: "trait", traitId, rating: token.value, conditionTag, unresolved: !traitId };
}

export { specIds as skillSpecialisationIdSet };
