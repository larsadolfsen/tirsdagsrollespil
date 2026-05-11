import { InlineSubtabs } from "../components/ui";
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
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        <div className="wfrp-subpanel flex flex-col overflow-x-auto shadow-sm">
          <div className="grid min-w-[640px] grid-cols-[72px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px] gap-2 lg:gap-4 px-4 py-1 bg-black/10 border-b border-white/5 items-center">
            <span className="wfrp-table-label text-center">Channel</span>
            <span className="wfrp-table-label text-left">Spell</span>
            <span className="wfrp-table-label text-center">CN</span>
            <span className="wfrp-table-label text-left">Range</span>
            <span className="wfrp-table-label text-left">Target</span>
            <span className="wfrp-table-label text-left">Duration</span>
          </div>

          <div className="flex flex-col divide-y divide-white/5">
            {filteredSpells.map((spell) => {
              const baseWP = attributes.WP || 0;
              const chnSkill = characterSkills.find((skill) => skill.baseName === "Channelling");
              const skillValue = chnSkill ? baseWP + chnSkill.advances : baseWP;
              const spellRange = formatSpellRange(spell.range);
              const spellTarget = formatSpellTarget(spell.target);
              const spellDuration = formatSpellDuration(spell.duration);

              return (
                <div
                  key={spell.name}
                  className="grid min-w-[640px] grid-cols-[72px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px] gap-2 lg:gap-4 px-4 py-2 items-center"
                >
                  <div className="flex justify-center">
                    <button
                      onClick={() => {
                        handleRoll({ key: "WP", label: spell.name }, undefined, { testType: "channeling" });
                      }}
                      className="wfrp-roll-btn"
                      aria-label={`Channel ${spell.name}`}
                    >
                      {skillValue}
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      openSpellInfo(spell, {
                        range: spellRange,
                        target: spellTarget,
                        duration: spellDuration,
                      });
                    }}
                    className="wfrp-skill-link truncate text-left"
                  >
                    {spell.name}
                  </button>

                  <div className="wfrp-list-cell-strong text-center">
                    {spell.cn}
                  </div>

                  <div className="wfrp-list-cell-strong truncate">
                    {spellRange}
                  </div>

                  <div className="wfrp-list-cell-strong truncate">
                    {spellTarget}
                  </div>

                  <div className="wfrp-list-cell-strong">
                    {spellDuration}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
