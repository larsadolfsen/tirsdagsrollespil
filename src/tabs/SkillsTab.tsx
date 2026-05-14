import { InlineSubtabs } from "../components/ui";
import { SheetDataHeader, SheetDataPanel, SheetDataRow, SheetDataTable } from "../components/wfrp";
import type { SkillSubtab } from "./tabTypes";

type SkillRow = {
  key: string;
  displayName: string;
  characteristic: string;
  advances: number;
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
          <SheetDataHeader className="grid-cols-[minmax(0,1fr)_36px_44px_58px]">
            <span className="wfrp-table-label text-left">Skill</span>
            <span className="wfrp-table-label col-span-2 text-center">Char.</span>
            <span className="wfrp-table-label text-center">Adv</span>
          </SheetDataHeader>

          <SheetDataTable>
            {visibleSkillRows.map((skill) => {
              const charValue = attributes[skill.characteristic] || 0;
              const totalValue = charValue + skill.advances;

              return (
                <SheetDataRow
                  key={skill.key}
                  className="grid-cols-[minmax(0,1fr)_36px_44px_58px] group"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <button
                      onClick={() => handleRoll({ key: skill.characteristic, label: skill.displayName })}
                      className="wfrp-roll-btn"
                      aria-label={`Roll for ${skill.displayName}`}
                    >
                      {totalValue}
                    </button>

                    <span
                      onClick={() => openSkillInfo(skill.displayName)}
                      className="wfrp-skill-link min-w-0 truncate"
                    >
                      {skill.displayName}
                    </span>
                  </div>

                  <div className="wfrp-list-cell-strong text-center font-mono">
                    {skill.characteristic}
                  </div>

                  <div className="wfrp-list-cell-strong text-center font-mono">
                    {charValue}
                  </div>

                  <div className="wfrp-list-cell-strong text-center font-mono">
                    {skill.advances === 0 ? "-" : skill.advances}
                  </div>
                </SheetDataRow>
              );
            })}
          </SheetDataTable>
        </SheetDataPanel>
      </div>
    </div>
  );
}
