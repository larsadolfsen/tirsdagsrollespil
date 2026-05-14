import { useMemo } from "react";
import type { ResolvedCharacterSkill, ResolvedCharacterSpell } from "../../data/characters/resolved";
import type { Characteristic } from "../../types";

type RollOptions = {
  testType?: "dramatic" | "attack" | "channeling";
  title?: string | null;
};

type FormattedSpellFields = {
  range: string;
  target: string;
  duration: string;
};

export type SpellListRow = {
  spell: ResolvedCharacterSpell;
  skillValue: number;
  formattedFields: FormattedSpellFields;
  mobileDetails: Array<{ label: string; value: string | number; valueClassName?: string }>;
  channel: () => void;
  openInfo: () => void;
};

export function useSpellsViewModel({
  filteredSpells,
  attributes,
  characterSkills,
  formatSpellRange,
  formatSpellTarget,
  formatSpellDuration,
  handleRoll,
  openSpellInfo,
}: {
  filteredSpells: ResolvedCharacterSpell[];
  attributes: Record<string, number>;
  characterSkills: ResolvedCharacterSkill[];
  formatSpellRange: (range: string) => string;
  formatSpellTarget: (target: string) => string;
  formatSpellDuration: (duration: string) => string;
  handleRoll: (
    characteristic: Characteristic,
    damage?: number,
    options?: RollOptions,
  ) => void;
  openSpellInfo: (spell: ResolvedCharacterSpell, formattedSpell: FormattedSpellFields) => void;
}) {
  const spellRows = useMemo<SpellListRow[]>(() => {
    const baseWP = attributes.WP || 0;
    const channellingSkill = characterSkills.find((skill) => skill.baseName === "Channelling");
    const skillValue = channellingSkill ? baseWP + channellingSkill.advances : baseWP;

    return filteredSpells.map((spell) => {
      const formattedFields = {
        range: formatSpellRange(spell.range),
        target: formatSpellTarget(spell.target),
        duration: formatSpellDuration(spell.duration),
      };

      return {
        spell,
        skillValue,
        formattedFields,
        mobileDetails: [
          { label: "CN", value: spell.cn, valueClassName: "font-mono" },
          { label: "Range", value: formattedFields.range },
          { label: "Target", value: formattedFields.target },
          { label: "Duration", value: formattedFields.duration },
        ],
        channel: () => handleRoll({ key: "WP", label: spell.name }, undefined, { testType: "channeling" }),
        openInfo: () => openSpellInfo(spell, formattedFields),
      };
    });
  }, [
    attributes.WP,
    characterSkills,
    filteredSpells,
    formatSpellDuration,
    formatSpellRange,
    formatSpellTarget,
    handleRoll,
    openSpellInfo,
  ]);

  return { spellRows };
}
