import type { SpellSubtab } from "../tabTypes";

type SpellListItem = {
  category: "petty" | "arcane" | "school";
  school?: string;
};

export type SpellSubtabOption = {
  id: SpellSubtab;
  label: string;
};

export const formatSpellSchoolLabel = (school: string) => {
  const normalizedSchool = school
    .replace(/^the\s+lore\s+of\s+/i, "")
    .replace(/^lore\s+of\s+/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const titledSchool = normalizedSchool
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  return `The Lore of ${titledSchool}`;
};

export const formatSpellSchoolShortLabel = (school: string) =>
  formatSpellSchoolLabel(school).replace(/^The Lore of\s+/i, "");

export const isPrayerDefinition = (spell: SpellListItem) =>
  spell.category === "school" && Boolean(spell.school?.match(/-(prayer|miracle)$/i));

export const filterSpellDefinitionsForMode = <TSpell extends SpellListItem>(
  spells: TSpell[],
  isPrayerMode: boolean,
) => spells.filter((spell) => (isPrayerMode ? isPrayerDefinition(spell) : !isPrayerDefinition(spell)));

export const formatPrayerSchoolLabel = (school: string) => {
  if (school.endsWith("-prayer")) {
    return "Blessings";
  }

  if (school.endsWith("-miracle")) {
    return "Miracles";
  }

  return formatSpellSchoolShortLabel(school);
};

export function formatSpellRange(range: string, willpower: number, willpowerBonus: number) {
  return range
    .replace(/Willpower Bonus/gi, `${willpowerBonus}`)
    .replace(/Willpower/gi, `${willpower}`)
    .replace(/\byards\b/gi, "yd")
    .replace(/\byard\b/gi, "yd")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatSpellTarget(target: string, willpower: number, willpowerBonus: number) {
  return target
    .replace(/Willpower Bonus/gi, `${willpowerBonus}`)
    .replace(/Willpower/gi, `${willpower}`)
    .replace(/\(\s*(\d+)\s+yards\s*\)/gi, "($1 yd)")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatSpellDuration(duration: string, willpower: number, willpowerBonus: number) {
  return duration
    .replace(/Willpower Bonus/gi, `${willpowerBonus}`)
    .replace(/Willpower/gi, `${willpower}`)
    .replace(/\s+/g, " ")
    .trim();
}

export function getSpellSchoolOptions<TSpell extends SpellListItem>(spells: TSpell[]) {
  return [...new Set<string>(
    spells
      .filter((spell) => spell.category === "school" && spell.school)
      .map((spell) => spell.school as string),
  )].sort((first, second) =>
    formatSpellSchoolLabel(first).localeCompare(formatSpellSchoolLabel(second), undefined, {
      sensitivity: "base",
    }),
  );
}

export function getSpellSubtabOptions<TSpell extends SpellListItem>(
  spells: TSpell[],
  isPrayerMode = false,
): SpellSubtabOption[] {
  if (isPrayerMode) {
    return [
      { id: "all", label: "All" },
      ...getSpellSchoolOptions(spells).map((school) => ({
        id: `school:${school}` as SpellSubtab,
        label: formatPrayerSchoolLabel(school),
      })),
    ];
  }

  return [
    { id: "all", label: "All" },
    { id: "petty", label: "Petty" },
    { id: "arcane", label: "Arcane" },
    ...getSpellSchoolOptions(spells).map((school) => ({
      id: `school:${school}` as SpellSubtab,
      label: formatSpellSchoolLabel(school),
    })),
  ];
}

export function filterSpellsBySubtab<TSpell extends SpellListItem>(
  spells: TSpell[],
  activeSpellSubtab: SpellSubtab,
  isPrayerMode = false,
) {
  return spells.filter((spell) => {
    if (activeSpellSubtab === "all") {
      return true;
    }

    if (!isPrayerMode && (activeSpellSubtab === "petty" || activeSpellSubtab === "arcane")) {
      return spell.category === activeSpellSubtab;
    }

    return spell.category === "school" && spell.school === activeSpellSubtab.replace(/^school:/, "");
  });
}
