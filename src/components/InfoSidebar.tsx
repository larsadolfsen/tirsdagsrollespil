import type { Dispatch, MutableRefObject, ReactNode, SetStateAction } from "react";
import { WfrpSidebar } from "./wfrp";
import type {
  ResolvedCharacterRecord,
  ResolvedCharacterSkill,
} from "../data/characters/resolved";
import type { RulesIndex } from "../lib/gameSession";
import { formatTalentEffect, getTalentLevel } from "../lib/talentEffects";
import type { Characteristic, Ruleset } from "../types";
import type { ActiveInfoState } from "./appTypes";

type InfoSidebarProps = {
  activeInfo: ActiveInfoState | null;
  setActiveInfo: Dispatch<SetStateAction<ActiveInfoState | null>>;
  characterData: ResolvedCharacterRecord;
  characterSkills: ResolvedCharacterSkill[];
  advancementTalentNames: string[];
  ruleset: Ruleset;
  rulesIndex: RulesIndex;
  getCharacteristicDescription: (key: Characteristic["key"]) => string;
  formatSpellDuration: (duration: string) => string;
  skillListRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  propertyListRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
  talentListRefs: MutableRefObject<Record<string, HTMLDivElement | null>>;
};

type RuleStat = {
  label: string;
  value: ReactNode;
};

type RuleDetailSection = {
  title: ReactNode;
  entries?: Array<{
    title: ReactNode;
    description?: ReactNode;
  }>;
};

const sidebarTitleByType: Partial<Record<ActiveInfoState["type"], string>> = {
  talent: "Talent Ledger",
  career: "Career Ledger",
  characteristic: "Characteristic Ledger",
};

function RuleInfoTable({ rows }: { rows: RuleStat[] }) {
  return (
    <div className="mb-3 grid grid-cols-[minmax(96px,0.45fr)_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 border-y border-white/10 py-2">
      {rows.map((row) => (
        <div key={row.label} className="contents">
          <span className="wfrp-sidebar-body font-semibold text-wfrp-muted-text">{row.label}:</span>
          <span className="wfrp-sidebar-body text-left font-semibold text-gray-200">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function RuleSectionTitle({ children }: { children: ReactNode }) {
  return (
    <h4 className="wfrp-panel-title">
      {children}
      <div className="h-px flex-1 bg-white/5" />
    </h4>
  );
}

function RuleDetailSections({ sections }: { sections: RuleDetailSection[] }) {
  if (sections.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4">
      {sections.map((section) => (
        <div key={String(section.title)} className="flex flex-col gap-2">
          <RuleSectionTitle>{section.title}</RuleSectionTitle>
          {section.entries?.map((entry) => (
            <div key={String(entry.title)} className="flex flex-col gap-1">
              <span className="font-semibold text-gray-300">{entry.title}</span>
              {entry.description && <span className="text-wfrp-muted-text">{entry.description}</span>}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function RuleSummaryPanel({
  title,
  subtitle,
  stats,
  children,
}: {
  title: ReactNode;
  subtitle: ReactNode;
  stats?: RuleStat[];
  children?: ReactNode;
}) {
  return (
    <div className="wfrp-subpanel flex flex-col gap-5 rounded-lg p-5">
      <div className="flex flex-col gap-1">
        <h3 className="wfrp-sidebar-title text-xl">{title}</h3>
        <span className="wfrp-sidebar-section border-white/5 text-wfrp-muted-text">{subtitle}</span>
      </div>

      {stats && stats.length > 0 && <RuleInfoTable rows={stats} />}
      {children}
    </div>
  );
}

function RuleDescription({ children }: { children: ReactNode }) {
  return <p className="wfrp-sidebar-body">{children}</p>;
}

function RuleListEntry({
  title,
  meta,
  isActive,
  details,
  children,
  innerRef,
}: {
  key?: string;
  title: ReactNode;
  meta?: ReactNode;
  isActive?: boolean;
  details?: RuleStat[];
  children: ReactNode;
  innerRef?: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div
      ref={innerRef}
      className={`border-b border-white/5 p-4 transition-all ${isActive ? "bg-wfrp-gold/5" : ""}`}
    >
      <div className="mb-2 flex items-start justify-between gap-4">
        <div className="flex flex-col">
          <h3
            className={`wfrp-sidebar-title mb-0.5 text-base uppercase tracking-tight ${
              isActive ? "text-wfrp-gold" : "text-white"
            }`}
          >
            {title}
          </h3>
          {meta && <span className="wfrp-sidebar-label">{meta}</span>}
        </div>
      </div>
      <div className="wfrp-sidebar-body">{children}</div>
      {details && details.length > 0 && <RuleInfoTable rows={details} />}
    </div>
  );
}

export function InfoSidebar({
  activeInfo,
  setActiveInfo,
  characterData,
  advancementTalentNames,
  ruleset,
  getCharacteristicDescription,
  talentListRefs,
}: InfoSidebarProps) {
  if (!activeInfo || !(activeInfo.type === "talent" || activeInfo.type === "career" || activeInfo.type === "characteristic")) {
    return null;
  }

  return (
    <WfrpSidebar
      isOpen={Boolean(activeInfo)}
      motionKey="info-sidebar"
      onClose={() => setActiveInfo(null)}
      className="w-[400px]"
      contentClassName="scroll-smooth pb-[80vh]"
      title={sidebarTitleByType[activeInfo.type] ?? ""}
      kicker="Knowledge is power"
      closeLabel="Close sidebar"
    >
      {activeInfo.type === "career" && (
        <div className="flex flex-col gap-6 p-6">
          <RuleSummaryPanel
            title={activeInfo.name}
            subtitle={activeInfo.extra?.tierName ?? "Career Step"}
            stats={[
              { label: "Rank", value: activeInfo.extra?.rank ?? "-" },
              { label: "Status", value: activeInfo.extra?.tierStatus ?? "-" },
            ]}
          >
            <RuleInfoTable
              rows={[
                {
                  label: "Career Skills",
                  value: activeInfo.extra?.careerSkills?.length
                    ? activeInfo.extra.careerSkills.join(", ")
                    : "No career skills listed.",
                },
                {
                  label: "Career Talents",
                  value: activeInfo.extra?.careerTalents?.length
                    ? activeInfo.extra.careerTalents.join(", ")
                    : "No career talents listed.",
                },
              ]}
            />
          </RuleSummaryPanel>
        </div>
      )}

      {activeInfo.type === "characteristic" && (
        <div className="flex flex-col gap-6 p-6">
          <RuleSummaryPanel
            title={activeInfo.extra?.label ?? activeInfo.name}
            subtitle={activeInfo.extra?.key ?? ""}
            stats={[
              { label: "Current Value", value: activeInfo.extra?.currentValue ?? "-" },
              {
                label: "Advances",
                value:
                  (activeInfo.extra?.advances ?? 0) +
                  (activeInfo.extra?.pendingAdvances ?? 0),
              },
              { label: "Next Cost", value: activeInfo.extra?.nextCost ?? "-" },
              {
                label: "Unlocked At Rank",
                value: activeInfo.extra?.availableFromRank ?? "-",
              },
            ]}
          >
            <RuleDescription>
              {getCharacteristicDescription(activeInfo.extra?.key ?? activeInfo.name)}
            </RuleDescription>
          </RuleSummaryPanel>
        </div>
      )}

      {activeInfo.type === "talent" &&
        [...new Set([...advancementTalentNames, ...characterData.talents.map((talent) => talent.name)])]
          .sort((a, b) => a.localeCompare(b))
          .map((talentName) => {
            const talentDefinition = ruleset.talents.find((talent) => talent.name === talentName);
            const isOwned = characterData.talents.some((talent) => talent.name === talentName);
            const takenCount = talentDefinition
              ? getTalentLevel(characterData.talents, talentDefinition)
              : 0;
            const talentEffects = talentDefinition?.effects ?? [];

            return (
              <RuleListEntry
                key={talentName}
                title={talentName}
                isActive={activeInfo.name === talentName}
                details={[
                  {
                    label: "Status",
                    value: isOwned ? "Owned" : "Available through advancement",
                  },
                  ...(takenCount > 0 ? [{ label: "Taken", value: takenCount }] : []),
                  ...(talentDefinition?.max ? [{ label: "Max", value: talentDefinition.max }] : []),
                  ...(talentDefinition?.tests ? [{ label: "Tests", value: talentDefinition.tests }] : []),
                ]}
                innerRef={(el) => {
                  talentListRefs.current[talentName] = el;
                }}
              >
                <div className="flex flex-col gap-4">
                  <p>
                    {talentDefinition?.description ||
                      "This talent is available through advancement, but it is not yet owned by the character."}
                  </p>
                  <RuleDetailSections
                    sections={
                      talentEffects.length > 0
                        ? [
                            {
                              title: "Effects",
                              entries: talentEffects.map((effect, index) => ({
                                title: `${index + 1}. ${formatTalentEffect(effect)}`,
                                description:
                                  "condition" in effect && effect.condition
                                    ? `Condition: ${effect.condition}`
                                    : undefined,
                              })),
                            },
                          ]
                        : []
                    }
                  />
                </div>
              </RuleListEntry>
            );
          })}
    </WfrpSidebar>
  );
}
