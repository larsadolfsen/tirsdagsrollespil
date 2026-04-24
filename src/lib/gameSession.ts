import type { CharacterProgressData, Ruleset } from "../types";
import {
  loadCharacterProgress,
  loadDefaultCharacter,
  loadResolvedCharacter,
  loadRuleset,
  saveCharacterProgress,
} from "../data/repository";
import type {
  ResolvedCharacterCareer,
  ResolvedCharacterEquipment,
  ResolvedCharacterRecord,
  ResolvedCharacterSkill,
} from "../data/characters/resolved";
import {
  buildResolvedSkillOptions,
  getSkillDisplayName,
} from "../data/rules/wfrp4e";

type WeaponStats = {
  reach: string;
  damage: string;
  properties: string[];
};

export type RulesIndex = {
  skillDescriptionByName: Record<string, string>;
  actionDescriptionByName: Record<string, string>;
  propertyDescriptionByName: Record<string, string>;
  weaponStatsByName: Record<string, WeaponStats>;
  careerAdvancementByName: Record<string, { skills: string[]; talents: string[] }>;
  resolvedSkillOptions: Array<{ id: string; skillId: string; specialisationId?: string; name: string }>;
};

export interface GameSession {
  character: ResolvedCharacterRecord;
  ruleset: Ruleset;
  rulesIndex: RulesIndex;
  resourceCaps: {
    corruption: number;
    fate: number;
    resilience: number;
    resolve: number;
  };
  initialCorruptionCurrent: number;
  initialFateCurrent: number;
  initialFortuneCurrent: number;
  initialResilienceCurrent: number;
  initialResolveCurrent: number;
  initialXpCurrent: number;
}

function buildRulesIndex(ruleset: Ruleset): RulesIndex {
  const skillDescriptionByName = Object.fromEntries(
    buildResolvedSkillOptions(ruleset.skills, ruleset.skillSpecialisations).map((option) => {
      const skill = ruleset.skills.find((entry) => entry.id === option.skillId)!;
      return [option.name, skill.description];
    }),
  );

  const actionDescriptionByName = Object.fromEntries(
    ruleset.actions.map((action) => [action.name, action.description]),
  );

  const propertyDescriptionByName = Object.fromEntries(
    ruleset.properties.flatMap((property) => {
      const entries: Array<[string, string]> = [[property.name, property.description]];
      if (property.name === "Two-handed") {
        entries.push(["Two-Handed", property.description]);
      }
      return entries;
    }),
  );

  const weaponStatsByName = Object.fromEntries(
    ruleset.weapons.map((weapon) => [
      weapon.name,
      {
        reach: weapon.groupType === "melee" ? weapon.reach : weapon.range,
        damage: weapon.damage,
        properties: [...weapon.qualities, ...weapon.flaws]
          .map((propertyId) => ruleset.properties.find((property) => property.id === propertyId)?.name)
          .filter((name): name is string => Boolean(name)),
      },
    ]),
  );

  const careerAdvancementByName = Object.fromEntries(
    ruleset.careers.map((career) => [
      `${career.name} / ${career.tier}`,
      {
        skills: career.skillIds
          .map((skillId) => {
            const skill = ruleset.skills.find((entry) => entry.id === skillId);
            return skill ? getSkillDisplayName(skill) : null;
          })
          .filter((name): name is string => Boolean(name)),
        talents: career.talentIds
          .map((talentId) => ruleset.talents.find((talent) => talent.id === talentId)?.name)
          .filter((name): name is string => Boolean(name)),
      },
    ]),
  );

  const resolvedSkillOptions = buildResolvedSkillOptions(
    ruleset.skills,
    ruleset.skillSpecialisations,
  );

  return {
    skillDescriptionByName,
    actionDescriptionByName,
    propertyDescriptionByName,
    weaponStatsByName,
    careerAdvancementByName,
    resolvedSkillOptions,
  };
}

export function getCareerAdvancementData(
  career: Pick<ResolvedCharacterCareer, "name" | "tier">,
  rulesIndex: RulesIndex,
) {
  return rulesIndex.careerAdvancementByName[`${career.name} / ${career.tier}`] ?? {
    skills: [],
    talents: [],
  };
}

export function getWeaponStats(
  equipment: Pick<ResolvedCharacterEquipment, "name">,
  rulesIndex: RulesIndex,
): WeaponStats {
  return rulesIndex.weaponStatsByName[equipment.name] ?? {
    reach: "Average",
    damage: "+SB",
    properties: [],
  };
}

export function getCharacterSkillKey(skill: Pick<ResolvedCharacterSkill, "skillId" | "specialisationId">) {
  return skill.specialisationId ? `${skill.skillId}:${skill.specialisationId}` : skill.skillId;
}

export function formatItemValue(item: Pick<ResolvedCharacterEquipment, "value" | "currency">) {
  if (item.currency === "gc") {
    return `${item.value}GC`;
  }

  if (item.currency === "s") {
    return `${item.value}/-`;
  }

  if (item.currency === "d") {
    return `${item.value}d`;
  }

  return `${item.value}${item.currency}`;
}

export function formatCharacterCoins(coins: { gc: number; s: number; d: number }) {
  return `${coins.gc}GC ${coins.s}/- ${coins.d}d`;
}

function applyCharacterProgress(
  character: ResolvedCharacterRecord,
  ruleset: Ruleset,
  progress: CharacterProgressData | null,
): ResolvedCharacterRecord {
  if (!progress) {
    return character;
  }

  const talentIds = progress.talentIds ?? character.talents.map((talent) => talent.id);
  const talents = talentIds
    .map((talentId) => {
      const definition = ruleset.talents.find((talent) => talent.id === talentId);
      if (!definition) {
        return null;
      }

      return {
        id: definition.id,
        name: definition.name,
        description: definition.description,
      };
    })
    .filter((talent): talent is ResolvedCharacterRecord["talents"][number] => Boolean(talent));

  const resolvedRank =
    character.careerRecord.ranks.find((rank) => rank.rank === progress.careerCurrentRank) ??
    character.careerRecord.ranks.find((rank) => rank.rank === character.careerRecord.level) ??
    null;

  return {
    ...character,
    wounds: {
      ...character.wounds,
      current: progress.woundsCurrent,
    },
    corruption: progress.corruptionCurrent,
    level: resolvedRank?.rank ?? character.level,
    status: resolvedRank?.status ?? character.status,
    careerRecord: {
      ...character.careerRecord,
      level: resolvedRank?.rank ?? character.careerRecord.level,
      status: resolvedRank?.status ?? character.careerRecord.status,
    },
    skills: character.skills.map((skill) => ({
      ...skill,
      advances: progress.skills[getCharacterSkillKey(skill)] ?? skill.advances,
    })),
    talents,
    equipment: character.equipment
      .filter((item) => !progress.removedEquipmentIds?.includes(item.id))
      .map((item) => ({
        ...item,
        equipped: progress.equipment[item.id] ?? item.equipped,
        containerId: progress.equipmentContainers?.[item.id] ?? item.containerId ?? null,
      })),
  };
}

export function saveGameSessionProgress(
  characterId: string,
  progress: CharacterProgressData,
) {
  saveCharacterProgress(characterId, progress);
}

export function loadGameSession(characterId?: string): GameSession {
  const baseCharacter = characterId ? loadResolvedCharacter(characterId) : loadDefaultCharacter();
  const ruleset = loadRuleset(baseCharacter.rulesetId);
  const progress = loadCharacterProgress(baseCharacter.id);
  const character = applyCharacterProgress(baseCharacter, ruleset, progress);
  const rulesIndex = buildRulesIndex(ruleset);

  return {
    character,
    ruleset,
    rulesIndex,
    resourceCaps: {
      corruption: baseCharacter.maxCorruption,
      fate: baseCharacter.fate,
      resilience: baseCharacter.resilience,
      resolve: baseCharacter.resolve,
    },
    initialCorruptionCurrent: progress?.corruptionCurrent ?? character.corruption,
    initialFateCurrent: progress?.fateCurrent ?? baseCharacter.fate,
    initialFortuneCurrent: Math.min(
      progress?.fortuneCurrent ?? baseCharacter.fortune,
      progress?.fateCurrent ?? baseCharacter.fate,
    ),
    initialResilienceCurrent: progress?.resilienceCurrent ?? baseCharacter.resilience,
    initialResolveCurrent: Math.min(
      progress?.resolveCurrent ?? baseCharacter.resolve,
      progress?.resilienceCurrent ?? baseCharacter.resilience,
    ),
    initialXpCurrent:
      progress && progress.xpBaselineTotal === character.xpTotal
        ? progress.xpCurrent
        : character.xpTotal,
  };
}
