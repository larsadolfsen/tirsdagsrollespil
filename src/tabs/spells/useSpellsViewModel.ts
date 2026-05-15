import type { Dispatch, SetStateAction } from "react";
import type { ActiveInfoState } from "../../components/appTypes";
import type { ResolvedCharacterRecord, ResolvedCharacterSpell } from "../../data/characters/resolved";
import type { RollState } from "../../types/dice";
import type { SpellSubtab } from "../tabTypes";
import { filterSpellsBySubtab, getSpellSubtabOptions } from "./spellUtils";

type FormattedSpellFields = {
  range: string;
  target: string;
  duration: string;
};

export function useSpellsViewModel({
  spells,
  activeSpellSubtab,
  setActiveInfo,
  setIsSpellShopOpen,
  setRollState,
}: {
  spells: ResolvedCharacterRecord["spells"];
  activeSpellSubtab: SpellSubtab;
  setActiveInfo: Dispatch<SetStateAction<ActiveInfoState | null>>;
  setIsSpellShopOpen: Dispatch<SetStateAction<boolean>>;
  setRollState: Dispatch<SetStateAction<RollState>>;
}) {
  const spellSubtabOptions = getSpellSubtabOptions(spells);
  const filteredSpells = filterSpellsBySubtab(spells, activeSpellSubtab);

  const openSpellInfo = (spell: ResolvedCharacterSpell, formattedSpell: FormattedSpellFields) => {
    setActiveInfo({
      type: "spell",
      name: spell.name,
      extra: { ...spell, ...formattedSpell },
    });
    setRollState((prev) => ({ ...prev, characteristic: null }));
  };

  const openSpellShop = () => setIsSpellShopOpen(true);

  return {
    filteredSpells,
    openSpellInfo,
    openSpellShop,
    spellSubtabOptions,
  };
}
