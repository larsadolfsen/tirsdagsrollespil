import { useEffect } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Button, InlineSubtabs, SubtabContentFrame } from "../components/ui";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDesktopCell,
  SheetDataDisclosureCell,
  SheetDataRollCell,
  SheetDataSection,
} from "../components/wfrp";
import { useSpellsViewModel } from "./spells/useSpellsViewModel";
import type { ResolvedCharacterRecord, ResolvedCharacterSkill } from "../data/characters/resolved";
import type { Characteristic } from "../types";
import type { SpellSubtab } from "./tabTypes";
import {
  filterSpellDefinitionsForMode,
  formatPrayerSchoolLabel,
  formatSpellDuration as formatSpellDurationValue,
  formatSpellRange as formatSpellRangeValue,
  formatSpellTarget as formatSpellTargetValue,
  isPrayerDefinition,
} from "./spells/spellUtils";

type RollOptions = {
  testType?: "dramatic" | "attack" | "channeling";
  title?: string | null;
};

const desktopSpellGridClass = "md:grid-cols-[56px_minmax(0,1.4fr)_52px_minmax(0,1fr)_minmax(0,1fr)_88px_48px]";
const mobileSpellGridClass = "grid-cols-[40px_minmax(0,1fr)_52px_64px_48px]";

export function SpellsTab({
  activeSpellSubtab,
  attributes,
  characterData,
  characterSkills,
  formatSpellDuration,
  formatSpellRange,
  formatSpellTarget,
  setActiveSpellSubtab,
  handleRoll,
  onRemoveSpell,
  setIsSpellShopOpen,
  isPrayerMode = false,
}: {
  activeSpellSubtab: SpellSubtab;
  attributes: Record<string, number>;
  characterData: ResolvedCharacterRecord;
  characterSkills: ResolvedCharacterSkill[];
  formatSpellDuration?: (duration: string) => string;
  formatSpellRange?: (range: string) => string;
  formatSpellTarget?: (target: string) => string;
  setActiveSpellSubtab: (subtab: SpellSubtab) => void;
  handleRoll: (
    characteristic: Characteristic,
    damage?: number,
    options?: RollOptions,
  ) => void;
  onRemoveSpell: (spellId: string) => void;
  setIsSpellShopOpen: Dispatch<SetStateAction<boolean>>;
  isPrayerMode?: boolean;
}) {
  const entryLabel = isPrayerMode ? "Prayer" : "Spell";
  const entryPluralLabel = isPrayerMode ? "Prayers" : "Spells";
  const actionLabel = isPrayerMode ? "Pray" : "Channel";
  const willpower = attributes.WP || 0;
  const willpowerBonus = Math.floor(willpower / 10);
  const availableCharacterSpells = filterSpellDefinitionsForMode(characterData.spells, isPrayerMode);
  const {
    openSpellShop,
    spellRows,
    spellSubtabOptions,
  } = useSpellsViewModel({
    activeSpellSubtab,
    attributes,
    characterSkills,
    formatSpellDuration: formatSpellDuration ?? ((duration) =>
      formatSpellDurationValue(duration, willpower, willpowerBonus)),
    formatSpellRange: formatSpellRange ?? ((range) =>
      formatSpellRangeValue(range, willpower, willpowerBonus)),
    formatSpellTarget: formatSpellTarget ?? ((target) =>
      formatSpellTargetValue(target, willpower, willpowerBonus)),
    isPrayerMode,
    setIsSpellShopOpen,
    spells: availableCharacterSpells,
  });

  useEffect(() => {
    if (!spellSubtabOptions.some((option) => option.id === activeSpellSubtab)) {
      setActiveSpellSubtab("all");
    }
  }, [activeSpellSubtab, setActiveSpellSubtab, spellSubtabOptions]);

  return (
    <SubtabContentFrame
      subtabBar={(
        <InlineSubtabs
          options={spellSubtabOptions}
          activeId={activeSpellSubtab}
          onChange={setActiveSpellSubtab}
          trailingContent={
            <Button
              variant="secondary"
              onClick={openSpellShop}
              name={`Add ${entryPluralLabel}`}
              hideOnMobile
              aria-label={`Add ${entryPluralLabel.toLowerCase()}`}
            />
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
                    <Button variant="subtabAction"
                      onClick={() => onRemoveSpell(spell.id)}
                      aria-label={`Remove ${spell.name}`}
                    >
                      Remove
                    </Button>
                  </div>
                </SheetDataAccordionDetails>
              </SheetDataAccordionRow>
            );
          })}
      </SheetDataSection>
    </SubtabContentFrame>
  );
}
