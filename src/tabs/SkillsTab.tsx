import { InlineSubtabs } from "../components/ui";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDisclosureChevron,
  SheetDataHeader,
  SheetDataHeaderCell,
  SheetDataPanel,
  SheetDataTable,
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
    <div className="flex flex-col h-full bg-card">
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-card space-y-4">
        <SheetDataPanel>
          <SheetDataHeader className={`${mobileSkillGridClass} ${desktopSkillGridClass} gap-0`}>
            <SheetDataHeaderCell align="center">Roll</SheetDataHeaderCell>
            <SheetDataHeaderCell>Skill</SheetDataHeaderCell>
            <SheetDataHeaderCell align="right">Char.</SheetDataHeaderCell>
            <SheetDataHeaderCell className="hidden md:block" align="right">Score</SheetDataHeaderCell>
            <SheetDataHeaderCell className="hidden md:block" align="right">Adv.</SheetDataHeaderCell>
            <SheetDataHeaderCell className="hidden md:block" align="right">Total</SheetDataHeaderCell>
            <SheetDataHeaderCell align="center">More</SheetDataHeaderCell>
          </SheetDataHeader>

          <SheetDataTable>
            {visibleSkillRows.map((skill) => {
              const charValue = attributes[skill.characteristic] || 0;
              const totalValue = charValue + skill.advances;
              const formattedAdvances = skill.advances === 0 ? "-" : `+${skill.advances}`;

              return (
                <SheetDataAccordionRow
                  key={skill.key}
                  className="wfrp-skill-row"
                  summaryClassName={`wfrp-skill-row-summary ${mobileSkillGridClass} md:grid ${desktopSkillGridClass} md:gap-0`}
                  contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
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

                      <div className="wfrp-list-cell-strong text-right font-mono">
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
          </SheetDataTable>
        </SheetDataPanel>
      </div>
    </div>
  );
}
