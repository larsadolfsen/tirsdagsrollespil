import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDisclosureCell,
  SheetDataSection,
  SheetEmptyState,
} from "../components/wfrp";
import type { ResolvedCharacterTalent } from "../data/characters/resolved";

type TalentEffect = NonNullable<ResolvedCharacterTalent["effects"]>[number];

const talentGridClass = "grid-cols-[minmax(0,1fr)_72px_48px] md:grid-cols-[minmax(120px,0.75fr)_72px_minmax(180px,1.25fr)_48px]";

export function TalentsTab({
  characterTalentRows,
  openTalentInfo,
  getTalentMaxDisplay,
  formatTalentEffect,
}: {
  characterTalentRows: Array<{ talent: ResolvedCharacterTalent; count: number }>;
  openTalentInfo: (talentName: string) => void;
  getTalentMaxDisplay: (max: string) => string | number;
  formatTalentEffect: (effect: TalentEffect) => string;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-2 pb-2 pt-1 sm:px-3 sm:pb-3 lg:px-4 lg:pb-4">
      {characterTalentRows.length > 0 ? (
        <SheetDataSection
          gridClassName={talentGridClass}
          sectionLabel="Talent"
          valueLabels={[
            { align: "center", label: "Taken" },
            { className: "hidden md:block", label: "Rule" },
            { align: "center", label: "More" },
          ]}
        >
            {characterTalentRows.map(({ talent, count }) => {
              const takenDisplay = `${count}/${getTalentMaxDisplay(talent.max)}`;
              const ruleText = talent.effects?.length
                ? talent.effects.map(formatTalentEffect).join("; ")
                : talent.description;

              return (
                <SheetDataAccordionRow
                  key={talent.name}
                  summaryClassName={`${talentGridClass} gap-0`}
                  contentClassName="px-3 pb-4 pt-1 md:col-start-1 md:col-end-5 md:px-4 md:pb-4"
                  summary={(
                    <>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          openTalentInfo(talent.name);
                        }}
                        className="wfrp-skill-link min-w-0 truncate text-left text-gray-200"
                        aria-label={`Open ${talent.name} talent rule`}
                      >
                        {talent.name}
                      </button>
                      <div className="wfrp-list-cell-strong text-center font-mono">
                        {takenDisplay}
                      </div>
                      <div className="hidden min-w-0 truncate text-xs font-semibold leading-relaxed text-wfrp-muted-text md:block">
                        {ruleText}
                      </div>
                      <SheetDataDisclosureCell />
                    </>
                  )}
                >
                  <SheetDataAccordionDetails
                    description={ruleText}
                    rows={[
                      { label: "Taken", value: count },
                      { label: "Maximum", value: getTalentMaxDisplay(talent.max) },
                    ]}
                  />
                </SheetDataAccordionRow>
              );
            })}
        </SheetDataSection>
      ) : (
        <SheetEmptyState title="No Talents">Talents bought during play will appear here.</SheetEmptyState>
      )}
    </div>
  );
}
