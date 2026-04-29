/**
 * WFRP 4e Armour Properties and Flaws
 * Defines all possible qualities and flaws that armour can have
 */

export interface ArmourProperty {
  id: string;
  name: string;
  description: string;
  type: "quality" | "flaw";
}

/**
 * Armour Qualities
 * Positive properties that improve armor effectiveness or comfort
 */
export const armourQualities: Record<string, ArmourProperty> = {
  flexible: {
    id: "flexible",
    name: "Flexible",
    type: "quality",
    description:
      "Flexible armour may be worn beneath a layer of non-Flexible armour. When layered this way, the wearer benefits from both pieces.",
  },
  impenetrable: {
    id: "impenetrable",
    name: "Impenetrable",
    type: "quality",
    description:
      "Impenetrable armour is especially resilient. Critical Wounds caused by odd-numbered hit rolls, such as 11 or 33, are ignored.",
  },
  partial: {
    id: "partial",
    name: "Partial",
    type: "quality",
    description:
      "Partial armour does not cover the whole hit location. Attacks that roll an even number to hit, or roll a Critical Hit, ignore the partial armour's APs.",
  },
};

/**
 * Armour Flaws
 * Negative properties that create vulnerabilities or limitations
 */
export const armourFlaws: Record<string, ArmourProperty> = {
  weakpoints: {
    id: "weakpoints",
    name: "Weakpoints",
    type: "flaw",
    description:
      "Weakpoints leave small gaps where a skilled or lucky blow can slip through. If an opponent has a weapon with the Impale Quality and scores a Critical, the armour's APs are ignored.",
  },
  cumbersome: {
    id: "cumbersome",
    name: "Cumbersome",
    type: "flaw",
    description: "This armour is heavy and restrictive. Reduce Movement by 1.",
  },
  loud: {
    id: "loud",
    name: "Loud",
    type: "flaw",
    description:
      "This armour clatters and clangs with every movement. Anyone trying to be stealthy wearing this armour suffers an additional -20 to Stealth tests.",
  },
};

/**
 * Armour Locations
 * All possible body locations that armor can protect
 */
export const armourLocations = {
  head: {
    name: "Head",
    description: "Protects the head, face, and neck",
  },
  arms: {
    name: "Arms",
    description: "Protects both arms and shoulders",
  },
  body: {
    name: "Body",
    description: "Protects the torso and chest",
  },
  legs: {
    name: "Legs",
    description: "Protects both legs and hips",
  },
};

/**
 * Armour Categories with descriptions
 */
export const armourCategories = {
  soft_leather: {
    name: "Soft Leather",
    description: "Light, flexible leather armor that can be worn under other armor without penalty",
    ap: 1,
  },
  boiled_leather: {
    name: "Boiled Leather",
    description: "Hardened leather armor that provides better protection than soft leather",
    ap: 2,
  },
  mail: {
    name: "Mail",
    description: "Interlocking metal rings providing flexible protection at a cost of mobility",
    ap: 2,
  },
  plate: {
    name: "Plate",
    description: "Rigid metal plates providing superior protection but at significant encumbrance",
    ap: 2,
  },
};
