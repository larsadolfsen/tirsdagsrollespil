import type {
  CareerDefinition,
  CharacterRecord,
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
  name: string;
  type: string;
  description: string;
  encumbrance: number;
  carries?: number;
  value: number;
  currency: string;
  equipped: boolean;
  containerId?: string | null;
}

export interface ResolvedCharacterTalent {
  id: string;
  name: string;
  description: string;
}

export interface ResolvedCharacterSpell {
  id: string;
  name: string;
  description: string;
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

export function resolveCharacterRecord(
  character: CharacterRecord,
  ruleset: Ruleset,
): ResolvedCharacterRecord {
  const raceDefinition = findRaceDefinition(character.race);
  const skillsById = byId<SkillDefinition>(ruleset.skills);
  const skillSpecialisationsById = byId<SkillSpecialisationDefinition>(ruleset.skillSpecialisations);
  const itemsById = byId<ItemDefinition>(ruleset.items);
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
    race: character.race,
    wounds: character.wounds,
    fate: raceDefinition?.fate ?? character.fate,
    fortune: raceDefinition?.fate ?? character.fortune,
    resilience: raceDefinition?.resilience ?? character.resilience,
    resolve: raceDefinition?.resilience ?? character.resolve,
    move: raceDefinition?.movement ?? character.move,
    corruption: character.corruption,
    maxCorruption: character.maxCorruption,
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

      return {
        id: item.id,
        itemId: item.itemId,
        weaponId: definition.weaponId,
        name: definition.name,
        type: definition.type,
        description: definition.description,
        encumbrance: definition.encumbrance,
        carries: definition.carries,
        value: definition.value,
        currency: definition.currency,
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
        cn: definition.cn,
        range: definition.range,
        target: definition.target,
        duration: definition.duration,
        damage: definition.damage,
      };
    }),
  };
}
