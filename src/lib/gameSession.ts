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
  ResolvedCharacterSpell,
} from "../data/characters/resolved";
import { calculateMaxCorruption } from "../data/characters/resolved";
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
  careerAdvancementByName: Record<string, { skills: string[]; talents: string[]; characteristics: Array<{ key: string; availableFromRank: number }> }>;
  resolvedSkillOptions: Array<{ id: string; skillId: string; specialisationId?: string; name: string }>;
};

export interface GameSession {
  character: ResolvedCharacterRecord;
  ruleset: Ruleset;
  rulesIndex: RulesIndex;
  progress: CharacterProgressData | null;
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
        characteristics: career.characteristicAdvances.map((entry) => ({
          key: entry.characteristic,
          availableFromRank: entry.availableFromRank,
        })),
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
    characteristics: [],
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

export type CoinPrice = {
  g: number;
  s: number;
  b: number;
};

export function getItemPriceParts(
  item: Pick<ResolvedCharacterEquipment, "value" | "currency" | "priceLabel">,
): CoinPrice {
  if (item.priceLabel) {
    const normalizedLabel = item.priceLabel.trim().toUpperCase();
    const goldMatch = normalizedLabel.match(/^(\d+)\s*(?:GC|G)$/);
    const silverMatch = normalizedLabel.match(/^(\d+)\s*(?:\/-|S)$/);
    const brassMatch = normalizedLabel.match(/^(\d+)\s*(?:D|B)$/);
    const slashMatch = normalizedLabel.match(/^(\d+)\s*\/\s*(\d+)$/);

    if (goldMatch) {
      return { g: Number(goldMatch[1]), s: 0, b: 0 };
    }

    if (silverMatch) {
      return { g: 0, s: Number(silverMatch[1]), b: 0 };
    }

    if (brassMatch) {
      return { g: 0, s: 0, b: Number(brassMatch[1]) };
    }

    if (slashMatch) {
      return { g: 0, s: Number(slashMatch[1]), b: Number(slashMatch[2]) };
    }

    return {
      g: 0,
      s: 0,
      b: 0,
    };
  }

  if (item.currency === "gc") {
    return { g: item.value, s: 0, b: 0 };
  }

  if (item.currency === "s") {
    return { g: 0, s: item.value, b: 0 };
  }

  if (item.currency === "d" || item.currency === "b") {
    return { g: 0, s: 0, b: item.value };
  }

  return { g: 0, s: 0, b: item.value };
}

export function getItemPriceInBrass(
  item: Pick<ResolvedCharacterEquipment, "value" | "currency" | "priceLabel">,
) {
  const price = getItemPriceParts(item);
  return price.g * 240 + price.s * 12 + price.b;
}

export function formatItemValue(
  item: Pick<ResolvedCharacterEquipment, "value" | "currency" | "priceLabel">,
) {
  const price = getItemPriceParts(item);
  const parts = [
    price.g > 0 ? `${price.g}gc` : null,
    price.s > 0 ? `${price.s}ss` : null,
    price.b > 0 ? `${price.b}bp` : null,
  ].filter(Boolean);

  if (parts.length > 0) {
    return parts.join(" ");
  }

  if (item.priceLabel) {
    return item.priceLabel;
  }

  return item.value ? `${item.value}${item.currency === "b" || item.currency === "d" ? "bp" : item.currency}` : "-";
}

export function formatCharacterCoins(coins: { gc: number; s: number; d: number }) {
  const parts = [
    coins.gc > 0 ? `${coins.gc}gc` : null,
    coins.s > 0 ? `${coins.s}ss` : null,
    coins.d > 0 ? `${coins.d}bp` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : "0bp";
}

const getConsumableBaseName = (name: string) => name.replace(/\s*\(\d+\)\s*$/, "");

const formatConsumableName = (name: string, count: number) =>
  `${getConsumableBaseName(name)} (${count})`;

function applyCharacterProgress(
  character: ResolvedCharacterRecord,
  ruleset: Ruleset,
  progress: CharacterProgressData | null,
): ResolvedCharacterRecord {
  if (!progress) {
    return character;
  }

  const progressSkills = progress.skills ?? {};
  const progressEquipment = progress.equipment ?? {};
  const talentIds = progress.talentIds ?? character.talents.map((talent) => talent.id);
  const talents = talentIds
    .map((talentId): ResolvedCharacterRecord["talents"][number] | null => {
      const definition = ruleset.talents.find((talent) => talent.id === talentId);
      if (!definition) {
        return null;
      }

      return {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        max: definition.max,
        tests: definition.tests,
        effects: definition.effects,
      };
    })
    .filter((talent): talent is ResolvedCharacterRecord["talents"][number] => Boolean(talent));
  const spellIds = progress.spellIds ?? character.spells.map((spell) => spell.id);
  const spells = spellIds
    .map((spellId): ResolvedCharacterSpell | null => {
      const definition = ruleset.spells.find((spell) => spell.id === spellId);
      if (!definition) {
        return null;
      }

      return {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        category: definition.category,
        school: definition.school,
        cn: definition.cn,
        range: definition.range,
        target: definition.target,
        duration: definition.duration,
        damage: definition.damage,
      };
    })
    .filter((spell): spell is NonNullable<typeof spell> => Boolean(spell));

  const resolvedRank =
    character.careerRecord.ranks.find((rank) => rank.rank === progress.careerCurrentRank) ??
    character.careerRecord.ranks.find((rank) => rank.rank === character.careerRecord.level) ??
    null;
  const baseCharacteristicAdvances = character.characteristicAdvances ?? {};
  const currentCharacteristicAdvances = progress.characteristicAdvances ?? baseCharacteristicAdvances;
  const attributes = Object.fromEntries(
    Object.entries(character.attributes).map(([key, value]) => {
      const baseAdvances = baseCharacteristicAdvances[key] ?? 0;
      const currentAdvances = currentCharacteristicAdvances[key] ?? baseAdvances;
      return [key, value + (currentAdvances - baseAdvances)];
    }),
  );
  const addedEquipment = (progress.addedEquipment ?? [])
    .map((item): ResolvedCharacterEquipment | null => {
      const definition = ruleset.items.find((entry) => entry.id === item.itemId);
      if (!definition) {
        return null;
      }

      const armour = definition.armourId
        ? ruleset.armours.find((entry) => entry.id === definition.armourId)
        : undefined;

      return {
        id: item.id,
        itemId: item.itemId,
        weaponId: definition.weaponId,
        armourId: definition.armourId,
        armourLocations: definition.armourLocations ?? armour?.locations,
        armourCategory: armour?.category,
        armourAps: armour?.aps,
        armourPenalties: armour?.penalties,
        armourQualities: armour?.qualities,
        armourFlaws: armour?.flaws,
        armourNotes: armour?.notes,
        name: definition.name,
        type: definition.type,
        description: definition.description,
        encumbrance: definition.encumbrance,
        carries: definition.carries,
        value: definition.value,
        currency: definition.currency,
        priceLabel: definition.priceLabel ?? armour?.price,
        availability: definition.availability ?? armour?.availability,
        equipped: item.equipped,
        containerId: item.containerId ?? null,
      };
    })
    .filter((item): item is ResolvedCharacterEquipment => Boolean(item));

  const maxCorruption = calculateMaxCorruption(attributes);
  const characterName = progress.characterName?.trim() || character.name;

  return {
    ...character,
    name: characterName,
    wounds: {
      ...character.wounds,
      current: progress.woundsCurrent ?? character.wounds.current,
    },
    corruption: progress.corruptionCurrent ?? character.corruption,
    maxCorruption,
    coins: progress.coins ?? character.coins,
    level: resolvedRank?.rank ?? character.level,
    status: resolvedRank?.status ?? character.status,
    attributes,
    characteristicAdvances: currentCharacteristicAdvances,
    careerRecord: {
      ...character.careerRecord,
      level: resolvedRank?.rank ?? character.careerRecord.level,
      status: resolvedRank?.status ?? character.careerRecord.status,
    },
    skills: character.skills.map((skill) => ({
      ...skill,
      advances: progressSkills[getCharacterSkillKey(skill)] ?? skill.advances,
    })),
    talents,
    spells,
    equipment: [...character.equipment, ...addedEquipment]
      .filter((item) => !progress.removedEquipmentIds?.includes(item.id))
      .map((item) => ({
        ...item,
        name:
          item.type === "Consumable" && progress.consumableCounts?.[item.id]
            ? formatConsumableName(item.name, progress.consumableCounts[item.id])
            : item.name,
        equipped: progressEquipment[item.id] ?? item.equipped,
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
    progress,
    resourceCaps: {
      corruption: character.maxCorruption,
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
