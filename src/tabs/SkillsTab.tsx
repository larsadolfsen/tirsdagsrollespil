import { InlineSubtabs } from "../components/ui";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDisclosureChevron,
  SheetDataHeader,
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
  openSkillInfo,
}: {
  activeSkillSubtab: SkillSubtab;
  setActiveSkillSubtab: (subtab: SkillSubtab) => void;
  visibleSkillRows: SkillRow[];
  attributes: Record<string, number>;
  handleRoll: (characteristic: { key: string; label: string }) => void;
  openSkillInfo: (skillName: string) => void;
}) {
  return (
    <div className="flex flex-col h-full">
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4">
        <SheetDataPanel>
          <SheetDataHeader className={`hidden ${desktopSkillGridClass} md:grid md:gap-0`}>
            <span className="wfrp-table-label text-center">Roll</span>
            <span className="wfrp-table-label text-left">Skill</span>
            <span className="wfrp-table-label text-center">Char.</span>
            <span className="wfrp-table-label text-center">Score</span>
            <span className="wfrp-table-label text-center">Adv.</span>
            <span className="wfrp-table-label text-center">Total</span>
            <span className="wfrp-table-label text-center">More</span>
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
                  summaryClassName={`wfrp-skill-row-summary grid-cols-[40px_minmax(0,1fr)_48px] md:grid ${desktopSkillGridClass} md:gap-0`}
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

                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          openSkillInfo(skill.displayName);
                        }}
                        className="wfrp-skill-link min-w-0 truncate text-left"
                      >
                        {skill.displayName}
                      </button>

                      <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">
                        {skill.characteristic}
                      </div>

                      <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">
                        {charValue}
                      </div>

                      <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">
                        {formattedAdvances}
                      </div>

                      <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">
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
