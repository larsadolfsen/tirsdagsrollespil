import { ChevronDown } from "lucide-react";
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
          <SheetDataHeader className="hidden grid-cols-[minmax(0,1fr)_36px_44px_58px] md:grid">
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
                  className="block group md:grid md:grid-cols-[minmax(0,1fr)_36px_44px_58px]"
                >
                  <details className="group/details md:contents">
                    <summary className="grid min-h-11 cursor-pointer list-none grid-cols-[40px_minmax(0,1fr)_auto_auto] items-center gap-2 md:contents [&::-webkit-details-marker]:hidden">
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

                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          openSkillInfo(skill.displayName);
                        }}
                        className="min-h-8 rounded border border-white/10 px-2 text-[10px] font-black uppercase tracking-wider text-gray-300 hover:border-wfrp-gold/40 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 md:hidden"
                        aria-label={`Show ${skill.displayName} details`}
                      >
                        Info
                      </button>

                      <ChevronDown
                        size={14}
                        className="text-gray-500 transition-transform group-open/details:rotate-180 md:hidden"
                        aria-hidden="true"
                      />

                      <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">
                        {skill.characteristic}
                      </div>

                      <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">
                        {charValue}
                      </div>

                      <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">
                        {skill.advances === 0 ? "-" : skill.advances}
                      </div>
                    </summary>

                    <div className="mt-2 grid grid-cols-3 gap-2 rounded border border-white/5 bg-black/20 p-2 md:hidden">
                      <div>
                        <div className="wfrp-table-label">Char.</div>
                        <div className="wfrp-list-cell-strong font-mono">{skill.characteristic}</div>
                      </div>
                      <div>
                        <div className="wfrp-table-label">Base</div>
                        <div className="wfrp-list-cell-strong font-mono">{charValue}</div>
                      </div>
                      <div>
                        <div className="wfrp-table-label">Adv</div>
                        <div className="wfrp-list-cell-strong font-mono">{skill.advances === 0 ? "-" : skill.advances}</div>
                      </div>
                    </div>
                  </details>
                </SheetDataRow>
              );
            })}
          </SheetDataTable>
        </SheetDataPanel>
      </div>
    </div>
  );
}
