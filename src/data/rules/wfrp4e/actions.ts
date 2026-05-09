import type { ActionDefinition } from "../../../types";

export const actionDefinitions: ActionDefinition[] = [
  {
    id: "attack",
    name: "Attack",
    description:
      "A standard offensive action taken to strike an opponent. Whether with a blade, a polearm, or a ranged weapon, this represents a determined attempt to draw blood or incapacitate a foe.",
  },
  {
    id: "charge",
    name: "Charge",
    description:
      "You hurl yourself into combat with momentum. By committing to a reckless advance, you gain more power and accuracy on impact, provided you have sufficient distance to build speed before striking.",
  },
  {
    id: "parry",
    name: "Parry",
    description:
      "The essential art of deflecting a blow with your own weapon or shield. Instead of simply dodging, you catch the opponent's strike and turn it aside, focusing your skill on neutralizing their offense.",
  },
  {
    id: "defend",
    name: "Defend",
    description:
      "You focus your efforts on staying alive, committing your action to a guarded posture and gaining a defensive skill bonus when resisting attacks.",
  },
];
