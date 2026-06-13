import { useState } from "react";
import { SubtabActionButton, SubtabContentFrame } from "../components/ui";
import { InlineSubtabs } from "../components/ui/InlineSubtabs";
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
type TalentSourceSubtab = "all" | "career" | "origin" | "other";
type CharacterTalentRow = { talent: ResolvedCharacterTalent; count: number };

const talentSourceSubtabOptions: Array<{ id: TalentSourceSubtab; label: string }> = [
  { id: "all", label: "All" },
  { id: "career", label: "Career" },
  { id: "origin", label: "Background" },
  { id: "other", label: "Other" },
];

const emptyTalentTitleBySource: Record<TalentSourceSubtab, string> = {
  all: "No Talents",
  career: "No Career Talents",
  origin: "No Background Talents",
  other: "No Other Talents",
};

const emptyTalentMessageBySource: Record<TalentSourceSubtab, string> = {
  all: "Talents bought during play will appear here.",
  career: "Talents from your career path will appear here.",
  origin: "Talents from your character background will appear here.",
  other: "Talents outside your career and background will appear here.",
};

export function TalentsTab({
  talentRowsBySource,
  getTalentMaxDisplay,
  formatTalentEffect,
  onOpenTalentSidebar,
  onRemoveTalent,
}: {
  talentRowsBySource: Record<TalentSourceSubtab, CharacterTalentRow[]>;
  getTalentMaxDisplay: (max: string) => string | number;
  formatTalentEffect: (effect: TalentEffect) => string;
  onOpenTalentSidebar: () => void;
  onRemoveTalent: (talentName: string) => void;
}) {
  const [activeTalentSourceSubtab, setActiveTalentSourceSubtab] = useState<TalentSourceSubtab>("all");
  const characterTalentRows = talentRowsBySource[activeTalentSourceSubtab];

  return (
    <SubtabContentFrame
      contentClassName="max-md:pb-24"
      subtabBar={(
        <InlineSubtabs
          options={talentSourceSubtabOptions}
          activeId={activeTalentSourceSubtab}
          onChange={setActiveTalentSourceSubtab}
          ariaLabel="Talent source tabs"
          trailingContent={(
            <SubtabActionButton
              onClick={onOpenTalentSidebar}
              hideOnMobile
              aria-label="Open talent sidebar"
            >
              Add
            </SubtabActionButton>
          )}
        />
      )}
    >
      {characterTalentRows.length > 0 ? (
        <SheetDataSection
          gridClassName={talentGridClass}
          sectionLabelClassName="pl-4"
          sectionLabel="Talent"
          valueLabels={[
            { align: "center", label: "Taken" },
            { className: "hidden md:block", label: "Rule" },
            { align: "center", label: "More" },
          ]}
        >
            {characterTalentRows.map(({ talent, count }) => {
              const takenDisplay = `${count}/${getTalentMaxDisplay(talent.max)}`;
              const summaryRuleText = talent.effects?.length
                ? talent.effects.map(formatTalentEffect).join("; ")
                : talent.description;

              return (
                <SheetDataAccordionRow
                  key={talent.name}
                  summaryClassName={`${talentGridClass} gap-0`}
                  contentClassName="px-3 pb-4 pt-1 md:col-start-1 md:col-end-5 md:px-4 md:pb-4"
                  summary={(
                    <>
                      <span className="wfrp-no-roll-cell min-w-0 truncate text-left font-semibold text-gray-200">
                        {talent.name}
                      </span>
                      <div className="wfrp-list-cell-strong text-center font-mono">
                        {takenDisplay}
                      </div>
                      <div className="hidden min-w-0 truncate text-xs font-semibold leading-relaxed text-wfrp-muted-text md:block">
                        {summaryRuleText}
                      </div>
                      <SheetDataDisclosureCell />
                    </>
                  )}
                >
                  <SheetDataAccordionDetails
                    description={talent.description}
                    rows={[
                      { label: "Taken", value: count },
                      { label: "Maximum", value: getTalentMaxDisplay(talent.max) },
                      ...(talent.tests ? [{ label: "Tests", value: talent.tests }] : []),
                    ]}
                  >
                    <div className="pt-2">
                      <SubtabActionButton
                        onClick={() => onRemoveTalent(talent.name)}
                        aria-label={`Remove ${talent.name}`}
                      >
                        Remove
                      </SubtabActionButton>
                    </div>
                  </SheetDataAccordionDetails>
                </SheetDataAccordionRow>
              );
            })}
        </SheetDataSection>
      ) : (
        <SheetEmptyState title={emptyTalentTitleBySource[activeTalentSourceSubtab]}>
          {emptyTalentMessageBySource[activeTalentSourceSubtab]}
        </SheetEmptyState>
      )}
    </SubtabContentFrame>
  );
}
