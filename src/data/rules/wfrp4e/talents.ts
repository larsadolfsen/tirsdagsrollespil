import type { TalentDefinition } from "../../../types";

const simpleTalent = (id: string, name: string, max = "1", tests?: string): TalentDefinition => ({
  id,
  name,
  max,
  tests,
  description: `${name} is available as a career talent. Add the full WFRP 4e rule text if detailed automation is needed.`,
  effects: [
    {
      type: "special_rule",
      rule: `${name} career talent.`,
    },
  ],
});

export const talentDefinitions: TalentDefinition[] = [
  {
    id: "combat_aware",
    name: "Combat Aware",
    max: "Initiative Bonus",
    tests: "Perception during melee",
    description:
      "You are used to scanning the battlefield to make snap decisions informed by the shifting tides of war. You may take a Challenging (+0) Perception Test to ignore Surprise, which is modified by circumstance as normal.",
    effects: [
      {
        type: "special_rule",
        rule: "May take a Challenging (+0) Perception Test to ignore Surprise.",
      },
    ],
  },
  {
    id: "strike_to_injure",
    name: "Strike to Injure",
    max: "Initiative Bonus",
    description:
      "You inflict your level of Strike to Injure in additional Wounds when you cause a Critical Wound.",
    effects: [
      {
        type: "damage_bonus",
        valuePerLevel: 1,
        condition: "when_causing_critical_wound",
      },
    ],
  },
  {
    id: "drilled",
    name: "Drilled",
    max: "Weapon Skill Bonus",
    tests: "Melee Tests when beside an ally with Drilled",
    description:
      "You have been trained to fight shoulder-to-shoulder with other soldiers. If an enemy causes you to lose Advantage when standing beside an active ally with the Drilled Talent, you may keep 1 lost Advantage for each time you have taken the Drilled Talent.",
    effects: [
      {
        type: "special_rule",
        rule: "When beside an active ally with Drilled, keep 1 lost Advantage per Talent level when an enemy causes Advantage loss.",
      },
    ],
  },
  {
    id: "flee",
    name: "Flee!",
    max: "Agility Bonus",
    tests: "Athletics when Fleeing",
    description:
      "When your life is on the line you are capable of impressive bursts of speed. Your Movement Attribute counts as 1 higher when Fleeing.",
    effects: [
      {
        type: "attribute_bonus",
        attribute: "movement",
        valuePerLevel: 1,
        condition: "when_fleeing",
      },
    ],
  },
  {
    id: "shields_up",
    name: "Shields Up",
    max: "Strength Bonus",
    tests: "Any Test to defend with a shield",
    description:
      "You are trained to maximize protection when fighting with a shield or under pressure.",
    effects: [
      {
        type: "special_rule",
        rule: "Apply shield-specific defensive rules when this Talent is used with a shield.",
      },
    ],
  },
  {
    id: "strike_to_stun",
    name: "Strike to Stun",
    max: "Weapon Skill Bonus",
    tests: "Melee Tests when Striking to Stun",
    description:
      "You know where to hit an opponent to bring him down fast. You ignore the Called Shot penalty to strike the Head Hit Location when using a melee weapon with the Pummel Quality. Further, you count all improvised weapons as having the Pummel Quality.",
    effects: [
      {
        type: "ignore_penalty",
        penalty: "called_shot_head",
        condition: "when_using_melee_weapon_with_pummel_quality",
      },
      {
        type: "special_rule",
        rule: "Improvised weapons count as having the Pummel Quality.",
      },
    ],
  },
  {
    id: "warrior_born",
    name: "Warrior Born",
    max: "1",
    description:
      "You gain a permanent +5 bonus to your starting Weapon Skill Characteristic. This does not count as Advances.",
    effects: [
      {
        type: "attribute_bonus",
        attribute: "weaponSkill",
        valuePerLevel: 5,
        condition: "starting_characteristic_only",
      },
    ],
  },
  {
    id: "doomed",
    name: "Doomed",
    max: "1",
    description:
      "At the age of 10, a Priest of Morr called a Doomsayer took you aside to foretell your death. Should your character die in a fashion that matches your Dooming, your next character gains a bonus of half the total XP your dead character accrued during play.",
    effects: [
      {
        type: "special_rule",
        rule: "If the character dies in the manner of their Dooming, the next character gains half the dead character's accrued XP.",
      },
    ],
  },
  {
    id: "suave",
    name: "Suave",
    max: "1",
    description:
      "You gain a permanent +5 bonus to your starting Fellowship Characteristic. This does not count towards your Advances.",
    effects: [
      {
        type: "attribute_bonus",
        attribute: "fellowship",
        valuePerLevel: 5,
        condition: "starting_characteristic_only",
      },
    ],
  },
  {
    id: "perfect_pitch",
    name: "Perfect Pitch",
    max: "Initiative Bonus",
    tests: "Entertain (Sing), Language (Tonal Languages, such as Eltharin, Cathayan, and Magick)",
    description:
      "You have perfect pitch, able to replicate notes perfectly and identify them without even making a Test. Further, add Entertain (Sing) to any Career you enter; if it is already in your Career, you may instead purchase the Skill for 5 XP fewer per Advance.",
    effects: [
      {
        type: "special_rule",
        rule: "Identify and replicate notes without a Test. Add Entertain (Sing) to any Career, or buy it 5 XP cheaper per Advance if already in Career.",
      },
    ],
  },
  {
    id: "read_write",
    name: "Read/Write",
    max: "1",
    description:
      "You are one of the rare literate individuals in the Old World. You are assumed to be able to read and write all of the Languages you can speak, if appropriate.",
    effects: [
      {
        type: "special_rule",
        rule: "Can read and write known Languages where appropriate.",
      },
    ],
  },
  {
    id: "resistance_corruption",
    name: "Resistance (Corruption)",
    max: "Toughness Bonus",
    tests: "Endurance Tests to resist Corruption",
    description: "You have a hardened spirit when resisting corrupting influences.",
    effects: [
      {
        type: "test_sl_bonus",
        test: "Endurance Tests to resist Corruption",
        valuePerLevel: 1,
      },
    ],
  },
  {
    id: "instinctive_diction",
    name: "Instinctive Diction",
    max: "Initiative Bonus",
    tests: "Language (Magick) when casting",
    description:
      "You instinctively understand the language of Magick and are capable of articulating the most complex phrases rapidly without error. You do not suffer a Miscast if you roll a double on a successful Language (Magick) Test.",
    effects: [
      {
        type: "special_rule",
        rule: "No Miscast from doubles on successful Language (Magick) Tests.",
      },
    ],
  },
  {
    id: "petty_magic",
    name: "Petty Magic",
    max: "1",
    description:
      "You have the spark to cast magic within you and have mastered techniques to control it at a basic level. When you take this Talent, you manifest and permanently memorise a number of spells equal to your Willpower Bonus.",
    effects: [
      {
        type: "special_rule",
        rule: "Learn Petty spells equal to Willpower Bonus. Extra Petty spells may be learned for XP by tier.",
      },
    ],
  },
  {
    id: "aethyric_attunement",
    name: "Aethyric Attunement",
    max: "Initiative Bonus",
    tests: "Channel (Any)",
    description:
      "Your experience, talent or training lets you more safely manipulate the Winds of Magic. You do not suffer a Miscast if you roll a double on a successful Channel Test.",
    effects: [
      {
        type: "special_rule",
        rule: "No Miscast from doubles on successful Channel Tests.",
      },
    ],
  },
  {
    id: "second_sight",
    name: "Second Sight",
    max: "Initiative Bonus",
    tests: "Any Test to detect the Winds of Magic",
    description:
      "You can perceive the shifting Winds of Magic that course from the Chaos Gates at the poles of the world. You now have the Sight.",
    effects: [
      {
        type: "special_rule",
        rule: "Can perceive the Winds of Magic and use the Sight.",
      },
    ],
  },
  simpleTalent("artistic", "Artistic", "Dexterity Bonus", "Art Tests"),
  simpleTalent("gunner", "Gunner", "Ballistic Skill Bonus", "Ranged (Blackpowder) Tests"),
  simpleTalent("tinker", "Tinker", "Dexterity Bonus", "Trade Tests to repair"),
  simpleTalent("craftsman_engineer", "Craftsman (Engineer)", "Dexterity Bonus", "Trade (Engineer) Tests"),
  simpleTalent("etiquette_guilder", "Etiquette (Guilder)", "Fellowship Bonus", "Social Tests with guilders"),
  simpleTalent("marksman", "Marksman", "1", "Ranged Tests"),
  simpleTalent("orientation", "Orientation", "Initiative Bonus", "Navigation Tests"),
  simpleTalent("etiquette_scholar", "Etiquette (Scholar)", "Fellowship Bonus", "Social Tests with scholars"),
  simpleTalent("master_tradesman_engineering", "Master Tradesman (Engineering)", "Dexterity Bonus", "Trade (Engineering) Tests"),
  simpleTalent("sniper", "Sniper", "Ballistic Skill Bonus", "Ranged Tests at long range"),
  simpleTalent("super_numerate", "Super Numerate", "Intelligence Bonus", "Evaluate and Gamble Tests"),
  simpleTalent("magnum_opus", "Magnum Opus", "1"),
  simpleTalent("rapid_reload", "Rapid Reload", "Dexterity Bonus", "Reloading ranged weapons"),
  simpleTalent("savant_engineering", "Savant (Engineering)", "Intelligence Bonus", "Lore (Engineering) Tests"),
  simpleTalent("unshakeable", "Unshakeable", "Willpower Bonus", "Cool Tests"),
  simpleTalent("arcane_magic_fire", "Arcane Magic (Lore of Fire)", "1"),
  simpleTalent("detect_artefact", "Detect Artefact", "Initiative Bonus", "Detecting magical artefacts"),
  simpleTalent("fast_hands", "Fast Hands", "Dexterity Bonus", "Sleight of Hand Tests"),
  simpleTalent("sixth_sense", "Sixth Sense", "Initiative Bonus", "Intuition Tests"),
  simpleTalent("dual_wielder", "Dual Wielder", "Weapon Skill Bonus", "Attacks with a weapon in each hand"),
  simpleTalent("magical_sense", "Magical Sense", "Initiative Bonus", "Perception Tests involving magic"),
  simpleTalent("menacing", "Menacing", "Strength Bonus", "Intimidate Tests"),
  simpleTalent("frightening", "Frightening", "Strength Bonus"),
  simpleTalent("iron_will", "Iron Will", "Willpower Bonus", "Tests to resist influence"),
  simpleTalent("war_wizard", "War Wizard", "Willpower Bonus"),
  simpleTalent("bless_any", "Bless (Any)", "1"),
  simpleTalent("etiquette_cultists", "Etiquette (Cultists)", "Fellowship Bonus", "Social Tests with cultists"),
  simpleTalent("strong_minded", "Strong-minded", "Willpower Bonus", "Tests to resist manipulation"),
  simpleTalent("inspiring", "Inspiring", "Fellowship Bonus", "Leadership Tests"),
  simpleTalent("invoke_any", "Invoke (Any)", "1"),
  simpleTalent("seasoned_traveller", "Seasoned Traveller", "Intelligence Bonus", "Travel-related Tests"),
  simpleTalent("holy_visions", "Holy Visions", "1"),
  simpleTalent("pure_soul", "Pure Soul", "Willpower Bonus", "Tests to resist corruption"),
  simpleTalent("stout_hearted", "Stout-hearted", "Willpower Bonus", "Cool Tests"),
  simpleTalent("fearless_any", "Fearless (Any)", "Willpower Bonus", "Fear Tests"),
  simpleTalent("furious_assault", "Furious Assault", "Weapon Skill Bonus", "Melee Tests"),
  simpleTalent("holy_hatred", "Holy Hatred", "Willpower Bonus"),
  simpleTalent("warleader", "Warleader", "Fellowship Bonus", "Leadership Tests in battle"),
];
