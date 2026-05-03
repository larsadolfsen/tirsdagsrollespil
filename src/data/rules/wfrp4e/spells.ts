import type { SpellDefinition } from "../../../types";

export const spellDefinitions: SpellDefinition[] = [
  {
    id: "bolt",
    name: "Bolt",
    description: "You fire a missile of shimmering magical energy from your hand at a target.",
    cn: 4,
    range: "24 yards",
    target: "1",
    duration: "Instant",
    damage: "+8",
  },
  {
    id: "blast",
    name: "Blast",
    description:
      "You channel magic into an explosive blast. This is a magic missile with Damage +3 that targets everyone in the Area of Effect.",
    cn: 4,
    range: "Willpower yards",
    target: "AoE (Willpower Bonus yards)",
    duration: "Instant",
    damage: "+3",
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
