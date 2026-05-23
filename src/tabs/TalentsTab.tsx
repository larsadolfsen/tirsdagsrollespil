import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDisclosureChevron,
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
    <div className="flex-1 overflow-y-auto p-2 sm:p-3 lg:p-4">
      {characterTalentRows.length > 0 ? (
        <SheetDataSection
          gridClassName={talentGridClass}
          sectionLabel="Talent"
          valueLabels={[
            { align: "center", label: "Taken" },
            { className: "hidden md:block", label: "Description" },
            { align: "center", label: "More" },
          ]}
        >
            {characterTalentRows.map(({ talent, count }) => {
              const takenDisplay = `${count}/${getTalentMaxDisplay(talent.max)}`;
              const effectText = talent.effects?.length
                ? talent.effects.map(formatTalentEffect).join("; ")
                : talent.description;

              return (
                <SheetDataAccordionRow
                  key={talent.name}
                  className="wfrp-skill-row"
                  summaryClassName={`wfrp-skill-row-summary ${talentGridClass} gap-0`}
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
                        {effectText}
                      </div>
                      <SheetDataDisclosureChevron className="md:inline-flex" />
                    </>
                  )}
                >
                  <SheetDataAccordionDetails
                    description={talent.description}
                    rows={[
                      { label: "Taken", value: count },
                      { label: "Maximum", value: getTalentMaxDisplay(talent.max) },
                    ]}
                  >
                    {talent.effects?.length ? (
                      <div className="flex flex-col gap-1 border-t border-white/10 pt-2">
                        {talent.effects.map((effect, index) => (
                          <p key={index} className="text-[11px] font-bold leading-relaxed text-card-foreground">
                            {formatTalentEffect(effect)}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </SheetDataAccordionDetails>
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
