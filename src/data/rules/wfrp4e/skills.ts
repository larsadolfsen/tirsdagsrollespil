import type {
  SkillDefinition,
  SkillSpecialisationDefinition,
} from "../../../types";

type ResolvedSkillOption = {
  id: string;
  skillId: string;
  specialisationId?: string;
  name: string;
};

const BASIC_SKILL_DESCRIPTIONS: Record<string, string> = {
  art: "Create visual works and evaluate artistic technique.",
  athletics: "Run, jump, vault, and push your body through physical challenges.",
  bribery: "Influence people with gifts, coin, and well-placed incentives.",
  charm: "Win others over with poise, warmth, and social grace.",
  charm_animal: "Calm, coax, and guide animals through handling and empathy.",
  climb: "Scale walls, ropes, trees, and other vertical obstacles.",
  cool: "Keep your nerve under pressure, terror, and provocation.",
  consume_alcohol: "Handle intoxicants without losing control.",
  dodge: "Avoid incoming blows, missiles, and sudden hazards.",
  drive: "Control carts, wagons, and similar land vehicles.",
  endurance: "Resist fatigue, pain, disease, and prolonged hardship.",
  entertain: "Hold an audience through performance and showmanship.",
  gamble: "Play games of chance and read the flow of wagers.",
  gossip: "Collect rumours, street talk, and casual social intelligence.",
  haggle: "Negotiate prices and squeeze better terms from a deal.",
  intimidate: "Coerce others through menace, presence, and threat.",
  intuition: "Read situations and people through instinct and subtle cues.",
  leadership: "Direct, inspire, and organize others under your command.",
  melee: "Fight in close combat with trained weapon techniques.",
  navigation: "Keep bearings, chart routes, and avoid getting lost.",
  outdoor_survival: "Endure in the wild through tracking, shelter, and foraging.",
  perception: "Spot details, danger, and hidden information with your senses.",
  ride: "Control mounts while travelling or under pressure.",
  row: "Handle oars and propel a boat through water.",
  stealth: "Move quietly and remain unseen or unnoticed.",
};

const ADVANCED_SKILL_DESCRIPTIONS: Record<string, string> = {
  animal_care: "Treat, feed, and maintain the health of animals.",
  animal_training: "Teach animals commands, discipline, and specialist behaviour.",
  channelling: "Shape and direct magical power through practiced control.",
  evaluate: "Judge the quality, authenticity, and worth of goods.",
  heal: "Treat wounds, illness, and trauma with medical knowledge.",
  language: "Speak, read, and understand a trained language.",
  lore: "Recall formal knowledge from a specific body of learning.",
  perform: "Stage a practiced act with technical skill and polish.",
  pick_lock: "Open secured locks with tools and patience.",
  play: "Perform music with a trained instrument.",
  pray: "Invoke a deity through proper rites and devotion.",
  ranged: "Attack effectively with trained ranged weapon disciplines.",
  research: "Find, connect, and interpret information through study.",
  sail: "Handle a sailing vessel and manage wind-driven travel.",
  secret_signs: "Recognize and use coded signs of hidden groups.",
  set_trap: "Prepare snares, traps, and ambush devices.",
  sleight_of_hand: "Palm, conceal, and manipulate objects unnoticed.",
  swim: "Stay afloat and move effectively in water.",
  track: "Follow trails, signs, and traces across terrain.",
  trade: "Practice a professional craft or commercial discipline.",
};

const GROUPED_SPECIALISATIONS: Record<string, string[]> = {
  entertain: ["Acting", "Comedy", "Singing", "Storytelling"],
  melee: ["Basic", "Brawling", "Cavalry", "Fencing", "Flail", "Parry", "Polearm", "Two-Handed"],
  animal_training: ["Demigryph", "Dog", "Horse", "Pegasus", "Pigeon", "Wolf"],
  language: ["Battle Tongue", "Bretonnian", "Classical", "Estalian", "Khazalid", "Magick", "Mootish", "Norsk", "Reikspiel", "Tilean", "Wastelander"],
  lore: ["Engineering", "Heraldry", "History", "Law", "Magic", "Metallurgy", "Science", "Theology", "Reikland", "The Empire", "War", "Local"],
  perform: ["Acrobatics", "Clowning", "Dance", "Firebreathing", "Juggling", "Mountebank", "Sleight of Hand"],
  play: ["Bagpipe", "Drum", "Fiddle", "Flute", "Harp", "Horn", "Lute"],
  pray: ["Manann", "Morr", "Myrmidia", "Ranald", "Rhya", "Shallya", "Sigmar", "Taal", "Ulric", "Verena"],
  ranged: ["Blackpowder", "Bow", "Crossbow", "Engineering", "Entangling", "Explosives", "Sling", "Throwing"],
  secret_signs: ["Grey Order", "Guild", "Ranger", "Scout", "Thief"],
  trade: ["Apothecary", "Calligrapher", "Carpenter", "Cook", "Engineer", "Farmer", "Gunsmith", "Herbalist", "Mason", "Merchant", "Smith", "Tailor"],
};

const groupedSkillIds = new Set(Object.keys(GROUPED_SPECIALISATIONS));

const basicSkillNames = [
  "Art",
  "Athletics",
  "Bribery",
  "Charm",
  "Charm Animal",
  "Climb",
  "Cool",
  "Consume Alcohol",
  "Dodge",
  "Drive",
  "Endurance",
  "Entertain",
  "Gamble",
  "Gossip",
  "Haggle",
  "Intimidate",
  "Intuition",
  "Leadership",
  "Melee",
  "Navigation",
  "Outdoor Survival",
  "Perception",
  "Ride",
  "Row",
  "Stealth",
] as const;

const advancedSkillNames = [
  "Animal Care",
  "Animal Training",
  "Channelling",
  "Evaluate",
  "Heal",
  "Language",
  "Lore",
  "Perform",
  "Pick Lock",
  "Play",
  "Pray",
  "Ranged",
  "Research",
  "Sail",
  "Secret Signs",
  "Set Trap",
  "Sleight of Hand",
  "Swim",
  "Track",
  "Trade",
] as const;

function toSnakeCase(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function createSkillDefinitions(
  names: readonly string[],
  type: "basic" | "advanced",
  descriptions: Record<string, string>,
): SkillDefinition[] {
  return names.map((name) => {
    const id = toSnakeCase(name);
    return {
      id,
      name,
      type,
      description: descriptions[id],
      grouped: groupedSkillIds.has(id) || undefined,
      specialisationLabel: groupedSkillIds.has(id) ? "Specialisation" : undefined,
    };
  });
}

export const skillDefinitions: SkillDefinition[] = [
  ...createSkillDefinitions(basicSkillNames, "basic", BASIC_SKILL_DESCRIPTIONS),
  ...createSkillDefinitions(advancedSkillNames, "advanced", ADVANCED_SKILL_DESCRIPTIONS),
];

export const skillSpecialisationDefinitions: SkillSpecialisationDefinition[] = Object.entries(
  GROUPED_SPECIALISATIONS,
).flatMap(([skillId, names]) =>
  names.map((name) => ({
    id: `${skillId}_${toSnakeCase(name)}`,
    skillId,
    name,
  })),
);

export const skillCharacteristicById: Record<string, string> = {
  art: "Dex",
  athletics: "Ag",
  bribery: "Fel",
  charm: "Fel",
  charm_animal: "WP",
  climb: "S",
  cool: "WP",
  consume_alcohol: "T",
  dodge: "Ag",
  drive: "Ag",
  endurance: "T",
  entertain: "Fel",
  gamble: "Int",
  gossip: "Fel",
  haggle: "Fel",
  intimidate: "S",
  intuition: "I",
  leadership: "Fel",
  melee: "WS",
  navigation: "I",
  outdoor_survival: "Int",
  perception: "I",
  ride: "Ag",
  row: "S",
  stealth: "Ag",
  animal_care: "Int",
  animal_training: "Int",
  channelling: "WP",
  evaluate: "Int",
  heal: "Int",
  language: "Int",
  lore: "Int",
  perform: "Ag",
  pick_lock: "Dex",
  play: "Dex",
  pray: "Fel",
  ranged: "BS",
  research: "Int",
  sail: "Ag",
  secret_signs: "Int",
  set_trap: "Dex",
  sleight_of_hand: "Dex",
  swim: "S",
  track: "I",
  trade: "Dex",
};

export function getSkillDisplayName(
  skill: Pick<SkillDefinition, "name" | "grouped">,
  specialisation?: Pick<SkillSpecialisationDefinition, "name"> | null,
) {
  if (skill.grouped && specialisation) {
    return `${skill.name} (${specialisation.name})`;
  }

  return skill.name;
}

export function buildResolvedSkillOptions(
  skills: SkillDefinition[],
  specialisations: SkillSpecialisationDefinition[],
): ResolvedSkillOption[] {
  const specialisationsBySkillId = specialisations.reduce<Record<string, SkillSpecialisationDefinition[]>>(
    (acc, specialisation) => {
      acc[specialisation.skillId] ??= [];
      acc[specialisation.skillId].push(specialisation);
      return acc;
    },
    {},
  );

  return skills.flatMap((skill) => {
    const groupedOptions = specialisationsBySkillId[skill.id] ?? [];
    if (skill.grouped && groupedOptions.length > 0) {
      return groupedOptions.map((specialisation) => ({
        id: `${skill.id}:${specialisation.id}`,
        skillId: skill.id,
        specialisationId: specialisation.id,
        name: getSkillDisplayName(skill, specialisation),
      }));
    }

    return [
      {
        id: skill.id,
        skillId: skill.id,
        name: getSkillDisplayName(skill),
      },
    ];
  });
}
