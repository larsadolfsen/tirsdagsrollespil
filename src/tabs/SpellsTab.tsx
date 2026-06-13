import { InlineSubtabs, SubtabActionButton, SubtabContentFrame } from "../components/ui";
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
import { formatPrayerSchoolLabel, isPrayerDefinition } from "./spells/spellUtils";

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
  onRemoveSpell,
  isPrayerMode = false,
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
  onRemoveSpell: (spellId: string) => void;
  isPrayerMode?: boolean;
}) {
  const entryLabel = isPrayerMode ? "Prayer" : "Spell";
  const entryPluralLabel = isPrayerMode ? "Prayers" : "Spells";
  const actionLabel = isPrayerMode ? "Pray" : "Channel";

  return (
    <SubtabContentFrame
      subtabBar={(
        <InlineSubtabs
          options={spellSubtabOptions}
          activeId={activeSpellSubtab}
          onChange={setActiveSpellSubtab}
          trailingContent={
            <SubtabActionButton
              onClick={openSpellShop}
              hideOnMobile
              aria-label={`Add ${entryPluralLabel.toLowerCase()}`}
            >
              Add {entryPluralLabel}
            </SubtabActionButton>
          }
        />
      )}
    >
      <SheetDataSection
        gridClassName={`${mobileSpellGridClass} ${desktopSpellGridClass}`}
        leadingLabels={[{ align: "center", label: "Roll" }]}
        sectionLabel={entryLabel}
        valueLabels={[
          { align: "right", className: "hidden md:block", label: "CN" },
          { align: "left", label: "RNG" },
          { align: "left", label: "Target" },
          { align: "right", className: "hidden md:block", label: "Duration" },
          { align: "center", label: "More" },
        ]}
      >
          {spellRows.map(({ channelValue, formatted, mobileDetails, rollLabel, spell }) => {
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
                          handleRoll({ key: "WP", label: rollLabel }, undefined, {
                            testType: "channeling",
                            title: `${actionLabel} ${spell.name}`,
                          });
                        }}
                        className="wfrp-roll-btn"
                        aria-label={`${actionLabel} ${spell.name}`}
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
                    ...(isPrayerMode && isPrayerDefinition(spell) && spell.school
                      ? [{ label: "Type", value: formatPrayerSchoolLabel(spell.school) }]
                      : [
                          { label: "Category", value: spell.category },
                          ...(spell.school ? [{ label: "School", value: spell.school }] : []),
                        ]),
                    ...(spell.damage ? [{ bordered: true, label: "Damage", value: spell.damage }] : []),
                  ]}
                >
                  <div className="pt-2">
                    <SubtabActionButton
                      onClick={() => onRemoveSpell(spell.id)}
                      aria-label={`Remove ${spell.name}`}
                    >
                      Remove
                    </SubtabActionButton>
                  </div>
                </SheetDataAccordionDetails>
              </SheetDataAccordionRow>
            );
          })}
      </SheetDataSection>
    </SubtabContentFrame>
  );
}
