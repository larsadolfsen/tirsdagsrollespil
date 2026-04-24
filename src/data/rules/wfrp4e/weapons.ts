import type {
  MeleeWeaponDefinition,
  MeleeWeaponGroup,
  RangedWeaponDefinition,
  RangedWeaponGroup,
  WeaponDefinition,
} from "../../../types";

type WeaponGroupMetadata<TGroup extends string> = {
  id: TGroup;
  label: string;
};

export const meleeWeaponGroups: WeaponGroupMetadata<MeleeWeaponGroup>[] = [
  { id: "basic", label: "Basic" },
  { id: "brawling", label: "Brawling" },
  { id: "cavalry", label: "Cavalry" },
  { id: "fencing", label: "Fencing" },
  { id: "flail", label: "Flail" },
  { id: "parry", label: "Parry" },
  { id: "polearm", label: "Polearm" },
  { id: "two_handed", label: "Two-Handed" },
];

export const rangedWeaponGroups: WeaponGroupMetadata<RangedWeaponGroup>[] = [
  { id: "blackpowder", label: "Blackpowder" },
  { id: "bow", label: "Bow" },
  { id: "crossbow", label: "Crossbow" },
  { id: "engineering", label: "Engineering" },
  { id: "entangling", label: "Entangling" },
  { id: "explosives", label: "Explosives" },
  { id: "sling", label: "Sling" },
  { id: "throwing", label: "Throwing" },
];

export const weaponDefinitions: WeaponDefinition[] = [
  {
    id: "halberd",
    name: "Halberd",
    type: "melee_weapon",
    groupType: "melee",
    group: "polearm",
    description: "A versatile polearm combining an axe blade with a thrusting spike.",
    price: { value: 2, currency: "gc" },
    encumbrance: 3,
    availability: "common",
    damage: "+SB+4",
    reach: "Long",
    hands: 2,
    qualities: ["defensive", "hack", "impale"],
    flaws: [],
    specialRules: ["Keeps Polearm engagement rules."],
  },
  {
    id: "sword",
    name: "Sword",
    type: "melee_weapon",
    groupType: "melee",
    group: "basic",
    description: "A standard one-handed arming sword.",
    price: { value: 1, currency: "gc" },
    encumbrance: 1,
    availability: "common",
    damage: "+SB+4",
    reach: "Average",
    hands: 1,
    qualities: [],
    flaws: [],
    specialRules: [],
  },
  {
    id: "dagger",
    name: "Dagger",
    type: "melee_weapon",
    groupType: "melee",
    group: "basic",
    description: "A short blade suited to close-quarters fighting.",
    price: { value: 16, currency: "s" },
    encumbrance: 0,
    availability: "common",
    damage: "+SB+2",
    reach: "Very Short",
    hands: 1,
    qualities: [],
    flaws: [],
    specialRules: [],
  },
  {
    id: "crossbow",
    name: "Crossbow",
    type: "ranged_weapon",
    groupType: "ranged",
    group: "crossbow",
    description: "A mechanical bow that fires heavy bolts with force.",
    price: { value: 1, currency: "gc" },
    encumbrance: 2,
    availability: "common",
    damage: "9",
    range: "60",
    hands: 2,
    qualities: ["impale", "penetrating"],
    flaws: ["reload_5"],
    specialRules: ["Can be used untrained with Ballistic Skill but loses qualities."],
  },
];

export function getWeaponDisplayName(weapon: WeaponDefinition) {
  return weapon.name;
}

export function getWeaponGroupLabel(weapon: WeaponDefinition) {
  const groups = weapon.groupType === "melee" ? meleeWeaponGroups : rangedWeaponGroups;
  return groups.find((entry) => entry.id === weapon.group)?.label ?? weapon.group;
}

export function getRequiredSkillDisplayName(weapon: WeaponDefinition) {
  return `${weapon.groupType === "melee" ? "Melee" : "Ranged"} (${getWeaponGroupLabel(weapon)})`;
}

export function canUseWeaponWithSkill(weapon: WeaponDefinition, skillDisplayName: string) {
  return skillDisplayName === getRequiredSkillDisplayName(weapon);
}

export function buildResolvedWeaponOptions(weapons: WeaponDefinition[]) {
  return weapons.map((weapon) => ({
    id: weapon.id,
    name: getWeaponDisplayName(weapon),
    group: weapon.group,
    groupLabel: getWeaponGroupLabel(weapon),
    requiredSkillDisplayName: getRequiredSkillDisplayName(weapon),
  }));
}

