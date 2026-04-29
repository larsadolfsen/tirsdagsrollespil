import type { ArmourDefinition } from "./armourTypes";

/**
 * Complete WFRP 4e Armour Definitions
 * Organized by category with properties, locations, and penalties accurately defined
 */
export const armourDefinitions: ArmourDefinition[] = [
  // ===== SOFT LEATHER =====
  // Soft Leather can be worn without penalty under any other armour
  {
    id: "leather_jack",
    name: "Leather Jack",
    category: "soft_leather",
    price: "12/-",
    encumbrance: 1,
    availability: "common",
    locations: ["arms", "body"],
    aps: 1,
    penalties: [],
    qualities: [],
    flaws: [],
    notes: ["Soft Leather can be worn without penalty under any other armour."],
  },
  {
    id: "leather_jerkin",
    name: "Leather Jerkin",
    category: "soft_leather",
    price: "10/-",
    encumbrance: 1,
    availability: "common",
    locations: ["body"],
    aps: 1,
    penalties: [],
    qualities: [],
    flaws: [],
    notes: ["Soft Leather can be worn without penalty under any other armour."],
  },
  {
    id: "leather_leggings",
    name: "Leather Leggings",
    category: "soft_leather",
    price: "14/-",
    encumbrance: 1,
    availability: "common",
    locations: ["legs"],
    aps: 1,
    penalties: [],
    qualities: [],
    flaws: [],
    notes: ["Soft Leather can be worn without penalty under any other armour."],
  },
  {
    id: "leather_skullcap",
    name: "Leather Skullcap",
    category: "soft_leather",
    price: "8/-",
    encumbrance: 0,
    availability: "common",
    locations: ["head"],
    aps: 1,
    penalties: [],
    qualities: [],
    flaws: [],
    notes: ["Soft Leather can be worn without penalty under any other armour."],
  },

  // ===== BOILED LEATHER =====
  {
    id: "boiled_leather_breastplate",
    name: "Breastplate",
    category: "boiled_leather",
    price: "18/-",
    encumbrance: 2,
    availability: "scarce",
    locations: ["body"],
    aps: 2,
    penalties: [],
    qualities: [],
    flaws: [{ id: "weakpoints" }],
    notes: [],
  },

  // ===== MAIL =====
  // Mail/Plate stealth penalties are listed as a general note, not a per-piece penalty.
  {
    id: "mail_chausses",
    name: "Mail Chausses",
    category: "mail",
    price: "2GC",
    encumbrance: 3,
    availability: "scarce",
    locations: ["legs"],
    aps: 2,
    penalties: [],
    qualities: [{ id: "flexible" }],
    flaws: [],
    notes: ["Wearing any Mail or Plate confers a penalty of -10 Stealth each."],
  },
  {
    id: "mail_coat",
    name: "Mail Coat",
    category: "mail",
    price: "3GC",
    encumbrance: 3,
    availability: "common",
    locations: ["arms", "body"],
    aps: 2,
    penalties: [],
    qualities: [{ id: "flexible" }],
    flaws: [],
    notes: ["Wearing any Mail or Plate confers a penalty of -10 Stealth each."],
  },
  {
    id: "mail_coif",
    name: "Mail Coif",
    category: "mail",
    price: "1GC",
    encumbrance: 2,
    availability: "scarce",
    locations: ["head"],
    aps: 2,
    penalties: [{ skillId: "perception", value: -10 }],
    qualities: [{ id: "flexible" }, { id: "partial" }],
    flaws: [],
    notes: ["Wearing any Mail or Plate confers a penalty of -10 Stealth each."],
  },
  {
    id: "mail_shirt",
    name: "Mail Shirt",
    category: "mail",
    price: "2GC",
    encumbrance: 2,
    availability: "scarce",
    locations: ["body"],
    aps: 2,
    penalties: [],
    qualities: [{ id: "flexible" }],
    flaws: [],
    notes: ["Wearing any Mail or Plate confers a penalty of -10 Stealth each."],
  },

  // ===== PLATE =====
  {
    id: "plate_breastplate",
    name: "Breastplate",
    category: "plate",
    price: "10GC",
    encumbrance: 3,
    availability: "scarce",
    locations: ["body"],
    aps: 2,
    penalties: [],
    qualities: [{ id: "impenetrable" }],
    flaws: [{ id: "weakpoints" }],
    notes: ["Wearing any Mail or Plate confers a penalty of -10 Stealth each."],
  },
  {
    id: "open_helm",
    name: "Open Helm",
    category: "plate",
    price: "2GC",
    encumbrance: 1,
    availability: "common",
    locations: ["head"],
    aps: 2,
    penalties: [{ skillId: "perception", value: -10 }],
    qualities: [{ id: "partial" }],
    flaws: [],
    notes: ["Wearing any Mail or Plate confers a penalty of -10 Stealth each."],
  },
  {
    id: "bracers",
    name: "Bracers",
    category: "plate",
    price: "8GC",
    encumbrance: 3,
    availability: "rare",
    locations: ["arms"],
    aps: 2,
    penalties: [],
    qualities: [{ id: "impenetrable" }],
    flaws: [{ id: "weakpoints" }],
    notes: ["Wearing any Mail or Plate confers a penalty of -10 Stealth each."],
  },
  {
    id: "plate_leggings",
    name: "Plate Leggings",
    category: "plate",
    price: "10GC",
    encumbrance: 3,
    availability: "rare",
    locations: ["legs"],
    aps: 2,
    penalties: [{ skillId: "stealth", value: -10 }],
    qualities: [{ id: "impenetrable" }],
    flaws: [{ id: "weakpoints" }],
    notes: ["Wearing any Mail or Plate confers a penalty of -10 Stealth each."],
  },
  {
    id: "helm",
    name: "Helm",
    category: "plate",
    price: "3GC",
    encumbrance: 2,
    availability: "rare",
    locations: ["head"],
    aps: 2,
    penalties: [{ skillId: "perception", value: -20 }],
    qualities: [{ id: "impenetrable" }],
    flaws: [{ id: "weakpoints" }],
    notes: ["Wearing any Mail or Plate confers a penalty of -10 Stealth each."],
  },
];

/**
 * Armour Quality Properties
 * These represent special characteristics that affect armor performance
 */
export const armourQualities = {
  flexible: {
    id: "flexible",
    name: "Flexible",
    description:
      "Flexible armour may be worn beneath a layer of non-Flexible armour. When layered this way, the wearer benefits from both pieces.",
  },
  impenetrable: {
    id: "impenetrable",
    name: "Impenetrable",
    description:
      "Impenetrable armour is especially resilient. Critical Wounds caused by odd-numbered hit rolls, such as 11 or 33, are ignored.",
  },
  partial: {
    id: "partial",
    name: "Partial",
    description:
      "Partial armour does not cover the whole hit location. Attacks that roll an even number to hit, or roll a Critical Hit, ignore the partial armour's APs.",
  },
};

/**
 * Armour Flaws
 * These represent weaknesses or limitations of the armour
 */
export const armourFlaws = {
  weakpoints: {
    id: "weakpoints",
    name: "Weakpoints",
    description:
      "Weakpoints leave small gaps where a skilled or lucky blow can slip through. If an opponent has a weapon with the Impale Quality and scores a Critical, the armour's APs are ignored.",
  },
};
