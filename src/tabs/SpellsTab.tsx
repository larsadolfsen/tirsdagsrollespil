import { ChevronDown } from "lucide-react";
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
        <div className="wfrp-subpanel flex flex-col overflow-x-hidden shadow-sm md:overflow-x-auto">
          <div className="hidden min-w-[640px] grid-cols-[72px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px] gap-2 lg:gap-4 px-4 py-1 bg-black/10 border-b border-white/5 items-center md:grid">
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
              const openCurrentSpellInfo = () => {
                openSpellInfo(spell, {
                  range: spellRange,
                  target: spellTarget,
                  duration: spellDuration,
                });
              };

              return (
                <div key={spell.name} className="wfrp-table-row md:grid md:min-w-[640px] md:grid-cols-[72px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px] md:gap-2 lg:gap-4 md:px-4 md:py-2 md:items-center">
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

                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          openCurrentSpellInfo();
                        }}
                        className="min-h-8 rounded border border-white/10 px-2 text-[10px] font-black uppercase tracking-wider text-gray-300 hover:border-wfrp-gold/40 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 md:hidden"
                        aria-label={`Show ${spell.name} details`}
                      >
                        Info
                      </button>

                      <ChevronDown
                        size={14}
                        className="text-gray-500 transition-transform group-open/details:rotate-180 md:hidden"
                        aria-hidden="true"
                      />

                      <div className="hidden wfrp-list-cell-strong text-center md:block">
                        {spell.cn}
                      </div>

                      <div className="hidden wfrp-list-cell-strong truncate md:block">
                        {spellRange}
                      </div>

                      <div className="hidden wfrp-list-cell-strong truncate md:block">
                        {spellTarget}
                      </div>

                      <div className="hidden wfrp-list-cell-strong md:block">
                        {spellDuration}
                      </div>
                    </summary>

                    <div className="mt-2 grid grid-cols-2 gap-2 rounded border border-white/5 bg-black/20 p-2 md:hidden">
                      <div>
                        <div className="wfrp-table-label">CN</div>
                        <div className="wfrp-list-cell-strong font-mono">{spell.cn}</div>
                      </div>
                      <div>
                        <div className="wfrp-table-label">Range</div>
                        <div className="wfrp-list-cell-strong">{spellRange}</div>
                      </div>
                      <div>
                        <div className="wfrp-table-label">Target</div>
                        <div className="wfrp-list-cell-strong">{spellTarget}</div>
                      </div>
                      <div>
                        <div className="wfrp-table-label">Duration</div>
                        <div className="wfrp-list-cell-strong">{spellDuration}</div>
                      </div>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
