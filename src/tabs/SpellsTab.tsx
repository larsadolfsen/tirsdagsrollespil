import { InlineSubtabs } from "../components/ui";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDesktopCell,
  SheetDataDisclosureChevron,
  SheetDataHeader,
  SheetDataHeaderCell,
  SheetDataPanel,
  SheetDataTable,
} from "../components/wfrp";
import type { SpellListRow } from "./spells/useSpellsViewModel";
import type { Characteristic } from "../types";
import type { SpellSubtab } from "./tabTypes";

type RollOptions = {
  testType?: "dramatic" | "attack" | "channeling";
  title?: string | null;
};

const desktopSpellGridClass = "md:grid-cols-[56px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px_48px]";
const mobileTableGridClass = "grid-cols-[40px_minmax(0,1fr)_48px]";

export function SpellsTab({
  spellSubtabOptions,
  activeSpellSubtab,
  setActiveSpellSubtab,
  spellRows,
  handleRoll,
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
  openSpellShop: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-card">
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
      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-card space-y-4">
        <SheetDataPanel>
          <SheetDataHeader className={`grid ${mobileTableGridClass} ${desktopSpellGridClass} gap-0 md:grid`}>
            <SheetDataHeaderCell align="center">Channel</SheetDataHeaderCell>
            <SheetDataHeaderCell>Spell</SheetDataHeaderCell>
            <SheetDataHeaderCell className="hidden md:block" align="right">CN</SheetDataHeaderCell>
            <SheetDataHeaderCell className="hidden md:block" align="right">Range</SheetDataHeaderCell>
            <SheetDataHeaderCell className="hidden md:block" align="right">Target</SheetDataHeaderCell>
            <SheetDataHeaderCell className="hidden md:block" align="right">Duration</SheetDataHeaderCell>
            <SheetDataHeaderCell align="center">More</SheetDataHeaderCell>
          </SheetDataHeader>

          <SheetDataTable>
            {spellRows.map(({ channelValue, formatted, mobileDetails, spell }) => {
              return (
                <SheetDataAccordionRow
                  key={spell.name}
                  className="wfrp-skill-row"
                  summaryClassName={`wfrp-skill-row-summary ${mobileTableGridClass} md:grid ${desktopSpellGridClass} md:gap-0`}
                  contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                  summary={(
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

                      <span className="wfrp-list-cell-strong min-w-0 truncate text-left text-gray-200">
                        {spell.name}
                      </span>

                      <SheetDataDesktopCell align="right">{spell.cn}</SheetDataDesktopCell>
                      <SheetDataDesktopCell align="right" truncate>{formatted.range}</SheetDataDesktopCell>
                      <SheetDataDesktopCell align="right" truncate>{formatted.target}</SheetDataDesktopCell>
                      <SheetDataDesktopCell align="right">{formatted.duration}</SheetDataDesktopCell>
                      <SheetDataDisclosureChevron className="md:inline-flex" />
                    </>
                  )}
                >
                  <SheetDataAccordionDetails
                    description={spell.description}
                    rows={[
                      ...mobileDetails.map((field) => ({ label: field.label, value: field.value })),
                      { label: "Category", value: spell.category },
                      ...(spell.school ? [{ label: "School", value: spell.school }] : []),
                      ...(spell.damage ? [{ bordered: true, label: "Damage", value: spell.damage }] : []),
                    ]}
                  />
                </SheetDataAccordionRow>
              );
            })}
          </SheetDataTable>
        </SheetDataPanel>
      </div>
    </div>
  );
}
