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
    id: "brace",
    name: "Brace",
    description:
      "You steady yourself or your weapon in anticipation of an event. For ranged weapons, this ensures a more stable shot; for defense, it prepares you to hold your ground against overwhelming force.",
  },
  {
    id: "feint",
    name: "Feint",
    description:
      "A calculated deception intended to draw your opponent's guard away. By faking an opening or a specific strike, you force your foe into a disadvantaged position, leaving them vulnerable to your true intent.",
  },
  {
    id: "disengage",
    name: "Disengage",
    description:
      "The disciplined act of withdrawing from a close quarters engagement. By maintaining focus and a defensive guard, you retreat safely without offering your opponent a simple opening for a parting strike.",
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
  {
    id: "grapple",
    name: "Grapple",
    description:
      "Engaging in a physical struggle to restrain or overpower an opponent. This involves grabbing, wrestling, and trying to pin the foe to prevent them from using their weapons or escaping effectively.",
  },
];
