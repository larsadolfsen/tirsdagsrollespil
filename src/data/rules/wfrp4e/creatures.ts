import {
  creatureTraitDefinitionsById,
  type CharacteristicKey,
  type CreatureTraitDefinition,
  type CreatureTraitId,
} from "./creatureTraits";
import { threeFeathersNpcTemplates } from "./threeFeathersNpcs";

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
  optionalTraits?: CreatureTraitInstance[];
  skills?: string[];
  talents?: string[];
  tags?: string[];
  trappings?: string[];
  notes?: string[];
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

export const skavenCreatureTemplates: CreatureTemplate[] = [
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
      { id: "armour", rating: 2 },
      { id: "infected" },
      { id: "night-vision" },
      { id: "weapon", rating: 7 },
    ],
    optionalTraits: [
      { id: "disease", value: "Ratte Fever" },
      { id: "mutation" },
      { id: "skittish" },
      { id: "stealthy" },
      { id: "tracker" },
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
      { id: "armour", rating: 4 },
      { id: "infected" },
      { id: "night-vision" },
      { id: "weapon", rating: 8 },
    ],
    optionalTraits: [
      { id: "disease", value: "Ratte Fever" },
      { id: "mutation" },
      { id: "tracker" },
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
      { id: "armour", rating: 1 },
      { id: "infected" },
      { id: "night-vision" },
      { id: "size", value: "Large" },
      { id: "stupid" },
      { id: "weapon", rating: 9 },
    ],
    optionalTraits: [
      { id: "corrupted", value: "Minor" },
      { id: "dark-vision" },
      { id: "disease", value: "Ratte Fever" },
      { id: "infestation" },
      { id: "mutation" },
      { id: "tail-attack", rating: 8 },
      { id: "tracker" },
      { id: "trained", value: ["Broken", "Guard", "Mount", "War"] },
    ],
    defaultCount: 1,
  },
];

export const creatureTemplates: CreatureTemplate[] = [
  ...skavenCreatureTemplates,
  ...threeFeathersNpcTemplates,
];

export type CreatureTemplateId = typeof creatureTemplates[number]["id"];

export const creatureTemplatesById: Record<CreatureTemplateId, CreatureTemplate> = Object.fromEntries(
  creatureTemplates.map((template) => [template.id, template]),
) as Record<CreatureTemplateId, CreatureTemplate>;

export const resolvedCreatureTemplates = creatureTemplates.map(resolveCreatureTemplate);

export const resolvedCreatureTemplatesById: Record<CreatureTemplateId, ResolvedCreatureTemplate> = Object.fromEntries(
  resolvedCreatureTemplates.map((template) => [template.id, template]),
) as Record<CreatureTemplateId, ResolvedCreatureTemplate>;
