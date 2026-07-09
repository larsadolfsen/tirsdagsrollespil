import type { SkillRef } from "../types/rules";
import { skillDefinitions, skillSpecialisationDefinitions } from "../data/rules/wfrp4e";

// Prefixed catalog ids (Plan 00): base skills like "skill_endurance", grouped
// specialisations authored as "<baseId>_<spec>" e.g. "skill_stealth_urban".
const baseIds = new Set(skillDefinitions.map((skill) => skill.id));
const specIds = new Set(skillSpecialisationDefinitions.map((spec) => spec.id));
// Longest base first so a spec ref resolves to its most specific base.
const baseIdsByLengthDesc = [...baseIds].sort((a, b) => b.length - a.length);

/** Split a ref into its base skill id and (if a specialisation) the full spec id. */
export function parseSkillRef(ref: SkillRef): { baseId: string; specialisationId?: string } {
  if (baseIds.has(ref)) {
    return { baseId: ref };
  }
  const base = baseIdsByLengthDesc.find((id) => ref.startsWith(`${id}_`));
  return base ? { baseId: base, specialisationId: ref } : { baseId: ref };
}

/** Does this ref name a real skill or specialisation? (For build-time validation.) */
export function isResolvableSkillRef(ref: SkillRef): boolean {
  return baseIds.has(ref) || specIds.has(ref) || baseIdsByLengthDesc.some((id) => ref.startsWith(`${id}_`));
}

/**
 * A base-id ref matches any specialisation of that skill; a specialisation ref
 * matches only itself.
 */
export function skillRefMatches(
  ref: SkillRef,
  target: { skillId: string; specialisationId?: string },
): boolean {
  const { baseId, specialisationId } = parseSkillRef(ref);
  if (baseId !== target.skillId) {
    return false;
  }
  return specialisationId ? specialisationId === target.specialisationId : true;
}
