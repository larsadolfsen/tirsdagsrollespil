import type { Dispatch, ReactNode, SetStateAction } from "react";
import { WfrpSidebar } from "./wfrp";
import type { Characteristic } from "../types";
import type { ActiveInfoState } from "./appTypes";

type InfoSidebarProps = {
  activeInfo: ActiveInfoState | null;
  setActiveInfo: Dispatch<SetStateAction<ActiveInfoState | null>>;
  getCharacteristicDescription: (key: Characteristic["key"]) => string;
};

type RuleStat = {
  label: string;
  value: ReactNode;
};

const sidebarTitleByType: Partial<Record<ActiveInfoState["type"], string>> = {
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

export function InfoSidebar({
  activeInfo,
  setActiveInfo,
  getCharacteristicDescription,
}: InfoSidebarProps) {
  if (!activeInfo || !(activeInfo.type === "career" || activeInfo.type === "characteristic")) {
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
    </WfrpSidebar>
  );
}
