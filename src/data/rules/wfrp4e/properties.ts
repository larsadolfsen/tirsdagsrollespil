import type { PropertyDefinition } from "../../../types";
import type { WeaponPropertyDefinition } from "./weaponTypes";

export const weaponQualityDefinitions: WeaponPropertyDefinition[] = [
  {
    id: "accurate",
    name: "Accurate",
    kind: "quality",
    valueType: "none",
    description: "Gain a +10 bonus to any Test when firing this weapon.",
  },
  {
    id: "blackpowder",
    name: "Blackpowder",
    kind: "quality",
    valueType: "none",
    description:
      "If you are targeted by this weapon, you must pass an Average (+20) Cool Test or gain a Broken Condition, even if the shot misses.",
  },
  {
    id: "blast",
    name: "Blast",
    kind: "quality",
    valueType: "number",
    description:
      "All Characters within the listed number of yards of the struck target point take SL + Weapon Damage and suffer any Conditions the weapon inflicts.",
  },
  {
    id: "damaging",
    name: "Damaging",
    kind: "quality",
    valueType: "none",
    description:
      "On a successful hit, use the higher of the attack roll's units die or the SL to determine Damage. An Undamaging weapon can never also be Damaging.",
  },
  {
    id: "defensive",
    name: "Defensive",
    kind: "quality",
    valueType: "none",
    description:
      "If you are wielding this weapon, gain +1 SL to any Melee Test when you oppose an incoming attack.",
  },
  {
    id: "distract",
    name: "Distract",
    kind: "quality",
    valueType: "none",
    description:
      "Instead of causing Damage, a successful attack with this weapon can force the opponent back 1 yard per SL by which you win the Opposed Test.",
  },
  {
    id: "entangle",
    name: "Entangle",
    kind: "quality",
    valueType: "none",
    description:
      "Any opponent successfully hit by this weapon gains the Entangled Condition with a Strength value equal to your Strength Characteristic. While entangling an opponent, you cannot otherwise use the weapon to hit. You can end the entangling whenever you wish.",
  },
  {
    id: "fast",
    name: "Fast",
    kind: "quality",
    valueType: "none",
    description:
      "The wielder can choose to attack with this weapon outside the normal Initiative sequence, striking first, last, or in between. Melee Tests defending against this weapon suffer -10 if the defender uses a weapon without Fast. Two Fast weapons fight in Initiative order relative to each other. A Fast weapon may never also be Slow.",
  },
  {
    id: "hack",
    name: "Hack",
    kind: "quality",
    valueType: "none",
    description:
      "If you hit an opponent, damage a struck piece of armour or shield by 1 point as well as wounding the target.",
  },
  {
    id: "impact",
    name: "Impact",
    kind: "quality",
    valueType: "none",
    description:
      "On a successful hit, add the result of the units die of the attack roll to any Damage caused. An Undamaging weapon can never also have Impact.",
  },
  {
    id: "impale",
    name: "Impale",
    kind: "quality",
    valueType: "none",
    description:
      "Cause a Critical Hit on any number divisible by 10 and on doubles rolled equal to or under the appropriate combat Test. If this comes from a ranged weapon, lodged arrows and bolts require a successful Challenging (+0) Heal Test to remove, bullets require a surgeon, and the target cannot heal 1 Wound for each unremoved arrow or bullet.",
  },
  {
    id: "penetrating",
    name: "Penetrating",
    kind: "quality",
    valueType: "none",
    description: "Ignore all non-metal Armour Points, and ignore the first point of all other armour.",
  },
  {
    id: "pistol",
    name: "Pistol",
    kind: "quality",
    valueType: "none",
    description: "You can use this weapon to attack in Close Combat.",
  },
  {
    id: "precise",
    name: "Precise",
    kind: "quality",
    valueType: "none",
    description: "Gain +1 SL to any successful Test when attacking with this weapon.",
  },
  {
    id: "pummel",
    name: "Pummel",
    kind: "quality",
    valueType: "none",
    description:
      "If you score a Head hit with this weapon, attempt an Opposed Strength/Endurance Test against the struck opponent. If you win, the opponent gains a Stunned Condition.",
  },
  {
    id: "repeater",
    name: "Repeater",
    kind: "quality",
    valueType: "number",
    description:
      "This weapon holds the listed number of shots and automatically reloads after each shot. Once all shots are used, it must be fully reloaded using the normal rules.",
  },
  {
    id: "shield",
    name: "Shield",
    kind: "quality",
    valueType: "number",
    description:
      "If you use this weapon to oppose an incoming attack, you count as having the listed number of Armour Points on all body locations. If the rating is 2 or higher, you may also oppose incoming missile shots in your Line of Sight.",
  },
  {
    id: "slow",
    name: "Slow",
    kind: "quality",
    valueType: "none",
    description:
      "You always strike last in the Round regardless of Initiative order. Opponents also gain +1 SL to any Test made to defend against your attacks.",
  },
  {
    id: "trap_blade",
    name: "Trap Blade",
    kind: "quality",
    valueType: "none",
    description:
      "If you score a Critical when defending against an attack from a bladed weapon, you may trap it instead of causing a Critical Hit. Make an Opposed Strength Test and add your SL from the previous Melee Test. If you succeed, the opponent drops the blade. If you score an Astounding Success, the trapped blade also breaks unless it has Unbreakable. If you fail, the opponent frees the blade and continues normally.",
  },
  {
    id: "unbreakable",
    name: "Unbreakable",
    kind: "quality",
    valueType: "none",
    description: "Under almost all circumstances, this weapon will not break, corrode, or lose its edge.",
  },
  {
    id: "undamaging",
    name: "Undamaging",
    kind: "quality",
    valueType: "none",
    description:
      "All Armour Points are doubled against this weapon. In addition, a successful hit in combat does not automatically inflict a minimum of 1 Wound.",
  },
  {
    id: "wrap",
    name: "Wrap",
    kind: "quality",
    valueType: "none",
    description: "Melee Tests opposing an attack from this weapon suffer -1 SL.",
  },
];

export const weaponFlawDefinitions: WeaponPropertyDefinition[] = [
  {
    id: "imprecise",
    name: "Imprecise",
    kind: "flaw",
    valueType: "none",
    description: "Suffer -1 SL when using this weapon to attack. An Imprecise weapon can never be Precise.",
  },
  {
    id: "reload",
    name: "Reload",
    kind: "flaw",
    valueType: "number",
    description:
      "An unloaded weapon with this flaw requires an Extended Ranged Test for the appropriate Weapon Group, scoring the listed number of SL to reload. If reloading is interrupted, you must start again from scratch.",
  },
  {
    id: "tiring",
    name: "Tiring",
    kind: "flaw",
    valueType: "none",
    description:
      "You only gain the benefit of the Impact and Damaging Weapon Traits on a Turn in which you Charge.",
  },
];

const actionPropertyDefinitions: PropertyDefinition[] = [
  {
    id: "defensive_stance",
    name: "Defensive Stance",
    description:
      "A tactical posture where you focus entirely on survival, sacrificing offensive capability for superior protection.",
  },
  {
    id: "mislead",
    name: "Mislead",
    description:
      "A clever maneuver designed to trick your opponent into exposing a weakness in their defense.",
  },
  {
    id: "retreat",
    name: "Retreat",
    description:
      "Carefully backing away from an engagement while maintaining a defensive posture to avoid a parting blow.",
  },
  {
    id: "stun",
    name: "Stun",
    description: "A maneuver focusing on overwhelming the opponent's senses with a heavy or specific blow.",
  },
  {
    id: "spellcasting",
    name: "Spellcasting",
    description:
      "This action is tied to spell use and magical focus rather than a conventional weapon trait.",
  },
];

export const propertyDefinitions: PropertyDefinition[] = [
  ...weaponQualityDefinitions,
  ...weaponFlawDefinitions,
  ...actionPropertyDefinitions,
];
