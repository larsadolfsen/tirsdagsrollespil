import type { Dispatch, SetStateAction } from "react";
import type { ResolvedCharacterRecord, ResolvedCharacterSkill, ResolvedCharacterSpell } from "../../data/characters/resolved";
import type { SpellSubtab } from "../tabTypes";
import { filterSpellsBySubtab, getSpellSubtabOptions } from "./spellUtils";

type FormattedSpellFields = {
  range: string;
  target: string;
  duration: string;
};

export type SpellListRow = {
  spell: ResolvedCharacterSpell;
  channelValue: number;
  formatted: FormattedSpellFields;
  mobileDetails: Array<{ label: string; value: string | number; valueClassName?: string }>;
};

export function useSpellsViewModel({
  activeSpellSubtab,
  attributes,
  characterSkills,
  formatSpellDuration,
  formatSpellRange,
  formatSpellTarget,
  setIsSpellShopOpen,
  spells,
}: {
  activeSpellSubtab: SpellSubtab;
  attributes: Record<string, number>;
  characterSkills: ResolvedCharacterSkill[];
  formatSpellDuration: (duration: string) => string;
  formatSpellRange: (range: string) => string;
  formatSpellTarget: (target: string) => string;
  setIsSpellShopOpen: Dispatch<SetStateAction<boolean>>;
  spells: ResolvedCharacterRecord["spells"];
}) {
  const spellSubtabOptions = getSpellSubtabOptions(spells);
  const baseWp = attributes.WP || 0;
  const channellingSkill = characterSkills.find((skill) => skill.baseName === "Channelling");
  const channelValue = channellingSkill ? baseWp + channellingSkill.advances : baseWp;

  const spellRows: SpellListRow[] = filterSpellsBySubtab(spells, activeSpellSubtab).map((spell) => {
    const formatted = {
      range: formatSpellRange(spell.range),
      target: formatSpellTarget(spell.target),
      duration: formatSpellDuration(spell.duration),
    };

    return {
      spell,
      channelValue,
      formatted,
      mobileDetails: [
        { label: "CN", value: spell.cn, valueClassName: "font-mono" },
        { label: "Range", value: formatted.range },
        { label: "Target", value: formatted.target },
        { label: "Duration", value: formatted.duration },
      ],
    };
  });

  const openSpellShop = () => setIsSpellShopOpen(true);

  return {
    openSpellShop,
    spellRows,
    spellSubtabOptions,
  };
}
