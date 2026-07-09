// Resolves NPC / generic free-text skill, talent, and trait strings into
// display-ready entities (resolved catalog name + rating + specialisation +
// description). Reuses the parsers in adversaryRefs.ts and the wfrp4e catalogs;
// consumed by NpcInfoPane (stat blocks) and the adversary editor.
import { parseSkillEntry, parseTalentEntry, parseTraitEntry } from "./adversaryRefs";
import { getSkillDisplayName, skillDefinitions, skillSpecialisationDefinitions } from "../data/rules/wfrp4e";
import { talentDefinitions } from "../data/rules/wfrp4e/talents";
import { creatureTraitDefinitions } from "../data/rules/wfrp4e/creatureTraits";

const skillById = new Map(skillDefinitions.map((skill) => [skill.id, skill]));
const specById = new Map(skillSpecialisationDefinitions.map((spec) => [spec.id, spec]));
const talentById = new Map(talentDefinitions.map((talent) => [talent.id, talent]));
const traitById = new Map(creatureTraitDefinitions.map((trait) => [trait.id, trait]));

function withSpec(name: string, specialisation?: string): string {
  return specialisation ? `${name} (${specialisation})` : name;
}

export interface ResolvedSkillDisplay {
  displayName: string;
  value?: number;
  skillRef?: string;
  unresolved: boolean;
}
export function resolveSkillDisplay(raw: string): ResolvedSkillDisplay {
  const parsed = parseSkillEntry(raw);
  const skill = parsed.baseId ? skillById.get(parsed.baseId) : undefined;
  const spec = parsed.skillRef ? specById.get(parsed.skillRef) : undefined;
  const displayName = skill
    ? getSkillDisplayName(skill, spec ?? (parsed.specialisation ? { name: parsed.specialisation } : null))
    : withSpec(parsed.baseName, parsed.specialisation);
  return { displayName, value: parsed.value, skillRef: parsed.skillRef, unresolved: parsed.unresolved };
}

export interface ResolvedTalentDisplay {
  displayName: string;
  description?: string;
  specialisation?: string;
  value?: number;
  talentId?: string;
  unresolved: boolean;
}
export function resolveTalentDisplay(raw: string): ResolvedTalentDisplay {
  const parsed = parseTalentEntry(raw);
  const talent = parsed.talentId ? talentById.get(parsed.talentId) : undefined;
  return {
    displayName: withSpec(talent?.name ?? parsed.baseName, parsed.specialisation),
    description: talent?.description,
    specialisation: parsed.specialisation,
    value: parsed.value,
    talentId: parsed.talentId,
    unresolved: parsed.unresolved,
  };
}

export interface ResolvedTraitDisplay {
  displayName: string;
  specialisation?: string;
  rating?: number;
  summary?: string;
  combatTracker?: string;
  traitId?: string;
  unresolved: boolean;
}
export function resolveTraitDisplay(raw: string): ResolvedTraitDisplay {
  const parsed = parseTraitEntry(raw);
  const trait = parsed.traitId ? traitById.get(parsed.traitId) : undefined;
  return {
    displayName: trait?.name ?? parsed.baseName,
    specialisation: parsed.specialisation,
    rating: parsed.rating,
    summary: trait?.summary,
    combatTracker: trait?.combatTracker,
    traitId: parsed.traitId,
    unresolved: parsed.unresolved,
  };
}
