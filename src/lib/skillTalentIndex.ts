import type { TalentDefinition } from "../types/rules";
import { talentDefinitions } from "../data/rules/wfrp4e/talents";
import { parseSkillRef } from "./skillRefs";

/** Minimal shape needed to derive a talent's skill refs (satisfied by TalentDefinition and ResolvedCharacterTalent). */
type TalentSkillRefSource = {
  relatedSkillIds?: TalentDefinition["relatedSkillIds"];
  grantsSkillIds?: TalentDefinition["grantsSkillIds"];
  effects?: TalentDefinition["effects"];
};

/** All structured skill refs a talent carries (effect skillIds + related + grants). */
export function collectTalentSkillRefs(talent: TalentSkillRefSource): string[] {
  return [
    ...(talent.relatedSkillIds ?? []),
    ...(talent.grantsSkillIds ?? []),
    ...(talent.effects ?? []).flatMap((effect) =>
      "skillIds" in effect ? (effect.skillIds ?? []) : [],
    ),
  ];
}

/**
 * Derived (D-c) reverse index: base skill id -> talents that reference it. A talent
 * with a specialisation ref (e.g. "skill_stealth_urban") is indexed under its base
 * ("skill_stealth") so a query on the base skill finds it. Single source of truth —
 * built from talent refs, never stored back on skills.
 */
function buildSkillTalentIndexUncached<T extends TalentSkillRefSource>(talents: T[]): Map<string, T[]> {
  const index = new Map<string, T[]>();
  for (const talent of talents) {
    const baseIds = new Set(collectTalentSkillRefs(talent).map((ref) => parseSkillRef(ref).baseId));
    for (const baseId of baseIds) {
      const list = index.get(baseId) ?? [];
      list.push(talent);
      index.set(baseId, list);
    }
  }
  return index;
}

// Memoised index for the default (catalog-wide) talent list, since talentDefinitions
// is a static import and callers (e.g. SkillsTab's per-row lookups) repeatedly query it
// with no arguments. Built lazily on first use, not at module load.
let defaultIndexCache: Map<string, TalentDefinition[]> | null = null;

export function buildSkillTalentIndex(
  talents?: TalentDefinition[],
): Map<string, TalentDefinition[]> {
  if (talents === undefined) {
    if (!defaultIndexCache) {
      defaultIndexCache = buildSkillTalentIndexUncached(talentDefinitions);
    }
    return defaultIndexCache;
  }
  return buildSkillTalentIndexUncached(talents);
}

/** Talents affecting a given skill (base or specialisation id). */
export function talentsAffectingSkill(
  skillId: string,
  talents?: TalentDefinition[],
): TalentDefinition[] {
  return buildSkillTalentIndex(talents).get(parseSkillRef(skillId).baseId) ?? [];
}

/**
 * Talents from an arbitrary list (e.g. a specific character's own talents) affecting
 * a given skill. Unlike talentsAffectingSkill, this is never memoised — callers pass
 * a caller-owned list, not the static catalog.
 */
export function talentsAffectingSkillAmong<T extends TalentSkillRefSource>(
  skillId: string,
  talents: T[],
): T[] {
  return buildSkillTalentIndexUncached(talents).get(parseSkillRef(skillId).baseId) ?? [];
}
