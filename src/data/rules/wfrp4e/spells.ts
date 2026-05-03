import type { SpellDefinition } from "../../../types";

type SpellDefinitionSeed = Omit<SpellDefinition, "category" | "school" | "schools"> &
  Partial<Pick<SpellDefinition, "category" | "school" | "schools">>;

const pettySpellIds = new Set([
  "animal-friend",
  "bearings",
  "careful-step",
  "conserve",
  "dart",
  "dazzle",
  "drain",
  "eavesdrop",
  "gust",
  "light",
  "magic-flame",
  "marsh-lights",
  "murmured-whisper",
  "open-lock",
  "produce-small-animal",
  "protection-from-rain",
  "purify-water",
  "rot",
  "shock",
  "sleep",
  "sly-hands",
  "sounds",
  "spring",
  "twitch",
  "warning",
]);

const fireLoreSpellIds = new Set([
  "aqshys-aegis",
  "cauterise",
  "crown-of-flame",
  "flaming-hearts",
  "firewall",
  "great-fires-of-uzhul",
  "flaming-sword-of-rhuin",
  "purge",
]);

const resolveSpellCategory = (spell: SpellDefinitionSeed): SpellDefinition["category"] => {
  if (spell.category) {
    return spell.category;
  }

  if (pettySpellIds.has(spell.id)) {
    return "petty";
  }

  return fireLoreSpellIds.has(spell.id) ? "school" : "arcane";
};

const spellDefinitionSeeds: SpellDefinitionSeed[] = [
  {
    id: "animal-friend",
    name: "Animal Friend",
    description:
      "Make friends with a creature smaller than you that has the Bestial Creature Trait. The animal trusts you completely and regards you as a friend.",
    cn: 0,
    range: "1 yard",
    target: "1",
    duration: "1 hour",
    damage: "-",
  },
  {
    id: "bearings",
    name: "Bearings",
    description:
      "Sense the influx of the Winds of Magic from their source. You know which direction North is.",
    cn: 0,
    range: "You",
    target: "You",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "careful-step",
    name: "Careful Step",
    description:
      "Organic matter you tread on remains undamaged. Twigs do not break, grass springs back, and delicate flowers are unharmed. Those using Track to pursue you through rural terrain suffer a -30 penalty.",
    cn: 0,
    range: "You",
    target: "You",
    duration: "WP minutes",
    damage: "-",
  },
  {
    id: "conserve",
    name: "Conserve",
    description:
      "Preserve up to a day's worth of rations. They do not rot, develop mould, or go stale for the duration, though they can still be harmed by external factors such as wet, fire, or poison.",
    cn: 0,
    range: "1 yard",
    target: "1",
    duration: "Willpower Bonus days",
    damage: "-",
  },
  {
    id: "dart",
    name: "Dart",
    description:
      "Cause a small dart of magical energy to fly from your fingers. This is a magic missile with Damage +0.",
    cn: 0,
    range: "Willpower yards",
    target: "1",
    duration: "Instant",
    damage: "+0",
  },
  {
    id: "dazzle",
    name: "Dazzle",
    description:
      "The target gains 1 Blinded Condition and gains 1 Blinded Condition at the start of each round for the duration of the spell.",
    cn: 0,
    range: "Touch",
    target: "1",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "drain",
    name: "Drain",
    description:
      "Touch your target and drain their life. This counts as a magic missile with Damage +0 that ignores Armour Points. You then heal 1 Wound.",
    cn: 0,
    range: "Touch",
    target: "1",
    duration: "Instant",
    damage: "+0",
  },
  {
    id: "eavesdrop",
    name: "Eavesdrop",
    description:
      "Hear what your targets say as if you were standing right next to them.",
    cn: 0,
    range: "Willpower yards",
    target: "1",
    duration: "Initiative Bonus minutes",
    damage: "-",
  },
  {
    id: "gust",
    name: "Gust",
    description:
      "Create a brief gust of wind strong enough to blow out a candle, open or slam a door, or blow a few pages to the floor.",
    cn: 0,
    range: "Willpower yards",
    target: "Special",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "light",
    name: "Light",
    description:
      "Create a small light, roughly equivalent to a torch, that glows from your hand, staff, or another part of your person. While active, you may pass an Average (+20) Channelling Test to increase the illumination to a lantern or decrease it to a candle.",
    cn: 0,
    range: "You",
    target: "You",
    duration: "Willpower minutes",
    damage: "-",
  },
  {
    id: "magic-flame",
    name: "Magic Flame",
    description:
      "Kindle a small flame in your palm. It does not burn you, but emits heat and can set flammable objects alight like a natural flame.",
    cn: 0,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "marsh-lights",
    name: "Marsh Lights",
    description:
      "Create flickering magical lights up to your Intelligence Bonus in number. They resemble torches or hooded lanterns. If they remain in line of sight, you may control them each Action with an Average (+20) Channelling Test, sending them moving in any direction at walking pace. They move through objects or witnesses in their path unless you test again to change direction.",
    cn: 0,
    range: "Willpower yards",
    target: "Special",
    duration: "Willpower minutes",
    damage: "-",
  },
  {
    id: "murmured-whisper",
    name: "Murmured Whisper",
    description:
      "Cast your voice at a point within Willpower yards regardless of line of sight. Your voice sounds from that point, and all within earshot can hear it.",
    cn: 0,
    range: "Willpower yards",
    target: "Special",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "open-lock",
    name: "Open Lock",
    description: "One non-magical lock you touch opens.",
    cn: 0,
    range: "Touch",
    target: "Special",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "produce-small-animal",
    name: "Produce Small Animal",
    description:
      "Reach into a bag, pocket, hat, under a rock, bush, or burrow and produce a small local animal of a type you would expect nearby, such as a rabbit, dove, or rat. If no appropriate local animals exist, the spell does nothing. The animal's temperament is not guaranteed.",
    cn: 0,
    range: "Touch",
    target: "Special",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "protection-from-rain",
    name: "Protection from Rain",
    description:
      "Keep yourself dry whatever the weather, unaffected by precipitation. This affects rain, hail, sleet, snow, and similar water falling from the heavens, but not standing water.",
    cn: 0,
    range: "You",
    target: "You",
    duration: "Toughness Bonus hours",
    damage: "-",
  },
  {
    id: "purify-water",
    name: "Purify Water",
    description:
      "Purify all water within a receptacle such as a flask, stein, or jug. Non-magical impurities are removed, leaving crisp, clear, potable water. Predominantly water-based liquids such as ale or wine are also purified, turning into delicious, pure, non-alcoholic water.",
    cn: 0,
    range: "1 yard",
    target: "Special",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "rot",
    name: "Rot",
    description:
      "Cause a roughly fist-sized volume of organic material to immediately rot. Food perishes, clothes crumble, leather shrivels and loses 1 Armour Point on 1 hit location, and similar effects occur as dictated by the GM.",
    cn: 0,
    range: "1 yard",
    target: "Special",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "shock",
    name: "Shock",
    description: "The target receives 1 Stunned Condition.",
    cn: 0,
    range: "Touch",
    target: "1",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "sleep",
    name: "Sleep",
    description:
      "Send your opponent into a deep sleep. If the target has the Prone Condition, they gain the Unconscious Condition as they fall asleep. They remain unconscious for the duration, although loud noises, movement, or jostling awaken them instantly. If standing or sitting when affected, they start themselves awake as they hit the ground, gaining Prone but remaining conscious. If targets are not resisting and are suitably tired, they pass into a deep and restful sleep at the spell's end.",
    cn: 0,
    range: "Touch",
    target: "1",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "sly-hands",
    name: "Sly Hands",
    description:
      "Teleport a small object, no bigger than your fist, from about your person into your hand.",
    cn: 0,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "sounds",
    name: "Sounds",
    description:
      "Create small noises nearby that seem to come from a specific location within range, regardless of line of sight. The noises may be footsteps, whispers, or an animal howl, but cannot be distinct enough to convey a message. While active, you may control the sounds with an Average (+20) Channelling Test, moving them, increasing volume, or decreasing volume.",
    cn: 0,
    range: "Willpower yards",
    target: "Special",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "spring",
    name: "Spring",
    description:
      "Touch the ground and water bubbles forth at a rate of 1 pint per Round, to a total of your Initiative Bonus in pints.",
    cn: 0,
    range: "Touch",
    target: "Special",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "twitch",
    name: "Twitch",
    description:
      "Cause a small object to move slightly. Something may fall from a shelf or a book may slam shut. If the object is held, the holder must pass an Average (+20) Dexterity Test or drop it.",
    cn: 0,
    range: "Willpower Bonus yards",
    target: "Special",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "warning",
    name: "Warning",
    description:
      "Channel magic into an object, noticing immediately if it has been poisoned or trapped.",
    cn: 0,
    range: "1 yard",
    target: "Special",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "aethyric-armour",
    name: "Aethyric Armour",
    description:
      "Wrap yourself in a protective swathe of magic, gaining +1 Armour Point to all Hit Locations.",
    cn: 2,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds+",
    damage: "-",
  },
  {
    id: "aethyric-arms",
    name: "Aethyric Arms",
    description:
      "Create a magical weapon with Damage equal to your Willpower Bonus. It may take any form and use any Melee Skill you possess. The weapon counts as Magical.",
    cn: 2,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds+",
    damage: "Willpower Bonus",
  },
  {
    id: "arrow-shield",
    name: "Arrow Shield",
    description:
      "Organic missiles, such as wooden arrows, are automatically destroyed if they pass within the Area of Effect and cause no damage to their target. Non-organic missiles, such as throwing knives or pistol shots, are unaffected.",
    cn: 3,
    range: "You",
    target: "AoE (Willpower Bonus yards)",
    duration: "Willpower Bonus rounds+",
    damage: "-",
  },
  {
    id: "blast",
    name: "Blast",
    category: "arcane",
    description:
      "Channel magic into an explosive blast. This is a magic missile with Damage +3 that targets everyone in the Area of Effect.",
    cn: 4,
    range: "Willpower yards",
    target: "AoE (Willpower Bonus yards)",
    duration: "Instant",
    damage: "+3",
  },
  {
    id: "bolt",
    name: "Bolt",
    description: "Channel magic into a damaging bolt. Bolt is a magic missile with Damage +4.",
    cn: 4,
    range: "Willpower yards",
    target: "1",
    duration: "Instant",
    damage: "+4",
  },
  {
    id: "breath",
    name: "Breath",
    description:
      "Immediately make a Breath attack, as if you had spent 2 Advantage to activate the Breath Creature Trait. This is a magic missile with Damage equal to your Toughness Bonus. The GM decides which type of Breath attack best suits your Arcane Magic Talent.",
    cn: 6,
    range: "1 yard",
    target: "Special",
    duration: "Instant",
    damage: "Toughness Bonus",
  },
  {
    id: "bridge",
    name: "Bridge",
    description:
      "Create a bridge of magical energy with a maximum length and breadth equal to your Willpower Bonus in yards. For every +2 SL, increase the length or breadth by your Willpower Bonus in yards.",
    cn: 4,
    range: "Willpower yards",
    target: "AoE (see description)",
    duration: "Willpower Bonus rounds+",
    damage: "-",
  },
  {
    id: "chain-attack",
    name: "Chain Attack",
    description:
      "Channel a twisting spur of rupturing magic into your target. This is a magic missile with Damage +4. If Chain Attack reduces a target to 0 Wounds, it leaps to another target within the spell's initial range and within Willpower Bonus yards of the previous target, inflicting the same Damage again. It may leap a maximum number of times equal to your Willpower Bonus. For every +2 SL, it may chain to one additional target.",
    cn: 6,
    range: "Willpower yards",
    target: "Special",
    duration: "Instant",
    damage: "+4",
  },
  {
    id: "corrosive-blood",
    name: "Corrosive Blood",
    description:
      "Infuse yourself with magic, lending your blood a fearsome potency. You gain the Corrosive Blood Creature Trait.",
    cn: 4,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "dark-vision",
    name: "Dark Vision",
    description:
      "Boost your Second Sight to assist your mundane senses. While active, gain the Dark Vision Creature Trait.",
    cn: 1,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "distracting",
    name: "Distracting",
    description:
      "Wreathe yourself in magic that swirls around you, distracting your foes. While active, gain the Distracting Creature Trait.",
    cn: 4,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "dome",
    name: "Dome",
    description:
      "Create a dome of magical energy overhead, blocking incoming attacks. Anyone within the Area of Effect gains the Ward (6+) Creature Trait against magical or ranged attacks from outside the dome. Those within may attack out of the dome as normal, and the dome does not impede movement.",
    cn: 7,
    range: "You",
    target: "AoE (Willpower Bonus yards)",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "drop",
    name: "Drop",
    description:
      "Channel magic into an object held by an opponent, such as a weapon, rope, or hand. Unless a Challenging (+0) Dexterity Test is passed, the item is dropped. For every +2 SL, impose an additional -10 penalty on the Dexterity Test.",
    cn: 1,
    range: "Willpower yards",
    target: "1",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "entangle",
    name: "Entangle",
    description:
      "Entrap your target in a form suited to your Lore, such as vines, shadows, or clothing. The target gains one Entangled Condition with a Strength equal to your Intelligence. For every +2 SL, you may give the target +1 additional Entangled Condition. The spell lasts until all Entangled Conditions are removed.",
    cn: 3,
    range: "Willpower yards",
    target: "1",
    duration: "Special",
    damage: "-",
  },
  {
    id: "fearsome",
    name: "Fearsome",
    description:
      "Shroud yourself in magic and become fearsome and intimidating. Gain Fear 1. For every +3 SL, you may increase your Fear value by one.",
    cn: 3,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "flight",
    name: "Flight",
    description:
      "You can fly, whether by sprouting wings, ascending on a pillar of magical light, or some other method. Gain the Flight (Agility) Creature Trait.",
    cn: 8,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds+",
    damage: "-",
  },
  {
    id: "magic-shield",
    name: "Magic Shield",
    description:
      "Encase yourself in bands of protective magic. While active, add +Willpower Bonus SL to any dispel attempts you make.",
    cn: 4,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "move-object",
    name: "Move Object",
    description:
      "Grab hold of a non-sentient object no larger than you and move it by will alone. The object is considered to have Strength equal to your Willpower and may move up to Willpower Bonus yards. Attempts to impede the object's movement require a Contested Willpower/Strength Test. For every +2 SL, increase the movement distance by Willpower Bonus yards.",
    cn: 4,
    range: "WP yards",
    target: "1",
    duration: "1 Round",
    damage: "-",
  },
  {
    id: "mundane-aura",
    name: "Mundane Aura",
    description:
      "Drain the Winds of Magic from your body and possessions, removing any magical aura. For the duration, you appear mundane to Magical Sense and similar detection. You cannot cast other spells while this is active, and it is dispelled if you make a Channelling Test.",
    cn: 4,
    range: "You",
    target: "You",
    duration: "Willpower minutes",
    damage: "-",
  },
  {
    id: "push",
    name: "Push",
    description:
      "Push all living creatures within Willpower Bonus yards back by your Willpower Bonus in yards and inflict the Prone Condition. If this causes contact with a wall or large obstacle, they take Damage equal to the distance travelled in yards. For every +2 SL, you may push creatures back another Willpower Bonus yards.",
    cn: 6,
    range: "You",
    target: "You",
    duration: "Instant",
    damage: "Special",
  },
  {
    id: "teleport",
    name: "Teleport",
    description:
      "Teleport up to your Willpower Bonus in yards. This movement allows you to traverse gaps, avoid perils and pitfalls, and ignore obstacles. For every +2 SL, increase the distance travelled by your Willpower Bonus in yards.",
    cn: 5,
    range: "You",
    target: "You",
    duration: "Instant",
    damage: "-",
  },
  {
    id: "terrifying",
    name: "Terrifying",
    description: "You gain the Terror (1) Creature Trait.",
    cn: 7,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "ward",
    name: "Ward",
    description: "Wrap yourself in protective magic, gaining the Ward (9+) Creature Trait.",
    cn: 5,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "aqshys-aegis",
    name: "Aqshy's Aegis",
    description:
      "Wrap yourself in a fiery cloak of Aqshy. You are completely immune to damage from non-magical fire, including breath attacks, and ignore any Ablaze Conditions received from them. Against magical fire attacks, including spells from the Lore of Fire, you receive the Ward (9+) Creature Trait.",
    cn: 5,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "cauterise",
    name: "Cauterise",
    description:
      "Channel Aqshy through your hands as you lay them on an ally's wounds. Immediately heal 1d10 Wounds and remove all Bleeding Conditions. The wound becomes infected. Targets without the Arcane Magic (Fire) Talent must pass a Challenging (+0) Cool Test or scream in agony. If failed by -6 SL or more, the target gains the Unconscious Condition and is permanently scarred, waking up 1d10 hours later.",
    cn: 4,
    range: "Touch",
    target: "1",
    duration: "Instant",
    damage: "Heal 1d10",
  },
  {
    id: "crown-of-flame",
    name: "Crown of Flame",
    description:
      "Channel Aqshy into a majestic crown of inspiring fire. Gain the Fear (1) Trait and +1 War Leader Talent while the spell is active. For every +2 SL, you may increase your Fear value by +1 or take War Leader again. You also gain +10 to all attempts to Channel and Cast with Aqshy while the spell is in effect.",
    cn: 8,
    range: "You",
    target: "You",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "flaming-hearts",
    name: "Flaming Hearts",
    description:
      "Your voice takes on a rich resonance, echoing with Aqshy's fiery passion. Affected allies lose all Broken and Fatigued Conditions and gain +1 Drilled, Fearless, and Stout-hearted Talent while the spell is in effect.",
    cn: 8,
    range: "Willpower yards",
    target: "AoE (Willpower Bonus yards)",
    duration: "Willpower Bonus rounds",
    damage: "-",
  },
  {
    id: "firewall",
    name: "Firewall",
    description:
      "Channel a fiery streak of Aqshy, creating a wall of flame. The firewall is Willpower Bonus yards wide and 1 yard deep. For every +2 SL, you may extend its length by +Willpower Bonus yards. Anyone crossing the firewall gains 1 Ablaze Condition and suffers a hit with Damage equal to your Willpower Bonus, handled like a magical missile.",
    cn: 6,
    range: "Willpower yards",
    target: "AoE (Special)",
    duration: "Willpower Bonus rounds",
    damage: "Willpower Bonus",
  },
  {
    id: "great-fires-of-uzhul",
    name: "Great Fires of U'Zhul",
    description:
      "Hurl a great, explosive blast of Aqshy into an enemy. This is a magical missile with Damage +10 that ignores Armour Points, inflicts +2 Ablaze Conditions, and applies the Prone Condition. Everyone within the Area of Effect suffers a Damage +5 hit ignoring Armour Points and must pass a Dodge Test or gain +1 Ablaze Condition. The spell stops behaving like a magic missile as the fire continues to burn in the Area of Effect for the duration. Anyone within the Area of Effect at the start of a round suffers 1d10+6 Damage, ignoring Armour Points, and gains +1 Ablaze Condition.",
    cn: 10,
    range: "Willpower yards",
    target: "AoE (Willpower Bonus yards)",
    duration: "Willpower Bonus rounds",
    damage: "+10",
  },
  {
    id: "flaming-sword-of-rhuin",
    name: "Flaming Sword of Rhuin",
    description:
      "Wreathe a sword in magical flames. The weapon has Damage +6 and the Impact Quality. Anyone struck by the blade gains +1 Ablaze Condition. If a wielder does not possess the Arcane Magic (Bright) Talent and fumbles an attack with the Flaming Sword, they gain +1 Ablaze Condition.",
    cn: 8,
    range: "Willpower yards",
    target: "1",
    duration: "Willpower Bonus rounds",
    damage: "+6",
  },
  {
    id: "purge",
    name: "Purge",
    description:
      "Funnel intense flame to burn away taint and corruption in an area. Anything flammable is set alight, and creatures in the area take +SL Ablaze Conditions. Corrupting influences such as Dhar, warpstone, or Chaos-tainted objects smoulder and blacken, beginning to burn. The spell may be maintained in subsequent rounds by passing a Challenging (+0) Channelling Test. The precise time needed to eliminate the corrupting influence is determined by the GM.",
    cn: 10,
    range: "Willpower yards",
    target: "AoE (Willpower Bonus yards)",
    duration: "Willpower Bonus rounds",
    damage: "Special",
  },
];

export const spellDefinitions: SpellDefinition[] = spellDefinitionSeeds.map((spell) => {
  const category = resolveSpellCategory(spell);
  const schools = spell.schools ?? (spell.school ? [spell.school] : category === "school" ? ["fire"] : undefined);

  return {
    ...spell,
    category,
    school: spell.school ?? schools?.[0],
    schools,
  };
});
