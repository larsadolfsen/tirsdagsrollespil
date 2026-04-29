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
  art: "Used to create works of art such as paintings, sculptures, or tattoos.",
  athletics: "Governs physical activities like running, jumping, and moving with grace.",
  bribery: "The ability to judge if someone will accept a bribe and determine the appropriate price.",
  charm: "Used to make others think favorably of you or your opinions; includes public speaking and begging.",
  charm_animal: "The aptitude for befriending, calming, or subjugating animals.",
  climb: "The ability to ascend steep or vertical surfaces.",
  cool: "Used to remain calm under stress, resist fear, and stick to your convictions.",
  consume_alcohol: "Your ability to handle drink without losing judgment or becoming stinking drunk.",
  dodge: "The ability to avoid incoming attacks, traps, or falling objects.",
  drive: "Used to guide vehicles like carts and coaches through difficult conditions.",
  endurance: "The ability to withstand hardship, deprivation, or harsh environments.",
  entertain: "The ability to delight crowds through acting, comedy, singing, or storytelling.",
  gamble: "Measuring the likelihood of a bet paying off and engaging in games of chance.",
  gossip: "Used to ferret out news and spread rumors within a local area.",
  haggle: "Negotiating with others to secure better deals or prices.",
  intimidate: "Coercing or frightening others through physical or verbal threats.",
  intuition: "Noticing when something is wrong or sensing if someone is hiding their true intent.",
  leadership: "The ability to lead others, command respect, and issue orders in and out of combat.",
  melee: "Training in specific types of close combat weaponry.",
  navigation: "Finding your way in the wilderness using landmarks, stars, or maps.",
  outdoor_survival: "Surviving in the wild by fishing, foraging, building fires, and finding shelter.",
  perception: "Noticing things using your five senses and resisting attempts to hide items or people.",
  ride: "Proficiency in riding and controlling animals like horses or demigryphs.",
  row: "Prowess at pulling an oar and moving a boat through water.",
  stealth: "Creeping quietly and concealing yourself in shadows.",
};

const ADVANCED_SKILL_DESCRIPTIONS: Record<string, string> = {
  animal_care: "Tending to, caring for, and healing sick or wounded animals.",
  animal_training: "Understanding and training specific types of animals to perform tasks.",
  channelling: "The ability to call upon and control the various Winds of Magic.",
  evaluate: "Determining the value of rare artifacts, trade goods, and identifying counterfeits.",
  heal: "Training to diagnose illnesses, treat diseases, and tend to wounds.",
  language: "Knowledge and use of non-native tongues such as Classical, Eltharin, or Magick.",
  lore: "Formal education in a branch of specialist knowledge like History, Law, or Theology.",
  perform: "Physically demanding arts such as acrobatics, firebreathing, or juggling.",
  pick_lock: "Understanding and opening mechanical locks without the proper keys.",
  play: "The ability to make music using a specific instrument like a lute or bagpipe.",
  pray: "Invoking or communing with a deity for divine intervention or focus.",
  ranged: "Training and practice in using ranged weapons like bows, pistols, or slings.",
  research: "Pulling obscure knowledge from libraries and archives.",
  sail: "Operating and maneuvering sailing vessels, including steering and knotwork.",
  secret_signs: "Deciphering clandestine markings used by specific groups like thieves or scouts.",
  set_trap: "The ability to set and disarm various traps and snares.",
  sleight_of_hand: "Picking pockets, palming objects, and cheating at games of chance.",
  swim: "The ability to move through water without drowning.",
  track: "Following subtle trails and recognizing signs of a quarry's passage across the wilderness.",
  trade: "The ability to create items or provide services within a specific trade.",
  psychometry: "Reading traces of memory, emotion, or magic left on people, places, or objects.",
};

const GROUPED_SPECIALISATIONS: Record<string, string[]> = {
  entertain: ["Acting", "Comedy", "Singing", "Storytelling"],
  melee: ["Basic", "Brawling", "Cavalry", "Fencing", "Flail", "Parry", "Polearm", "Two-Handed"],
  animal_training: ["Demigryph", "Dog", "Horse", "Pegasus", "Pigeon", "Wolf"],
  language: ["Battle Tongue", "Bretonnian", "Classical", "Estalian", "Khazalid", "Magick", "Mootish", "Norsk", "Reikspiel", "Tilean", "Wastelander"],
  lore: ["Engineering", "Heraldry", "History", "Law", "Magic", "Metallurgy", "Science", "Theology", "Reikland", "The Empire", "War", "Local", "Chaos"],
  channelling: ["Aqshy", "Azyr", "Chamon", "Ghyran", "Ghur", "Hysh", "Shyish", "Ulgu"],
  perform: ["Acrobatics", "Clowning", "Dance", "Firebreathing", "Juggling", "Mountebank", "Sleight of Hand"],
  play: ["Bagpipe", "Drum", "Fiddle", "Flute", "Harp", "Horn", "Lute"],
  pray: ["Manann", "Morr", "Myrmidia", "Ranald", "Rhya", "Shallya", "Sigmar", "Taal", "Ulric", "Verena"],
  ranged: ["Blackpowder", "Bow", "Crossbow", "Engineering", "Entangling", "Explosives", "Sling", "Throwing"],
  secret_signs: ["Grey Order", "Guild", "Ranger", "Scout", "Thief"],
  stealth: ["Rural", "Urban", "Underground"],
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
  "Psychometry",
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
  psychometry: "Int",
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
