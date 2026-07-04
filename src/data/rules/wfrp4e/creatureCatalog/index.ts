import {
  creatureTraitDefinitionsById,
  type CharacteristicKey,
  type CreatureTraitDefinition,
  type CreatureTraitId,
} from "../creatureTraits";

export type CreatureSize =
  | "tiny"
  | "little"
  | "small"
  | "average"
  | "large"
  | "enormous"
  | "monstrous";

export type CreatureCategory =
  | "beast"
  | "daemon"
  | "greenskin"
  | "human"
  | "monster"
  | "skaven"
  | "spirit"
  | "undead";

export type CreatureTraitValue = string | number | boolean | string[];

export interface CreatureTraitInstance {
  id: CreatureTraitId;
  rating?: number;
  value?: CreatureTraitValue;
  label?: string;
  notes?: string;
}

export interface CreatureCharacteristics extends Record<CharacteristicKey, number> {}

export interface CreatureStatBlock {
  movement: number;
  characteristics: CreatureCharacteristics;
  wounds: number;
  size?: CreatureSize;
}

export interface CreatureTemplate {
  id: string;
  name: string;
  category: CreatureCategory;
  group?: string;
  statBlock: CreatureStatBlock;
  traits: CreatureTraitInstance[];
  trappings: string[];
  optionalTraits?: CreatureTraitInstance[];
  defaultCount?: number;
}

export interface ResolvedCreatureTraitInstance extends CreatureTraitInstance {
  definition: CreatureTraitDefinition;
}

export interface ResolvedCreatureTemplate extends Omit<CreatureTemplate, "traits" | "optionalTraits"> {
  traits: ResolvedCreatureTraitInstance[];
  optionalTraits: ResolvedCreatureTraitInstance[];
}

export function resolveCreatureTraitInstance(trait: CreatureTraitInstance): ResolvedCreatureTraitInstance {
  const definition = creatureTraitDefinitionsById[trait.id];

  if (!definition) {
    throw new Error(`Unknown creature trait: ${trait.id}`);
  }

  return {
    ...trait,
    definition,
  };
}

export function resolveCreatureTemplate(template: CreatureTemplate): ResolvedCreatureTemplate {
  return {
    ...template,
    traits: template.traits.map(resolveCreatureTraitInstance),
    optionalTraits: template.optionalTraits?.map(resolveCreatureTraitInstance) ?? [],
  };
}

export const creatureTemplates: CreatureTemplate[] = [
  {
    id: "skaven-clanrat",
    name: "Clanrat",
    category: "skaven",
    group: "Skaven",
    statBlock: {
      movement: 5,
      wounds: 11,
      size: "average",
      characteristics: {
        WS: 30,
        BS: 30,
        S: 30,
        T: 30,
        I: 40,
        Ag: 35,
        Dex: 30,
        Int: 30,
        WP: 20,
        Fel: 20,
      },
    },
    traits: [
      { id: "trait_armour", rating: 2 },
      { id: "trait_infected" },
      { id: "trait_night_vision" },
      { id: "trait_weapon", rating: 7 },
    ],
    trappings: ["Hand Weapon", "Leather Jack", "Shield"],
    optionalTraits: [
      { id: "trait_disease", value: "Ratte Fever" },
      { id: "trait_mutation" },
      { id: "trait_skittish" },
      { id: "trait_stealthy" },
      { id: "trait_tracker" },
    ],
    defaultCount: 4,
  },
  {
    id: "skaven-stormvermin",
    name: "Stormvermin",
    category: "skaven",
    group: "Skaven",
    statBlock: {
      movement: 5,
      wounds: 11,
      size: "average",
      characteristics: {
        WS: 45,
        BS: 35,
        S: 35,
        T: 35,
        I: 55,
        Ag: 50,
        Dex: 30,
        Int: 30,
        WP: 25,
        Fel: 20,
      },
    },
    traits: [
      { id: "trait_armour", rating: 4 },
      { id: "trait_infected" },
      { id: "trait_night_vision" },
      { id: "trait_weapon", rating: 8 },
    ],
    trappings: ["Halberd", "Mail Coat", "Leather Jack"],
    optionalTraits: [
      { id: "trait_disease", value: "Ratte Fever" },
      { id: "trait_mutation" },
      { id: "trait_tracker" },
    ],
    defaultCount: 2,
  },
  {
    id: "skaven-rat-ogre",
    name: "Rat Ogre",
    category: "skaven",
    group: "Skaven",
    statBlock: {
      movement: 5,
      wounds: 30,
      size: "large",
      characteristics: {
        WS: 35,
        BS: 10,
        S: 55,
        T: 45,
        I: 35,
        Ag: 45,
        Dex: 25,
        Int: 10,
        WP: 25,
        Fel: 15,
      },
    },
    traits: [
      { id: "trait_armour", rating: 1 },
      { id: "trait_infected" },
      { id: "trait_night_vision" },
      { id: "trait_size", value: "Large" },
      { id: "trait_stupid" },
      { id: "trait_weapon", rating: 9 },
    ],
    trappings: [],
    optionalTraits: [
      { id: "trait_corrupted", value: "Minor" },
      { id: "trait_dark_vision" },
      { id: "trait_disease", value: "Ratte Fever" },
      { id: "trait_infestation" },
      { id: "trait_mutation" },
      { id: "trait_tail_attack", rating: 8 },
      { id: "trait_tracker" },
      { id: "trait_trained", value: ["Broken", "Guard", "Mount", "War"] },
    ],
    defaultCount: 1,
  },
];

export type CreatureTemplateId = typeof creatureTemplates[number]["id"];

export const creatureTemplatesById: Record<CreatureTemplateId, CreatureTemplate> = Object.fromEntries(
  creatureTemplates.map((template) => [template.id, template]),
) as Record<CreatureTemplateId, CreatureTemplate>;

export const resolvedCreatureTemplates = creatureTemplates.map(resolveCreatureTemplate);

export const resolvedCreatureTemplatesById: Record<CreatureTemplateId, ResolvedCreatureTemplate> = Object.fromEntries(
  resolvedCreatureTemplates.map((template) => [template.id, template]),
) as Record<CreatureTemplateId, ResolvedCreatureTemplate>;
