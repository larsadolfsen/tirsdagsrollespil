import type { CharacteristicKey } from "../types/rules";

// Canonical characteristic codes (from creatureTraits' CharacteristicKey).
const CANONICAL = new Set<CharacteristicKey>([
  "WS",
  "BS",
  "S",
  "T",
  "I",
  "Ag",
  "Dex",
  "Int",
  "WP",
  "Fel",
]);

// Legacy attribute names used by existing talent `attribute_bonus` effects, mapped
// to the canonical key. "movement" is intentionally absent — it is a derived stat,
// not a characteristic.
const LEGACY_ATTRIBUTE_TO_KEY: Record<string, CharacteristicKey> = {
  weaponSkill: "WS",
  ballisticSkill: "BS",
  strength: "S",
  toughness: "T",
  initiative: "I",
  agility: "Ag",
  dexterity: "Dex",
  intelligence: "Int",
  willpower: "WP",
  fellowship: "Fel",
};

/** Accepts a canonical key or a legacy attribute name; returns the key or undefined. */
export function toCharacteristicKey(name: string): CharacteristicKey | undefined {
  if (CANONICAL.has(name as CharacteristicKey)) {
    return name as CharacteristicKey;
  }
  return LEGACY_ATTRIBUTE_TO_KEY[name];
}
