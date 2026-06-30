import type { Ruleset } from "../../../types";
import { actionDefinitions } from "./actions";
import { additionalFireSpellDefinitions } from "./additionalFireSpells";
import { armourDefinitions } from "./armours";
import { armourQualities, armourFlaws, armourLocations, armourCategories } from "./armourProperties";
import { careerDefinitions } from "./careers";
import { itemDefinitions } from "./items";
import { meleeWeaponItemDefinitions } from "./meleeWeaponItems";
import { propertyDefinitions } from "./properties";
import { rangedWeaponItemDefinitions } from "./rangedWeaponItems";
import { raceDefinitions } from "./races";
import {
  buildResolvedSkillOptions,
  getSkillDisplayName,
  skillCharacteristicById,
  skillDefinitions,
  skillSpecialisationDefinitions,
} from "./skills";
import { sigmarPrayerAndMiracleDefinitions } from "./sigmarPrayers";
import { spellDefinitions } from "./spells";
import { talentDefinitions } from "./talents";
import {
  buildResolvedWeaponOptions,
  getRequiredSkillDisplayName,
  getWeaponDisplayName,
  getWeaponGroupLabel,
  meleeWeaponGroups,
  rangedWeaponGroups,
  weaponDefinitions,
} from "./weapons";

export const allItemDefinitions = [
  ...itemDefinitions,
  ...meleeWeaponItemDefinitions.filter((item) => item.weaponId !== "sword"),
  ...rangedWeaponItemDefinitions,
];

export const allSpellDefinitions = [
  ...spellDefinitions,
  ...additionalFireSpellDefinitions,
  ...sigmarPrayerAndMiracleDefinitions,
];

export const wfrp4eRuleset: Ruleset = {
  id: "wfrp4e",
  name: "Warhammer Fantasy Roleplay 4th Edition",
  races: raceDefinitions,
  skills: skillDefinitions,
  skillSpecialisations: skillSpecialisationDefinitions,
  actions: actionDefinitions,
  properties: propertyDefinitions,
  talents: talentDefinitions,
  spells: allSpellDefinitions,
  items: allItemDefinitions,
  weapons: weaponDefinitions,
  armours: armourDefinitions,
  careers: careerDefinitions,
};

// Export armour-specific utilities
export { armourQualities, armourFlaws, armourLocations, armourCategories } from "./armourProperties";

export const skillDescriptionByName: Record<string, string> = Object.fromEntries(
  buildResolvedSkillOptions(skillDefinitions, skillSpecialisationDefinitions).map((option) => {
    const skill = skillDefinitions.find((entry) => entry.id === option.skillId)!;
    return [option.name, skill.description];
  }),
);

export const actionDescriptionByName: Record<string, string> = Object.fromEntries(
  actionDefinitions.map((action) => [action.name, action.description]),
);

export const propertyDescriptionByName: Record<string, string> = Object.fromEntries(
  propertyDefinitions.flatMap((property) => {
    const entries: Array<[string, string]> = [[property.name, property.description]];
    if (property.name === "Two-handed") {
      entries.push(["Two-Handed", property.description]);
    }
    return entries;
  }),
);

export const weaponStatsByName = Object.fromEntries(
  weaponDefinitions.map((weapon) => [
    weapon.name,
    {
      reach: weapon.groupType === "melee" ? weapon.reach : weapon.range,
      damage: weapon.damage,
      properties: [...weapon.qualities, ...weapon.flaws]
        .map((propertyId) => propertyDefinitions.find((property) => property.id === propertyId)?.name)
        .filter((propertyName): propertyName is string => Boolean(propertyName)),
    },
  ]),
);

export const careerAdvancementByName = Object.fromEntries(
  careerDefinitions.map((career) => [
    `${career.name} / ${career.tier}`,
    {
      skills: career.skillIds
        .map((skillId) => {
          const skill = skillDefinitions.find((entry) => entry.id === skillId);
          if (!skill) {
            return null;
          }

          return getSkillDisplayName(skill);
        })
        .filter((name): name is string => Boolean(name)),
      talents: career.talentIds
        .map((talentId) => talentDefinitions.find((talent) => talent.id === talentId)?.name)
        .filter((name): name is string => Boolean(name)),
    },
  ]),
);

export { buildResolvedSkillOptions, getSkillDisplayName, skillCharacteristicById, skillDefinitions, skillSpecialisationDefinitions };
export {
  buildResolvedWeaponOptions,
  getRequiredSkillDisplayName,
  getWeaponDisplayName,
  getWeaponGroupLabel,
  meleeWeaponGroups,
  rangedWeaponGroups,
};
export {
  creatureTraitDefinitions,
  creatureTraitDefinitionsById,
  type CharacteristicKey,
  type CreatureTraitDefinition,
  type CreatureTraitId,
  type CreatureTraitModifier,
  type CreatureTraitModifierType,
} from "./creatureTraits";
export {
  creatureTemplates,
  creatureTemplatesById,
  resolvedCreatureTemplates,
  resolvedCreatureTemplatesById,
  resolveCreatureTemplate,
  resolveCreatureTraitInstance,
  type CreatureCategory,
  type CreatureCharacteristics,
  type CreatureSize,
  type CreatureStatBlock,
  type CreatureTemplate,
  type CreatureTemplateId,
  type CreatureTraitInstance,
  type ResolvedCreatureTemplate,
  type ResolvedCreatureTraitInstance,
} from "./creatures";
