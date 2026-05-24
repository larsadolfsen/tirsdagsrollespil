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
  rollLabel: string;
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
  isPrayerMode = false,
  setIsSpellShopOpen,
  spells,
}: {
  activeSpellSubtab: SpellSubtab;
  attributes: Record<string, number>;
  characterSkills: ResolvedCharacterSkill[];
  formatSpellDuration: (duration: string) => string;
  formatSpellRange: (range: string) => string;
  formatSpellTarget: (target: string) => string;
  isPrayerMode?: boolean;
  setIsSpellShopOpen: Dispatch<SetStateAction<boolean>>;
  spells: ResolvedCharacterRecord["spells"];
}) {
  const spellSubtabOptions = getSpellSubtabOptions(spells, isPrayerMode);
  const baseWp = attributes.WP || 0;
  const castingSkill = characterSkills.find((skill) =>
    isPrayerMode ? skill.baseName === "Pray" : skill.baseName === "Channelling",
  );
  const channelValue = castingSkill ? baseWp + castingSkill.advances : baseWp;
  const rollLabel = castingSkill?.displayName ?? (isPrayerMode ? "Pray" : "Channelling");

  const spellRows: SpellListRow[] = filterSpellsBySubtab(spells, activeSpellSubtab, isPrayerMode)
    .sort((first, second) =>
      first.name.localeCompare(second.name, undefined, {
        sensitivity: "base",
      }),
    )
    .map((spell) => {
      const formatted = {
        range: formatSpellRange(spell.range),
        target: formatSpellTarget(spell.target),
        duration: formatSpellDuration(spell.duration),
      };

      return {
        spell,
        channelValue,
        rollLabel,
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
