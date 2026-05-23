import { InlineSubtabs, SubtabContentFrame } from "../components/ui";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDisclosureChevron,
  SheetDataSection,
} from "../components/wfrp";
import type { SkillSubtab } from "./tabTypes";

type SkillRow = {
  key: string;
  displayName: string;
  characteristic: string;
  advances: number;
  description?: string;
};

const desktopSkillGridClass = "md:grid-cols-[56px_minmax(0,1fr)_56px_56px_56px_56px_48px]";
const mobileSkillGridClass = "grid-cols-[40px_minmax(0,1fr)_40px_48px]";
const skillContentGridClass = `${mobileSkillGridClass} ${desktopSkillGridClass}`;

const characteristicNames: Record<string, string> = {
  Ag: "Agility",
  BS: "Ballistic Skill",
  Dex: "Dexterity",
  Fel: "Fellowship",
  I: "Initiative",
  Int: "Intelligence",
  S: "Strength",
  T: "Toughness",
  WP: "Will Power",
  WS: "Weapon Skill",
};

export function SkillsTab({
  activeSkillSubtab,
  setActiveSkillSubtab,
  visibleSkillRows,
  attributes,
  handleRoll,
}: {
  activeSkillSubtab: SkillSubtab;
  setActiveSkillSubtab: (subtab: SkillSubtab) => void;
  visibleSkillRows: SkillRow[];
  attributes: Record<string, number>;
  handleRoll: (characteristic: { key: string; label: string }) => void;
  openSkillInfo?: (skillName: string) => void;
}) {
  return (
    <SubtabContentFrame
      subtabBar={(
        <InlineSubtabs<SkillSubtab>
          options={[
            { id: "all", label: "All" },
            { id: "trained", label: "Trained" },
            { id: "advanced", label: "Advanced" },
            { id: "basic", label: "Basic" },
          ]}
          activeId={activeSkillSubtab}
          onChange={setActiveSkillSubtab}
        />
      )}
    >
      <SheetDataSection
        gridClassName={`${mobileSkillGridClass} ${desktopSkillGridClass}`}
        leadingLabels={[{ align: "center", label: "Roll" }]}
        sectionLabel="Skill"
        valueLabels={[
          { align: "center", label: "Char." },
          { align: "right", className: "hidden md:block", label: "Score" },
          { align: "right", className: "hidden md:block", label: "Adv." },
          { align: "right", className: "hidden md:block", label: "Total" },
          { align: "center", label: "More" },
        ]}
      >
          {visibleSkillRows.map((skill) => {
            const charValue = attributes[skill.characteristic] || 0;
            const totalValue = charValue + skill.advances;
            const formattedAdvances = skill.advances === 0 ? "-" : `+${skill.advances}`;

            return (
              <SheetDataAccordionRow
                key={skill.key}
                className="wfrp-skill-row"
                summaryClassName={`wfrp-skill-row-summary ${mobileSkillGridClass} md:grid ${desktopSkillGridClass} md:gap-0`}
                contentGridClassName={skillContentGridClass}
                contentClassName="col-span-full min-w-0 max-w-full px-3 pb-4 pt-1 md:col-start-2 md:col-end-8 md:px-0 md:pr-14 md:pb-4"
                summary={(
                  <>
                    <div className="flex justify-center">
                      <button
                        onClick={(event) => {
                          event.preventDefault();
                          handleRoll({ key: skill.characteristic, label: skill.displayName });
                        }}
                        className="wfrp-roll-btn"
                        aria-label={`Roll for ${skill.displayName}`}
                      >
                        {totalValue}
                      </button>
                    </div>

                    <span className="wfrp-list-cell-strong min-w-0 truncate text-left text-gray-200">
                      {skill.displayName}
                    </span>

                    <div className="wfrp-list-cell-strong text-center font-mono">
                      {skill.characteristic}
                    </div>

                    <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">
                      {charValue}
                    </div>

                    <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">
                      {formattedAdvances}
                    </div>

                    <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">
                      {totalValue}
                    </div>

                    <SheetDataDisclosureChevron className="md:inline-flex" />
                  </>
                )}
              >
                <SheetDataAccordionDetails
                  description={skill.description}
                  rows={[
                    { label: "Characteristic", value: characteristicNames[skill.characteristic] ?? skill.characteristic },
                    { label: "Score", value: charValue },
                    { label: "Advances", value: formattedAdvances },
                    { bordered: true, label: "Total", value: totalValue },
                  ]}
                />
              </SheetDataAccordionRow>
            );
          })}
      </SheetDataSection>
    </SubtabContentFrame>
  );
}
