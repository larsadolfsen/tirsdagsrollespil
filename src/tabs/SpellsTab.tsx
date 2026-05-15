import { InlineSubtabs } from "../components/ui";
import {
  SheetDataDesktopCell,
  SheetDataDisclosureChevron,
  SheetDataHeader,
  SheetDataInfoButton,
  SheetDataList,
  SheetDataListRow,
  SheetDataMobileDetails,
  SheetDataPanel,
} from "../components/wfrp";
import type { ResolvedCharacterSkill, ResolvedCharacterSpell } from "../data/characters/resolved";
import type { Characteristic } from "../types";
import type { SpellSubtab } from "./tabTypes";

type RollOptions = {
  testType?: "dramatic" | "attack" | "channeling";
  title?: string | null;
};

type FormattedSpellFields = {
  range: string;
  target: string;
  duration: string;
};

export function SpellsTab({
  spellSubtabOptions,
  activeSpellSubtab,
  setActiveSpellSubtab,
  filteredSpells,
  attributes,
  characterSkills,
  formatSpellRange,
  formatSpellTarget,
  formatSpellDuration,
  handleRoll,
  openSpellInfo,
  openSpellShop,
}: {
  spellSubtabOptions: Array<{ id: SpellSubtab; label: string }>;
  activeSpellSubtab: SpellSubtab;
  setActiveSpellSubtab: (subtab: SpellSubtab) => void;
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
  openSpellShop: () => void;
}) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <InlineSubtabs
        options={spellSubtabOptions}
        activeId={activeSpellSubtab}
        onChange={setActiveSpellSubtab}
        trailingContent={
          <button
            type="button"
            onClick={openSpellShop}
            className="wfrp-standard-btn h-7 gap-1.5 px-3 font-black tracking-[0.12em] max-md:hidden"
            aria-label="Add spells"
          >
            <span className="whitespace-nowrap">Add Spells</span>
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto p-2 space-y-1 max-md:px-0">
        <SheetDataPanel className="overflow-x-hidden border-x-0 border-y-0 shadow-none md:wfrp-subpanel md:overflow-x-auto md:shadow-sm">
          <SheetDataHeader className="hidden min-w-[640px] grid-cols-[72px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px] gap-2 px-4 py-1 lg:gap-4 md:grid">
            <span className="wfrp-table-label text-center">Channel</span>
            <span className="wfrp-table-label text-left">Spell</span>
            <span className="wfrp-table-label text-center">CN</span>
            <span className="wfrp-table-label text-left">Range</span>
            <span className="wfrp-table-label text-left">Target</span>
            <span className="wfrp-table-label text-left">Duration</span>
          </SheetDataHeader>

          <SheetDataList>
            {filteredSpells.map((spell) => {
              const baseWP = attributes.WP || 0;
              const chnSkill = characterSkills.find((skill) => skill.baseName === "Channelling");
              const skillValue = chnSkill ? baseWP + chnSkill.advances : baseWP;
              const spellRange = formatSpellRange(spell.range);
              const spellTarget = formatSpellTarget(spell.target);
              const spellDuration = formatSpellDuration(spell.duration);
              const mobileDetails = [
                { label: "CN", value: spell.cn, valueClassName: "font-mono" },
                { label: "Range", value: spellRange },
                { label: "Target", value: spellTarget },
                { label: "Duration", value: spellDuration },
              ];
              const openCurrentSpellInfo = () => {
                openSpellInfo(spell, {
                  range: spellRange,
                  target: spellTarget,
                  duration: spellDuration,
                });
              };

              return (
                <SheetDataListRow
                  key={spell.name}
                  className="md:grid md:min-w-[640px] md:grid-cols-[72px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px] md:gap-2 md:px-4 md:py-2 lg:gap-4"
                >
                  <details className="group/details md:contents">
                    <summary className="grid min-h-11 cursor-pointer list-none grid-cols-[40px_minmax(0,1fr)_auto_auto] items-center gap-2 md:contents [&::-webkit-details-marker]:hidden">
                      <div className="flex justify-center">
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            handleRoll({ key: "WP", label: spell.name }, undefined, { testType: "channeling" });
                          }}
                          className="wfrp-roll-btn"
                          aria-label={`Channel ${spell.name}`}
                        >
                          {skillValue}
                        </button>
                      </div>

                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          openCurrentSpellInfo();
                        }}
                        className="wfrp-skill-link min-w-0 truncate text-left"
                      >
                        {spell.name}
                      </button>

                      <SheetDataInfoButton
                        onClick={(event) => {
                          event.preventDefault();
                          openCurrentSpellInfo();
                        }}
                        aria-label={`Show ${spell.name} details`}
                      />

                      <SheetDataDisclosureChevron />

                      <SheetDataDesktopCell align="center">{spell.cn}</SheetDataDesktopCell>
                      <SheetDataDesktopCell truncate>{spellRange}</SheetDataDesktopCell>
                      <SheetDataDesktopCell truncate>{spellTarget}</SheetDataDesktopCell>
                      <SheetDataDesktopCell>{spellDuration}</SheetDataDesktopCell>
                    </summary>

                    <SheetDataMobileDetails fields={mobileDetails} />
                  </details>
                </SheetDataListRow>
              );
            })}
          </SheetDataList>
        </SheetDataPanel>
      </div>
    </div>
  );
}
