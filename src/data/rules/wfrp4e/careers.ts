import type { CareerDefinition } from "../../../types";

export const careerDefinitions: CareerDefinition[] = [
  {
    id: "soldier_halberdier",
    name: "Soldier",
    tier: "Halberdier",
    skillIds: [
      "athletics",
      "cool",
      "dodge",
      "intimidate",
      "melee",
      "perception",
    ],
    talentIds: [
      "drilled",
      "flee",
      "shields_up",
      "strike_to_injure",
      "strike_to_stun",
      "warrior_born",
    ],
    ranks: [
      { rank: 1, name: "Recruit", status: "Brass 3" },
      { rank: 2, name: "Soldier", status: "Silver 3" },
      { rank: 3, name: "Sergeant", status: "Silver 5" },
      { rank: 4, name: "Officer", status: "Gold 1" },
    ],
  },
];
