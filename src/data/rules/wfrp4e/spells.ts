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
];
