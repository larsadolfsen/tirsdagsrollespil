import type {
  CareerDefinition,
  CharacterRecord,
  ArmourDefinition,
  ArmourLocation,
  ArmourPenalty,
  ArmourQualityOrFlawInstance,
  CharacterSkillRecord,
  ItemDefinition,
  Ruleset,
  SkillDefinition,
  SkillSpecialisationDefinition,
  SpellDefinition,
  TalentDefinition,
} from "../../types";
import {
  getSkillDisplayName,
  skillCharacteristicById,
} from "../rules/wfrp4e";
import { findRaceDefinition } from "../rules/wfrp4e/races";

export interface ResolvedCharacterSkill extends CharacterSkillRecord {
  baseName: string;
  displayName: string;
  characteristic: string;
}

export interface ResolvedCharacterEquipment {
  id: string;
  itemId: string;
  weaponId?: string;
  armourId?: string;
  armourLocations?: ArmourLocation[];
  armourCategory?: ArmourDefinition["category"];
  armourAps?: number;
  armourPenalties?: ArmourPenalty[];
  armourQualities?: ArmourQualityOrFlawInstance[];
  armourFlaws?: ArmourQualityOrFlawInstance[];
  armourNotes?: string[];
  name: string;
  type: string;
  description: string;
  encumbrance: number;
  carries?: number;
  value: number;
  currency: string;
  priceLabel?: string;
  availability?: ItemDefinition["availability"];
  equipped: boolean;
  containerId?: string | null;
}

export interface ResolvedCharacterTalent {
  id: string;
  name: string;
  description: string;
  max: string;
  tests?: string;
  effects?: TalentDefinition["effects"];
}

export interface ResolvedCharacterSpell {
  id: string;
  name: string;
  description: string;
  category: SpellDefinition["category"];
  school?: string;
  cn: number;
  range: string;
  target: string;
  duration: string;
  damage: string;
}

export interface ResolvedCharacterCareer {
  id: string;
  name: string;
  tier: string;
  level: number;
  status: string;
  ranks: CareerDefinition["ranks"];
  skillIds: string[];
  talentIds: string[];
  characteristicAdvances: CareerDefinition["characteristicAdvances"];
}

export interface ResolvedCharacterRecord {
  id: string;
  rulesetId: string;
  name: string;
  aka: string[];
  race: string;
  wounds: CharacterRecord["wounds"];
  fate: number;
  fortune: number;
  resilience: number;
  resolve: number;
  move: number;
  corruption: number;
  maxCorruption: number;
  xpTotal: number;
  coins: CharacterRecord["coins"];
  attributes: Record<string, number>;
  characteristicAdvances: Record<string, number>;
  career: string;
  tier: string;
  level: number;
  status: string;
  careerRecord: ResolvedCharacterCareer;
  skills: ResolvedCharacterSkill[];
  equipment: ResolvedCharacterEquipment[];
  talents: ResolvedCharacterTalent[];
  spells: ResolvedCharacterSpell[];
}

const byId = <T extends { id: string }>(items: T[]) =>
  Object.fromEntries(items.map((item) => [item.id, item]));

export const getCharacteristicBonus = (value: number) => Math.floor(value / 10);

export const calculateMaxCorruption = (attributes: Record<string, number>) =>
  getCharacteristicBonus(attributes.WP ?? 0) + getCharacteristicBonus(attributes.T ?? 0);

export function resolveCharacterRecord(
  character: CharacterRecord,
  ruleset: Ruleset,
): ResolvedCharacterRecord {
  const raceDefinition = findRaceDefinition(character.race);
  const skillsById = byId<SkillDefinition>(ruleset.skills);
  const skillSpecialisationsById = byId<SkillSpecialisationDefinition>(ruleset.skillSpecialisations);
  const itemsById = byId<ItemDefinition>(ruleset.items);
  const armoursById = byId<ArmourDefinition>(ruleset.armours);
  const talentsById = byId<TalentDefinition>(ruleset.talents);
  const spellsById = byId<SpellDefinition>(ruleset.spells);
  const careersById = byId<CareerDefinition>(ruleset.careers);

  const career = careersById[character.career.careerId];
  if (!career) {
    throw new Error(`Unknown career "${character.career.careerId}" for character "${character.id}".`);
  }

  const currentRank = career.ranks.find((rank) => rank.rank === character.career.currentRank);
  if (!currentRank) {
    throw new Error(
      `Unknown career rank "${character.career.currentRank}" for career "${career.id}".`,
    );
  }

  return {
    id: character.id,
    rulesetId: character.rulesetId,
    name: character.name,
    aka: character.aka ?? [],
    race: character.race,
    wounds: character.wounds,
    fate: character.fate ?? raceDefinition?.fate,
    fortune: character.fortune ?? raceDefinition?.fate,
    resilience: character.resilience ?? raceDefinition?.resilience,
    resolve: character.resolve ?? raceDefinition?.resilience,
    move: character.move ?? raceDefinition?.movement,
    corruption: character.corruption,
    maxCorruption: calculateMaxCorruption(character.attributes),
    xpTotal: character.xpTotal,
    coins: character.coins,
    attributes: character.attributes,
    characteristicAdvances: character.characteristicAdvances ?? {},
    career: career.name,
    tier: career.tier,
    level: currentRank.rank,
    status: currentRank.status,
    careerRecord: {
      id: career.id,
      name: career.name,
      tier: career.tier,
      level: currentRank.rank,
      status: currentRank.status,
      ranks: career.ranks,
      skillIds: career.skillIds,
      talentIds: career.talentIds,
      characteristicAdvances: career.characteristicAdvances,
    },
    skills: character.skills.map((skill) => {
      const definition = skillsById[skill.skillId];
      if (!definition) {
        throw new Error(`Unknown skill "${skill.skillId}" for character "${character.id}".`);
      }

      const specialisation = skill.specialisationId
        ? skillSpecialisationsById[skill.specialisationId]
        : null;

      if (skill.specialisationId && !specialisation) {
        throw new Error(
          `Unknown skill specialisation "${skill.specialisationId}" for character "${character.id}".`,
        );
      }

      return {
        ...skill,
        baseName: definition.name,
        displayName: getSkillDisplayName(definition, specialisation),
        characteristic: skillCharacteristicById[definition.id],
      };
    }),
    equipment: character.equipment.map((item) => {
      const definition = itemsById[item.itemId];
      if (!definition) {
        throw new Error(`Unknown item "${item.itemId}" for character "${character.id}".`);
      }
      const armour = definition.armourId ? armoursById[definition.armourId] : undefined;

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
    }),
    talents: character.talents.map((talent) => {
      const definition = talentsById[talent.talentId];
      if (!definition) {
        throw new Error(`Unknown talent "${talent.talentId}" for character "${character.id}".`);
      }

      return {
        id: definition.id,
        name: definition.name,
        description: definition.description,
        max: definition.max,
        tests: definition.tests,
        effects: definition.effects,
      };
    }),
    spells: character.spells.map((spell) => {
      const definition = spellsById[spell.spellId];
      if (!definition) {
        throw new Error(`Unknown spell "${spell.spellId}" for character "${character.id}".`);
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
    }),
  };
}
