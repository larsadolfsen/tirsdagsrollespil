import type { ResolvedCharacterTalent } from "../../data/characters/resolved";
import { getSkillDisplayName, skillDefinitions, skillSpecialisationDefinitions } from "../../data/rules/wfrp4e";
import { parseSkillRef } from "../../lib/skillRefs";
import type { SkillRef } from "../../types/rules";

export type TalentSkillLink = { id: string; displayName: string };

/**
 * A talent's skill refs (relatedSkillIds + effect-level skillIds), resolved to display
 * names for cross-linking. Refs to the same base skill are deduped: if a specific
 * specialisation ref is present, the redundant base-skill ref is dropped.
 */
export function getTalentSkillLinks(talent: {
  relatedSkillIds?: SkillRef[];
  effects?: ResolvedCharacterTalent["effects"];
}): TalentSkillLink[] {
  const refs = [
    ...(talent.relatedSkillIds ?? []),
    ...(talent.effects ?? []).flatMap((effect) =>
      "skillIds" in effect ? (effect.skillIds ?? []) : [],
    ),
  ];

  const refsByBaseId = new Map<string, Set<string>>();
  for (const ref of refs) {
    const { baseId } = parseSkillRef(ref);
    const existing = refsByBaseId.get(baseId) ?? new Set<string>();
    existing.add(ref);
    refsByBaseId.set(baseId, existing);
  }

  const resolvedRefs: string[] = [];
  for (const [baseId, baseRefs] of refsByBaseId) {
    const specificRefs = [...baseRefs].filter((ref) => ref !== baseId);
    resolvedRefs.push(...(specificRefs.length > 0 ? specificRefs : [baseId]));
  }

  return resolvedRefs
    .map((ref): TalentSkillLink | null => {
      const { baseId, specialisationId } = parseSkillRef(ref);
      const skill = skillDefinitions.find((entry) => entry.id === baseId);
      if (!skill) {
        return null;
      }

      const specialisation = specialisationId
        ? skillSpecialisationDefinitions.find((entry) => entry.id === specialisationId)
        : null;

      return { id: baseId, displayName: getSkillDisplayName(skill, specialisation) };
    })
    .filter((link): link is TalentSkillLink => link !== null);
}

const characteristicKeyByTalentMaxName: Record<string, string> = {
  "Weapon Skill": "WS",
  "Ballistic Skill": "BS",
  Strength: "S",
  Toughness: "T",
  Initiative: "I",
  Agility: "Ag",
  Dexterity: "Dex",
  Intelligence: "Int",
  Willpower: "WP",
  Fellowship: "Fel",
};

export function getTalentMaxDisplay(max: string, attributes: Record<string, number>) {
  const numericMax = Number.parseInt(max, 10);

  if (Number.isFinite(numericMax) && `${numericMax}` === max.trim()) {
    return numericMax;
  }

  const bonusMatch = max.match(/^(.+?)\s+Bonus$/i);
  if (!bonusMatch) {
    return max;
  }

  const characteristicKey = characteristicKeyByTalentMaxName[bonusMatch[1]];
  if (!characteristicKey) {
    return max;
  }

  return Math.floor((attributes[characteristicKey] ?? 0) / 10);
}

export function getCharacterTalentRows(characterTalents: ResolvedCharacterTalent[]) {
  return Array.from<{ talent: ResolvedCharacterTalent; count: number }>(
    characterTalents
      .reduce<Map<string, { talent: ResolvedCharacterTalent; count: number }>>((rows, talent) => {
        const current = rows.get(talent.name);

        if (current) {
          current.count += 1;
          return rows;
        }

        rows.set(talent.name, { talent, count: 1 });
        return rows;
      }, new Map())
      .values(),
  ).sort((a, b) => a.talent.name.localeCompare(b.talent.name));
}
