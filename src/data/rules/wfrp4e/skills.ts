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

type SkillCopy = {
  shortDescription: string;
  description: string;
};

const SKILL_COPY: Record<string, SkillCopy> = {
  animal_care: {
    shortDescription: "Care for animals and heal their wounds.",
    description: `One advance allows you to keep animals healthy without a test. A test lets you:

* Spot illness, understand discomfort, or determine animal quality.
* Staunch bleeding or prepare an animal for display.
* Heal wounds equal to your Intelligence Bonus plus SL.

An animal receives only one healing roll per encounter. In combat, a success appraises an enemy animal. You and informed allies gain a +10 bonus to hit that animal or its rider until the end of your next turn.`,
  },
  animal_training: {
    shortDescription: "Train and command specific animals.",
    description: `A test lets you identify the trained abilities of an animal within your specialisation.

In combat, a successful opposed test against the animal's Willpower inflicts the fear condition until the end of your next turn. You use this skill instead of Melee to defend against that target. With GM permission, you use it to attack or issue commands.`,
  },
  art: {
    shortDescription: "Create works of art within a chosen medium.",
    description: "Working without trade tools inflicts a penalty to your test. The SL determines the quality of the final piece. Large works require an extended test where total SL tracks your progress.",
  },
  athletics: {
    shortDescription: "Run, jump, and move with speed.",
    description: "This skill governs your physical actions and movement. You use it to calculate combat movement and handle difficult terrain.",
  },
  bribery: {
    shortDescription: "Judge if a target accepts a bribe.",
    description: `A test lets you reveal if a target accepts bribes. Each SL grants you one guess to find the target's price based on their earnings.

* In combat, a test to stop a fight counts as a hard (-20) test.
* Immune targets do not respond.
* Getting caught bribing causes a loss of status.`,
  },
  channelling: {
    shortDescription: "Control ambient magical energy.",
    description: "You use this skill to gather energy before casting spells. It functions as a grouped skill for specific lores or ungrouped for basic manipulation.",
  },
  charm: {
    shortDescription: "Influence the opinions and actions of others.",
    description: `An opposed test against the target's Cool influences a number of targets equal to your Fellowship Bonus plus SL. Targets with the lowest Willpower face the effect first. Amenable targets require no opposed roll.

In combat:

* Using Charm as an action calculates targets normally.
* Using Charm to defend affects only your immediate attacker. A success stops that attacker from striking you this round and grants you +1 advantage.
* You maintain this across turns by continuing to speak; the effect ends if a test fails.

Special applications:

* Public Speaking lets you influence multiple targets with a single test.
* Begging lets you earn brass pennies per hour based on your chosen pitch.`,
  },
  charm_animal: {
    shortDescription: "Befriend, calm, or subjugate animals.",
    description: "A test lets you influence a number of animals up to your Willpower Bonus plus SL. Hostile animals oppose your test with Willpower. In combat, affected animals do not attack you for the round and you gain +1 advantage. You maintain this across rounds until a test fails.",
  },
  climb: {
    shortDescription: "Ascend steep or vertical surfaces.",
    description: "If time is not an issue and the climb is easy, you succeed automatically without rolling. Complex surfaces or combat climbing require a test.",
  },
  consume_alcohol: {
    shortDescription: "Resist the intoxicating effects of alcohol.",
    description: `After each drink, you make a test modified by the drink's potency. Each failure inflicts a cumulative -10 penalty to your WS, BS, Ag, Dex, and Int, up to a maximum penalty of -30. If your failures equal your Toughness Bonus, you gain the stinking drunk condition and roll a 1d10 on the intoxication table.

Recovery rules:

* After one hour of sobriety, a challenging (+0) test lets you begin recovery.
* Effects clear after 10 minus SL hours.
* Failure on this recovery test inflicts a fatigued condition for 5 minus SL hours.
* You can spend 1 resolve point to ignore these penalties until the end of the next round.`,
  },
  cool: {
    shortDescription: "Resist stress, fear, and manipulation.",
    description: "This skill acts as your active defense against social and physical skills like Charm or Intimidate. You test it to resist fear, terror, and general psychology rules.",
  },
  dodge: {
    shortDescription: "Evade physical attacks and hazards.",
    description: "You use this skill in combat as an opposed test to resist incoming melee or ranged attacks, avoid damage, or sidestep hazards. A success lets you avoid the strike entirely.",
  },
  drive: {
    shortDescription: "Control wheeled vehicles.",
    description: `Normal conditions require no test. Adverse terrain, bad weather, or tactical maneuvers require a test.

* An astounding failure (-6 SL) forces an immediate roll on the driving mishap table.
* Crashing inflicts 2d10 wounds to occupants, modified by your Toughness Bonus and armour points.
* In combat, you test Drive to ram targets or outrun pursuers.`,
  },
  endurance: {
    shortDescription: "Withstand physical hardship and exposure.",
    description: "You test this skill to resist or recover from physical conditions like fatigued or bleeding. It mitigates the effects of extreme temperatures or long-term physical exertion.",
  },
  entertain: {
    shortDescription: "Perform for crowds using voice or physical performance.",
    description: "A successful test lets you entertain patrons close enough to see and hear your performance, where the SL indicates your performance quality. In combat, specific specialisations like Acting can confuse or mislead opponents.",
  },
  evaluate: {
    shortDescription: "Determine the accurate value of rare items.",
    description: "This skill lets you identify the value of unique objects and spot counterfeits. When you inspect a forged item, this acts as an opposed test against the forger's Art or Trade SL.",
  },
  gamble: {
    shortDescription: "Calculate odds and play games of chance.",
    description: "To resolve a game, all players make a test. The player with the highest SL wins the stake. On a tie, lower scoring players drop out and tied players roll again. A success lets you draw an extra card or reroll a die per SL in mini-games.",
  },
  gossip: {
    shortDescription: "Gather news and local rumors.",
    description: "A successful test lets you uncover one piece of local information. Each SL provides you one additional piece of information or expands your number of receptive individuals by your Fellowship Bonus.",
  },
  haggle: {
    shortDescription: "Negotiate lower prices when buying or selling.",
    description: "This resolves as an opposed test against a vendor or buyer to shift prices in your favor.",
  },
  heal: {
    shortDescription: "Diagnose conditions and patch wounds.",
    description: `A successful test lets you:

* Diagnose an illness or treat a disease.
* Staunch bleeding.
* Heal wounds equal to your Intelligence Bonus plus SL.

A patient receives only one successful roll per encounter. Omitting sterile liquids or poultices inflicts a minor infection if your SL falls below 0. An astounding failure inflicts a minor infection automatically.`,
  },
  intimidate: {
    shortDescription: "Coerce or frighten sentient creatures.",
    description: `This resolves as an opposed test against the target's Cool. Success lets you coerce a number of targets equal to your Strength Bonus plus SL.

In combat:

* A success inflicts the fear condition.
* You use Intimidate instead of Melee to defend against targets affected by your fear.
* An action lets you command intimidated targets to drop weapons or flee.
* Failing a subsequent test removes the fear effect.

Alternative characteristics like Willpower or Intelligence apply based on your context.`,
  },
  intuition: {
    shortDescription: "Read body language and sense motives.",
    description: "This skill lets you detect lies or hidden intent. Targets oppose this with Cool or Acting. In combat, a success grants you +1 advantage. You maintain and build this on subsequent turns by observing targets, up to your Intelligence Bonus, if no one interrupts you.",
  },
  language: {
    shortDescription: "Speak and write foreign tongues.",
    description: "You speak your native tongue and Reikspiel without a test. A test is required to convey or comprehend complex, archaic, or obscure concepts. You use Language (Magick) to cast spells; failure triggers miscast rules.",
  },
  leadership: {
    shortDescription: "Command and inspire confidence under pressure.",
    description: `A successful test lets you issue orders to a number of targets equal to your Fellowship Bonus plus SL. Subordinates require no opposed roll; dangerous orders or equal ranks oppose your test with Cool.

In combat:

* A success grants a +10 bonus to psychology tests for affected allies until the end of the next round.
* Testing lets you transfer your advantage to an ally who hears you, plus one advantage per SL to other allies within earshot.`,
  },
  lore: {
    shortDescription: "Recall academic and historical knowledge.",
    description: "Possessing the skill clears your need to test for basic facts. Obscure data requires a test, where SL determines your accuracy. In combat, a successful test related to your environment or opponent grants you +1 advantage.",
  },
  melee: {
    shortDescription: "Attack and defend using close-quarters weapons.",
    description: "This skill resolves your close-combat strikes and parries via opposed tests against the defender's Melee or Dodge. Using an untrained weapon category inflicts penalties and removes specific weapon qualities.",
  },
  navigation: {
    shortDescription: "Orient position and plot travel routes.",
    description: "You determine your location and travel toward landmarks without a test under normal conditions. A test is required if you are completely disoriented or far off a marked path. Extended journeys require a prolonged test sequence where each roll represents a fixed time block.",
  },
  outdoor_survival: {
    shortDescription: "Forage, hunt, and build wilderness shelters.",
    description: `This skill lets you secure sustenance and shelter. Each SL provides for one additional person.

* If your test fails, you must pass a Challenging (+0) Endurance Test or receive the Fatigued condition.
* Astounding failures trigger major hazards.
* In wilderness combat, a test can grant you +1 advantage by identifying tactical high ground.`,
  },
  perception: {
    shortDescription: "Notice details and hidden things.",
    description: "Noticing things using your five senses and resisting attempts to hide items or people.",
  },
  perform: {
    shortDescription: "Execute physically demanding arts or spectacles.",
    description: `A successful test lets you entertain patrons within your line of sight, where SL determines the quality.

In combat:

* You can use Perform (Acrobatics) to replace Dodge to evade attacks.
* Other specialisations let you generate +1 advantage as an action.
* Certain options function directly as weapons if you have the correct trappings.`,
  },
  pick_lock: {
    shortDescription: "Bypass mechanical locks without a key.",
    description: `This resolves as an extended test where your required SL targets lock complexity.

* Improvised tools inflict a -10 penalty to your test.
* Each roll consumes one combat round.
* You cannot attempt lock picking unless you are trained or the mechanism is simple, which grants you a single Very Hard (-30) Dexterity Test.`,
  },
  play: {
    shortDescription: "Perform musical compositions with an instrument.",
    description: "A successful test lets you play a piece for patrons close enough to hear. The final SL indicates your acoustic quality and determines the crowd's financial response.",
  },
  pray: {
    shortDescription: "Invoke divine blessings and petition miracles.",
    description: `This skill lets you request divine intervention or manifest miracles.

In combat:

* An action lets you test to focus your zeal.
* Each round you spend praying alongside a successful test grants you +1 advantage, up to your Fellowship Bonus.
* If enemies recognize your deity, your test can replace your Intimidate skill.`,
  },
  ranged: {
    shortDescription: "Attack targets from a distance with projectile weapons.",
    description: "This skill resolves your ranged attacks via opposed tests against Dodge or Melee (if shields apply). Using an untrained category inflicts standard penalties.",
  },
  research: {
    shortDescription: "Extract information from libraries and archives.",
    description: "You require the Read/Write Talent to attempt complex tasks. Simple research automatically succeeds over time without a roll. Obscure information requires a test where the final SL determines your data depth and reduces your research hours.",
  },
  ride: {
    shortDescription: "Ride and control mounts.",
    description: "Proficiency in riding and controlling animals like horses or demigryphs.",
  },
  row: {
    shortDescription: "Move boats with oars.",
    description: "Prowess at pulling an oar and moving a boat through water.",
  },
  sail: {
    shortDescription: "Operate and maneuver sailing vessels.",
    description: "Operating and maneuvering sailing vessels, including steering and knotwork.",
  },
  secret_signs: {
    shortDescription: "Read and use clandestine markings.",
    description: "Deciphering clandestine markings used by specific groups like thieves or scouts.",
  },
  set_trap: {
    shortDescription: "Deploy, conceal, and disarm mechanical traps.",
    description: "Bypassing, activating, or disarming basic traps succeeds automatically given uninterrupted time. A test is required if you are under pressure or if the device is structurally complex. Setting standard traps requires an Average (+20) test.",
  },
  sleight_of_hand: {
    shortDescription: "Pick pockets, palm objects, and perform minor stage magic.",
    description: `This resolves as an opposed test against the target's active Perception. Success lets you secure the item cleanly; a marginal success leaves the target suspicious.

* You can use this skill to supplement your Gamble tests to reverse a failure.
* In combat, a successful test lets you create a distraction or ready a concealed weapon, granting you +1 advantage.`,
  },
  stealth: {
    shortDescription: "Move silently and remain undetected.",
    description: "This resolves as an opposed test against the target's active Perception. Modifiers depend on local lighting and cover. An astounding failure automatically reveals your location. You use this to set up an Ambush or execute unexpected strikes from behind.",
  },
  swim: {
    shortDescription: "Move through deep water without drowning.",
    description: "In calm conditions, your movement is automatic without a test. A test is required in difficult currents or if you are heavily encumbered. This skill completely replaces Athletics in water-based combat. Your movement rate is halved when tracking exact combat speeds.",
  },
  track: {
    shortDescription: "Follow trails, footprints, and signs of passage.",
    description: "You use this to follow subtle trails across the wilderness. Basic signs use standard Perception instead. Track lets you actively mask your trail, forcing pursuers into an opposed test. Following an actively fleeing target uses Pursuit rules.",
  },
  trade: {
    shortDescription: "Manufacture goods and provide commercial services.",
    description: `You automatically execute routine tasks if you have the matching tools and resources. A test is required to:

* Work under time constraints or in adverse conditions.
* Create high-quality masterpieces.

This resolves as an extended test. You can also perform this as a Lore test for technical data.`,
  },
  psychometry: {
    shortDescription: "Read traces left on people, places, or objects.",
    description: "Reading traces of memory, emotion, or magic left on people, places, or objects.",
  },
};

const GROUPED_SPECIALISATIONS: Record<string, string[]> = {
  art: ["Cartography", "Engraving", "Mosaics", "Painting", "Sculpture", "Tattoo", "Weaving"],
  entertain: ["Acting", "Comedy", "Singing", "Storytelling"],
  melee: ["Basic", "Brawling", "Cavalry", "Fencing", "Flail", "Parry", "Pole-Arm", "Two-Handed"],
  animal_training: ["Demigryph", "Dog", "Horse", "Pegasus", "Pigeon", "Wolf"],
  language: ["Battle Tongue", "Bretonnian", "Classical", "Estalian", "Guilder", "Khazalid", "Magick", "Mootish", "Norse", "Reikspiel", "Tilean", "Wastelander"],
  lore: ["Engineering", "Geology", "Heraldry", "History", "Law", "Magick", "Metallurgy", "Science", "Theology", "Reikland", "The Empire", "War", "Local", "Chaos"],
  channelling: ["Aqshy", "Azyr", "Chamon", "Dhar", "Ghyran", "Ghur", "Hysh", "Shyish", "Ulgu"],
  perform: ["Acrobatics", "Clowning", "Dance", "Firebreathing", "Juggling", "Mountebank", "Sleight of Hand"],
  play: ["Bagpipe", "Drum", "Fiddle", "Flute", "Harp", "Horn", "Lute"],
  // Pray is ungrouped in the strict Core rules, but this dataset models per-deity
  // specialisations (used by characters, e.g. Pray (Sigmar)); kept intentionally.
  pray: ["Manann", "Morr", "Myrmidia", "Ranald", "Rhya", "Shallya", "Sigmar", "Taal", "Ulric", "Verena"],
  ranged: ["Blackpowder", "Bow", "Crossbow", "Engineering", "Entangling", "Explosives", "Sling", "Throwing"],
  ride: ["Demigryph", "Great Wolf", "Griffon", "Horse", "Pegasus"],
  sail: ["Barge", "Caravel", "Cog", "Frigate", "Wolfship"],
  secret_signs: ["Grey Order", "Guild", "Ranger", "Scout", "Thief", "Vagabond"],
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
): SkillDefinition[] {
  return names.map((name) => {
    const id = toSnakeCase(name);
    const copy = SKILL_COPY[id];
    return {
      id,
      name,
      type,
      shortDescription: copy.shortDescription,
      description: copy.description,
      grouped: groupedSkillIds.has(id) || undefined,
      specialisationLabel: groupedSkillIds.has(id) ? "Specialisation" : undefined,
    };
  });
}

export const skillDefinitions: SkillDefinition[] = [
  ...createSkillDefinitions(basicSkillNames, "basic"),
  ...createSkillDefinitions(advancedSkillNames, "advanced"),
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
