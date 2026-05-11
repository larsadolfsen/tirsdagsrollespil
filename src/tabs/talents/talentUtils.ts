import type { ResolvedCharacterTalent } from "../../data/characters/resolved";

const characteristicKeyByTalentMaxName: Record<string, string> = {
  "Weapon Skill": "WS",
  "Ballistic Skill": "BS",
  Strength: "S",
  Toughness: "T",
  Initiative: "I",
  Agility: "Ag",
  Dexterity: "Dex",
  Intelligence: "Int",
  Willpower: "WP",
  Fellowship: "Fel",
};

export function getTalentMaxDisplay(max: string, attributes: Record<string, number>) {
  const numericMax = Number.parseInt(max, 10);

  if (Number.isFinite(numericMax) && `${numericMax}` === max.trim()) {
    return numericMax;
  }

  const bonusMatch = max.match(/^(.+?)\s+Bonus$/i);
  if (!bonusMatch) {
    return max;
  }

  const characteristicKey = characteristicKeyByTalentMaxName[bonusMatch[1]];
  if (!characteristicKey) {
    return max;
  }

  return Math.floor((attributes[characteristicKey] ?? 0) / 10);
}

export function getCharacterTalentRows(characterTalents: ResolvedCharacterTalent[]) {
  return Array.from<{ talent: ResolvedCharacterTalent; count: number }>(
    characterTalents
      .reduce<Map<string, { talent: ResolvedCharacterTalent; count: number }>>((rows, talent) => {
        const current = rows.get(talent.name);

        if (current) {
          current.count += 1;
          return rows;
        }

        rows.set(talent.name, { talent, count: 1 });
        return rows;
      }, new Map())
      .values(),
  ).sort((a, b) => a.talent.name.localeCompare(b.talent.name));
}
