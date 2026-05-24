import { InlineSubtabs, SubtabContentFrame } from "../components/ui";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDesktopCell,
  SheetDataDisclosureCell,
  SheetDataRollCell,
  SheetDataSection,
} from "../components/wfrp";
import type { SpellListRow } from "./spells/useSpellsViewModel";
import type { Characteristic } from "../types";
import type { SpellSubtab } from "./tabTypes";

type RollOptions = {
  testType?: "dramatic" | "attack" | "channeling";
  title?: string | null;
};

const desktopSpellGridClass = "md:grid-cols-[56px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px_48px]";
const mobileSpellGridClass = "grid-cols-[40px_minmax(0,1fr)_52px_64px_48px]";

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
    <SubtabContentFrame
      subtabBar={(
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
      )}
    >
      <SheetDataSection
        gridClassName={`${mobileSpellGridClass} ${desktopSpellGridClass}`}
        leadingLabels={[{ align: "center", label: "Roll" }]}
        sectionLabel="Spell"
        valueLabels={[
          { align: "right", className: "hidden md:block", label: "CN" },
          { align: "left", label: "RNG" },
          { align: "left", label: "Target" },
          { align: "right", className: "hidden md:block", label: "Duration" },
          { align: "center", label: "More" },
        ]}
      >
          {spellRows.map(({ channelValue, formatted, mobileDetails, spell }) => {
            return (
              <SheetDataAccordionRow
                key={spell.name}
                summaryClassName={`${mobileSpellGridClass} md:grid ${desktopSpellGridClass} md:gap-0`}
                contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                summary={(
                  <>
                    <SheetDataRollCell>
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
                    </SheetDataRollCell>

                    <span className="wfrp-list-cell-strong min-w-0 truncate text-left text-gray-200">
                      {spell.name}
                    </span>

                    <SheetDataDesktopCell align="right">{spell.cn}</SheetDataDesktopCell>
                    <div className="wfrp-list-cell-strong truncate text-left font-mono md:font-sans">
                      {formatted.range}
                    </div>
                    <div className="wfrp-list-cell-strong truncate text-left font-mono md:font-sans">
                      {formatted.target}
                    </div>
                    <SheetDataDesktopCell align="right">{formatted.duration}</SheetDataDesktopCell>
                    <SheetDataDisclosureCell />
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
      </SheetDataSection>
    </SubtabContentFrame>
  );
}
