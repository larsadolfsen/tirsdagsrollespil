import { InlineSubtabs } from "../components/ui";
import {
  SheetDataDesktopCell,
  SheetDataDisclosureChevron,
  SheetDataHeader,
  SheetDataInfoButton,
  SheetDataList,
  SheetDataPanel,
  SheetDataResponsiveListRow,
} from "../components/wfrp";
import type { ResolvedCharacterSpell } from "../data/characters/resolved";
import type { SpellListRow } from "./spells/useSpellsViewModel";
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
  spellRows,
  handleRoll,
  openSpellInfo,
  openSpellShop,
}: {
  spellSubtabOptions: Array<{ id: SpellSubtab; label: string }>;
  activeSpellSubtab: SpellSubtab;
  setActiveSpellSubtab: (subtab: SpellSubtab) => void;
  spellRows: SpellListRow[];
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
            {spellRows.map(({ channelValue, formatted, mobileDetails, spell }) => {
              const openCurrentSpellInfo = () => {
                openSpellInfo(spell, formatted);
              };

              return (
                <SheetDataResponsiveListRow
                  key={spell.name}
                  className="md:min-w-[640px] md:px-4 md:py-2"
                  summaryClassName="grid-cols-[40px_minmax(0,1fr)_auto_auto]"
                  mobileSummary={(
                    <>
                      <div className="flex justify-center">
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            handleRoll({ key: "WP", label: spell.name }, undefined, { testType: "channeling" });
                          }}
                          className="wfrp-roll-btn"
                          aria-label={`Channel ${spell.name}`}
                        >
                          {channelValue}
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
                    </>
                  )}
                  mobileDetails={mobileDetails}
                  desktopClassName="grid-cols-[72px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px] gap-2 lg:gap-4"
                  desktopContent={(
                    <>
                      <div className="flex justify-center">
                        <button
                          onClick={(event) => {
                            event.preventDefault();
                            handleRoll({ key: "WP", label: spell.name }, undefined, { testType: "channeling" });
                          }}
                          className="wfrp-roll-btn"
                          aria-label={`Channel ${spell.name}`}
                        >
                          {channelValue}
                        </button>
                      </div>

                      <button
                        onClick={openCurrentSpellInfo}
                        className="wfrp-skill-link min-w-0 truncate text-left"
                      >
                        {spell.name}
                      </button>

                      <SheetDataDesktopCell align="center">{spell.cn}</SheetDataDesktopCell>
                      <SheetDataDesktopCell truncate>{formatted.range}</SheetDataDesktopCell>
                      <SheetDataDesktopCell truncate>{formatted.target}</SheetDataDesktopCell>
                      <SheetDataDesktopCell>{formatted.duration}</SheetDataDesktopCell>
                    </>
                  )}
                />
              );
            })}
          </SheetDataList>
        </SheetDataPanel>
      </div>
    </div>
  );
}
