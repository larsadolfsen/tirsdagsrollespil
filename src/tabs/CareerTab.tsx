import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Minus, Plus } from "lucide-react";
import { AdvancementSection, InlineSubtabs, SubtabActionButton, SubtabContentFrame } from "../components/ui";
import type { ActiveInfoState } from "../components/appTypes";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDisclosureCell,
  SheetDataSection,
  SheetEmptyState,
} from "../components/wfrp";
import type {
  ResolvedCharacterRecord,
  ResolvedCharacterTalent,
} from "../data/characters/resolved";
import type { CareerSubtab } from "./tabTypes";

type AdvancementCharacteristic = {
  key: string;
  label: string;
  advances: number;
  initial: number;
  pendingAdvances: number;
  value: number;
};

type AdvancementSkillRow = {
  skillName: string;
  pendingAdvances: number;
  baseAdvances: number;
  characteristicKey: string | null;
  baseCharacteristicValue: number;
  nextSkillCost: number;
  isCareerSkill: boolean;
};

type AdvancementSkillSection = {
  id: string;
  title: string;
  skills: AdvancementSkillRow[];
};

type CareerAdvancementData = {
  characteristics: Array<{
    key: string;
    availableFromRank: number;
  }>;
  skills: string[];
  talents: string[];
};

interface CareerTabProps {
  activeCareerSubtab: CareerSubtab;
  setActiveCareerSubtab: Dispatch<SetStateAction<CareerSubtab>>;
  saveCareerChanges: () => void;
  hasPendingCareerChanges: boolean;
  characterData: ResolvedCharacterRecord;
  displayedCareerRank: number;
  displayedCareerRankRecord: ResolvedCharacterRecord["careerRecord"]["ranks"][number] | null;
  careerAdvancementData: CareerAdvancementData;
  advancementProgress: number;
  nextCareerAdvanceCost: number | null;
  pendingAvailableXp: number;
  pendingXpAdjustment: number;
  setPendingXpAdjustment: Dispatch<SetStateAction<number>>;
  nextCareerRankRecord: ResolvedCharacterRecord["careerRecord"]["ranks"][number] | null;
  increasePendingCareerRank: () => void;
  advancementCharacteristics: AdvancementCharacteristic[];
  availableCareerCharacteristicKeys: string[];
  getCharacteristicAdvanceCost: (currentAdvances: number) => number;
  getCharacteristicLabel: (key: string) => string;
  removePendingCharacteristicAdvance: (characteristicKey: string) => void;
  purchaseCharacteristicAdvance: (characteristicKey: string) => void;
  updateCharacteristicInitial: (characteristicKey: string, initialValue: number) => void;
  updateCharacteristicAdvances: (characteristicKey: string, advances: number) => void;
  advancementSkillSections: AdvancementSkillSection[];
  removePendingSkillAdvance: (skillName: string) => void;
  purchaseSkillAdvance: (skillName: string) => void;
  updateSkillAdvances: (skillName: string, advances: number) => void;
  advancementTalentNames: string[];
  characterTalents: ResolvedCharacterTalent[];
  pendingTalentPurchases: Record<string, number>;
  getTalentPurchaseCost: (currentTimesTaken: number) => number;
  removePendingTalentPurchase: (talentName: string) => void;
  purchaseTalent: (talentName: string) => void;
  openTalentInfo: (talentName: string) => void;
  setActiveInfo: Dispatch<SetStateAction<ActiveInfoState | null>>;
  clearRollCharacteristic: () => void;
}

const careerSubtabOptions: Array<{ id: CareerSubtab; label: string }> = [
  { id: "all", label: "All" },
  { id: "careers", label: "Careers" },
  { id: "characteristics", label: "Characteristics" },
  { id: "skills", label: "Skills" },
  { id: "talents", label: "Talents" },
];

const careerXpGridClass = "grid-cols-[minmax(0,1fr)_42px_42px_minmax(88px,auto)_36px] md:grid-cols-[minmax(0,1fr)_72px_72px_minmax(150px,auto)_48px]";
const careerPathGridClass = "grid-cols-[minmax(0,1fr)_52px_40px_36px] md:grid-cols-[minmax(0,1fr)_minmax(180px,1.4fr)_minmax(0,1fr)_62px_74px_48px]";
const characteristicAdvanceGridClass = "grid-cols-[minmax(0,1fr)_56px_52px_64px_36px] md:grid-cols-[minmax(0,1fr)_64px_72px_62px_74px_48px]";
const skillAdvanceGridClass = "grid-cols-[minmax(0,1fr)_56px_52px_64px_36px] md:grid-cols-[minmax(0,1fr)_56px_62px_62px_74px_48px]";
const talentAdvanceGridClass = "grid-cols-[minmax(0,1fr)_52px_52px_64px_36px] md:grid-cols-[minmax(0,1fr)_72px_62px_74px_48px]";

const toRoman = (value: number) => ["", "I", "II", "III", "IV"][value] ?? String(value);

export function CareerTab({
  activeCareerSubtab,
  setActiveCareerSubtab,
  saveCareerChanges,
  hasPendingCareerChanges,
  characterData,
  displayedCareerRank,
  displayedCareerRankRecord,
  careerAdvancementData,
  advancementProgress,
  nextCareerAdvanceCost,
  pendingAvailableXp,
  pendingXpAdjustment,
  setPendingXpAdjustment,
  nextCareerRankRecord,
  increasePendingCareerRank,
  advancementCharacteristics,
  availableCareerCharacteristicKeys,
  getCharacteristicAdvanceCost,
  getCharacteristicLabel,
  removePendingCharacteristicAdvance,
  purchaseCharacteristicAdvance,
  updateCharacteristicInitial,
  updateCharacteristicAdvances,
  advancementSkillSections,
  removePendingSkillAdvance,
  purchaseSkillAdvance,
  updateSkillAdvances,
  advancementTalentNames,
  characterTalents,
  pendingTalentPurchases,
  getTalentPurchaseCost,
  removePendingTalentPurchase,
  purchaseTalent,
  openTalentInfo,
  setActiveInfo,
  clearRollCharacteristic,
}: CareerTabProps) {
  const currentCareerRow =
    displayedCareerRankRecord ??
    characterData.careerRecord.ranks.find((rank) => rank.rank === displayedCareerRank) ??
    null;
  const careerRows = currentCareerRow ? [currentCareerRow] : [];
  const pendingXpBaseDisplay = pendingAvailableXp - pendingXpAdjustment;
  const currentXpDisplay =
    pendingXpAdjustment > 0
      ? `${pendingXpBaseDisplay} +${pendingXpAdjustment}`
      : pendingAvailableXp;
  const pendingTotalXp = characterData.xpTotal + pendingXpAdjustment;
  const canRemove10Xp = pendingXpAdjustment >= 10;
  const canRemove100Xp = pendingXpAdjustment >= 100;
  const adjustXp = (amount: number) => {
    setPendingXpAdjustment((current) => Math.max(0, current + amount));
  };

  const xpAdjustActions = (
    <div className="flex flex-wrap justify-end gap-1">
      <button
        onClick={(event) => {
          event.preventDefault();
          adjustXp(-100);
        }}
        disabled={!canRemove100Xp}
        className="wfrp-stepper-btn wfrp-stepper-btn--value"
        aria-label="Remove 100 pending XP"
      >
        <span className="wfrp-stepper-btn__inner">-100</span>
      </button>
      <button
        onClick={(event) => {
          event.preventDefault();
          adjustXp(-10);
        }}
        disabled={!canRemove10Xp}
        className="wfrp-stepper-btn wfrp-stepper-btn--value"
        aria-label="Remove 10 pending XP"
      >
        <span className="wfrp-stepper-btn__inner">-10</span>
      </button>
      <button
        onClick={(event) => {
          event.preventDefault();
          adjustXp(10);
        }}
        className="wfrp-stepper-btn wfrp-stepper-btn--value"
        aria-label="Add 10 current and total XP"
      >
        <span className="wfrp-stepper-btn__inner">+10</span>
      </button>
      <button
        onClick={(event) => {
          event.preventDefault();
          adjustXp(100);
        }}
        className="wfrp-stepper-btn wfrp-stepper-btn--value"
        aria-label="Add 100 current and total XP"
      >
        <span className="wfrp-stepper-btn__inner">+100</span>
      </button>
    </div>
  );

  const [isAdvancementEditMode, setIsAdvancementEditMode] = useState(false);
  const [characteristicInitialDrafts, setCharacteristicInitialDrafts] = useState<Record<string, number>>({});
  const [characteristicAdvanceDrafts, setCharacteristicAdvanceDrafts] = useState<Record<string, number>>({});
  const [skillAdvanceDrafts, setSkillAdvanceDrafts] = useState<Record<string, number>>({});

  const beginAdvancementEdit = () => {
    setCharacteristicInitialDrafts(
      Object.fromEntries(advancementCharacteristics.map((item) => [item.key, item.initial])),
    );
    setCharacteristicAdvanceDrafts(
      Object.fromEntries(advancementCharacteristics.map((item) => [item.key, item.advances])),
    );
    setSkillAdvanceDrafts(
      Object.fromEntries(
        advancementSkillSections.flatMap((section) =>
          section.skills.map((skill) => [skill.skillName, skill.baseAdvances]),
        ),
      ),
    );
    setIsAdvancementEditMode(true);
  };

  const cancelAdvancementEdit = () => {
    setIsAdvancementEditMode(false);
    setCharacteristicInitialDrafts({});
    setCharacteristicAdvanceDrafts({});
    setSkillAdvanceDrafts({});
  };

  const handleSaveCareerClick = () => {
    if (isAdvancementEditMode) {
      Object.entries(characteristicInitialDrafts).forEach(([key, value]) => {
        updateCharacteristicInitial(key, Number(value));
      });
      Object.entries(characteristicAdvanceDrafts).forEach(([key, value]) => {
        updateCharacteristicAdvances(key, Number(value));
      });
      Object.entries(skillAdvanceDrafts).forEach(([skillName, value]) => {
        updateSkillAdvances(skillName, Number(value));
      });
      cancelAdvancementEdit();
    }

    if (hasPendingCareerChanges) {
      saveCareerChanges();
    }
  };

  const shouldHighlightSave = hasPendingCareerChanges || isAdvancementEditMode;
  const parseDraftNumber = (value: string) => Math.max(0, Math.floor(Number(value) || 0));

  return (
    <SubtabContentFrame
      className="bg-card"
      subtabBar={(
        <InlineSubtabs<CareerSubtab>
          options={careerSubtabOptions}
          activeId={activeCareerSubtab}
          onChange={setActiveCareerSubtab}
          ariaLabel="Career section tabs"
          trailingContent={(
            <div className="flex items-center gap-2">
              <SubtabActionButton
                onClick={isAdvancementEditMode ? cancelAdvancementEdit : beginAdvancementEdit}
                aria-label={isAdvancementEditMode ? "Cancel advancement edits" : "Edit initial and advances"}
              >
                {isAdvancementEditMode ? "Cancel" : "Edit"}
              </SubtabActionButton>
              <SubtabActionButton
                onClick={handleSaveCareerClick}
                disabled={!hasPendingCareerChanges && !isAdvancementEditMode}
                isActive={shouldHighlightSave}
                aria-label="Save career changes"
              >
                Save
              </SubtabActionButton>
            </div>
          )}
        />
      )}
    >
        <SheetDataSection
          gridClassName={careerXpGridClass}
          sectionLabel="XP"
          valueLabels={[
            { align: "center", className: "text-[9px] md:text-[10px]", label: "Current" },
            { align: "center", className: "text-[9px] md:text-[10px]", label: "Total" },
            { align: "right", className: "text-[9px] md:text-[10px]", label: "Adjust" },
            { align: "center", className: "text-[9px] md:text-[10px]", label: "More" },
          ]}
        >
            <SheetDataAccordionRow
              summaryClassName={careerXpGridClass}
              contentClassName="px-3 pb-4 pt-1 md:px-4"
              summary={(
                <>
                  <div className="wfrp-list-cell-strong min-w-0 truncate text-left">Experience</div>
                  <div className="wfrp-list-cell-strong text-center font-mono text-white">
                    {currentXpDisplay}
                  </div>
                  <div className="wfrp-list-cell-strong text-center font-mono">
                    {pendingTotalXp}
                  </div>
                  {xpAdjustActions}
                  <SheetDataDisclosureCell />
                </>
              )}
            >
              <SheetDataAccordionDetails
                description="Current and total XP are adjusted together."
                rows={[
                  { label: "Current XP", value: currentXpDisplay },
                  { label: "Total XP", value: pendingTotalXp },
                ]}
              />
            </SheetDataAccordionRow>
        </SheetDataSection>

        {(activeCareerSubtab === "all" || activeCareerSubtab === "careers") && (
          <AdvancementSection title="Careers" meta="Current Path" hideHeader>
            <SheetDataSection
              gridClassName={careerPathGridClass}
              sectionLabel="Career"
              valueLabels={[
                { className: "hidden md:block", label: "Progress" },
                { className: "hidden md:block", label: "Tier" },
                { align: "center", label: "Cost" },
                { align: "right", label: "Advance" },
                { align: "center", label: "More" },
              ]}
            >
                {careerRows.map((rankRecord) => {
                  const isActiveCareerRow = rankRecord.rank === displayedCareerRank;
                  const rowProgress = isActiveCareerRow ? advancementProgress : 100;
                  const costDisplay = isActiveCareerRow ? nextCareerAdvanceCost ?? "-" : "-";
                  const advanceAction = isActiveCareerRow ? (
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        increasePendingCareerRank();
                      }}
                      disabled={
                        !nextCareerRankRecord ||
                        nextCareerAdvanceCost === null ||
                        pendingAvailableXp < nextCareerAdvanceCost
                      }
                      className="wfrp-stepper-btn"
                      aria-label={`Advance ${characterData.career} from rank ${rankRecord.rank}`}
                      title="Advance career"
                    >
                      <span className="wfrp-stepper-btn__inner">
                        <Plus size={12} />
                      </span>
                    </button>
                  ) : (
                    <span className="wfrp-list-cell text-right" aria-label="Read-only career rank">
                      -
                    </span>
                  );

                  return (
                    <SheetDataAccordionRow
                      key={rankRecord.rank}
                      summaryClassName={careerPathGridClass}
                      contentClassName="px-3 pb-4 pt-1 md:px-4"
                      summary={(
                        <>
                          <div className="min-w-0">
                            <button
                              onClick={(event) => {
                                event.preventDefault();
                                setActiveInfo({
                                  type: "career",
                                  name: `${characterData.career} ${toRoman(rankRecord.rank)}`,
                                  extra: {
                                    careerName: characterData.career,
                                    tierName: rankRecord.name,
                                    tierStatus: rankRecord.status,
                                    rank: rankRecord.rank,
                                    careerSkills: careerAdvancementData.skills,
                                    careerTalents: careerAdvancementData.talents,
                                  },
                                });
                                clearRollCharacteristic();
                              }}
                              className="wfrp-skill-link truncate text-left"
                            >
                              {characterData.career} {toRoman(rankRecord.rank)}
                            </button>
                          </div>
                          <div className="hidden min-w-0 md:block">
                            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                              <div
                                className="h-full bg-white/30 transition-all duration-500"
                                style={{ width: `${rowProgress}%` }}
                                role="progressbar"
                                aria-valuenow={rowProgress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${characterData.career} ${toRoman(rankRecord.rank)} progress`}
                              />
                            </div>
                          </div>
                          <div className="hidden wfrp-list-cell-strong text-left truncate md:block">
                            {rankRecord.name}
                          </div>
                          <div className="wfrp-list-cell-strong text-center font-mono">
                            {costDisplay}
                          </div>
                          <div className="flex justify-end">{advanceAction}</div>
                          <SheetDataDisclosureCell />
                        </>
                      )}
                    >
                      <SheetDataAccordionDetails
                        rows={[
                          {
                            label: "Progress",
                            value: `${Math.round(rowProgress)}%`,
                          },
                          {
                            label: "Tier",
                            value: rankRecord.name,
                          },
                          {
                            label: "Status",
                            value: rankRecord.status,
                          },
                        ]}
                      >
                        <div className="pt-2 md:hidden">
                          <div className="h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner">
                            <div
                              className="h-full bg-white/30 transition-all duration-500"
                              style={{ width: `${rowProgress}%` }}
                              role="progressbar"
                              aria-valuenow={rowProgress}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label={`${characterData.career} ${toRoman(rankRecord.rank)} progress`}
                            />
                          </div>
                        </div>
                      </SheetDataAccordionDetails>
                    </SheetDataAccordionRow>
                  );
                })}
            </SheetDataSection>
          </AdvancementSection>
        )}

        {(activeCareerSubtab === "all" || activeCareerSubtab === "characteristics") && (
          <AdvancementSection title="Characteristics" hideHeader>
            <SheetDataSection
              gridClassName={characteristicAdvanceGridClass}
              sectionLabel="Characteristics"
              valueLabels={[
                { align: "center", className: "hidden md:block", label: "Initial" },
                { align: "center", label: "Adv." },
                { align: "center", label: "Cost" },
                { align: "right", label: "Advance" },
                { align: "center", label: "More" },
              ]}
            >
                {advancementCharacteristics.map((item) => {
                  const totalAdvances = item.advances + item.pendingAdvances;
                  const advancesDisplay =
                    item.advances === 0
                      ? item.pendingAdvances > 0
                        ? `+${item.pendingAdvances}`
                        : "-"
                      : `${item.advances}${item.pendingAdvances > 0 ? ` +${item.pendingAdvances}` : ""}`;
                  const isAvailable = availableCareerCharacteristicKeys.includes(item.key);
                  const nextCharacteristicCost = getCharacteristicAdvanceCost(totalAdvances);
                  const initialControl = isAdvancementEditMode ? (
                    <input
                      type="number"
                      min={0}
                      value={characteristicInitialDrafts[item.key] ?? item.initial}
                      onChange={(event) =>
                        setCharacteristicInitialDrafts((prev) => ({
                          ...prev,
                          [item.key]: parseDraftNumber(event.target.value),
                        }))
                      }
                      className="w-14 rounded border border-white/10 bg-black/40 px-1 py-0.5 text-center font-mono text-[11px] text-white"
                      aria-label={`Initial value for ${item.label}`}
                    />
                  ) : (
                    item.initial
                  );
                  const advancesControl = isAdvancementEditMode ? (
                    <input
                      type="number"
                      min={0}
                      value={characteristicAdvanceDrafts[item.key] ?? item.advances}
                      onChange={(event) =>
                        setCharacteristicAdvanceDrafts((prev) => ({
                          ...prev,
                          [item.key]: parseDraftNumber(event.target.value),
                        }))
                      }
                      className="w-14 rounded border border-white/10 bg-black/40 px-1 py-0.5 text-center font-mono text-[11px] text-white"
                      aria-label={`Advances for ${item.label}`}
                    />
                  ) : (
                    advancesDisplay
                  );

                  return (
                    <SheetDataAccordionRow
                      key={item.key}
                      className={`group ${
                        !isAvailable ? "opacity-70" : ""
                      }`}
                      summaryClassName={`${characteristicAdvanceGridClass} gap-0`}
                      contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                      summary={(
                        <>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              setActiveInfo({
                                type: "characteristic",
                                name: `${item.label} (${item.key})`,
                                extra: {
                                  key: item.key,
                                  label: getCharacteristicLabel(item.key),
                                  advances: item.advances,
                                  pendingAdvances: item.pendingAdvances,
                                  currentValue: item.value,
                                  nextCost: isAvailable ? nextCharacteristicCost : null,
                                  availableFromRank:
                                    careerAdvancementData.characteristics.find(
                                      (entry) => entry.key === item.key,
                                    )?.availableFromRank ?? null,
                                },
                              });
                              clearRollCharacteristic();
                            }}
                            className="wfrp-skill-link min-w-0 truncate text-left"
                          >
                            {item.label} ({item.key})
                          </button>
                          <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">
                            {initialControl}
                          </div>
                          <div className="wfrp-list-cell-strong text-center font-mono">
                            {advancesControl}
                          </div>
                          <div className="wfrp-list-cell-strong text-center font-mono">
                            {isAvailable ? nextCharacteristicCost : "-"}
                          </div>
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                removePendingCharacteristicAdvance(item.key);
                              }}
                              disabled={item.pendingAdvances === 0 || !isAvailable}
                              className="wfrp-stepper-btn focus-visible:ring-wfrp-red/50"
                              aria-label={`Decrease ${item.label}`}
                            >
                              <span className="wfrp-stepper-btn__inner">
                                <Minus size={10} />
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                purchaseCharacteristicAdvance(item.key);
                              }}
                              disabled={!isAvailable || pendingAvailableXp < nextCharacteristicCost}
                              className="wfrp-stepper-btn focus-visible:ring-green-600/50"
                              aria-label={`Increase ${item.label}`}
                            >
                              <span className="wfrp-stepper-btn__inner">
                                <Plus size={12} />
                              </span>
                            </button>
                          </div>
                          <SheetDataDisclosureCell />
                        </>
                      )}
                    >
                      <SheetDataAccordionDetails
                        description={`${getCharacteristicLabel(item.key)} is ${isAvailable ? "available" : "not available"} at the current career rank.`}
                        rows={[
                          { label: "Initial", value: initialControl },
                          { label: "Current", value: item.value },
                          { label: "Advances", value: advancesDisplay },
                          { bordered: true, label: "Next cost", value: isAvailable ? nextCharacteristicCost : "-" },
                        ]}
                      />
                    </SheetDataAccordionRow>
                  );
                })}
            </SheetDataSection>
          </AdvancementSection>
        )}

        {(activeCareerSubtab === "all" || activeCareerSubtab === "skills") && (
          <AdvancementSection title="Skills" hideHeader>
            <div className="flex flex-col gap-3">
              {advancementSkillSections.map((section) => (
                <SheetDataSection
                  key={section.id}
                  gridClassName={skillAdvanceGridClass}
                  sectionLabel={section.title}
                  valueLabels={[
                    { align: "center", className: "hidden md:block", label: "Initial" },
                    { align: "center", label: "Adv." },
                    { align: "center", label: "Cost" },
                    { align: "right", label: "Advance" },
                    { align: "center", label: "More" },
                  ]}
                >
                    {section.skills.length === 0 ? (
                      <SheetEmptyState title={`No ${section.title.toLowerCase()} skills`}>
                        No skills listed for this section.
                      </SheetEmptyState>
                    ) : (
                      section.skills.map((skillRow) => {
                        const canPurchase =
                          skillRow.isCareerSkill && pendingAvailableXp >= skillRow.nextSkillCost;
                        const advancesDisplay =
                          skillRow.baseAdvances === 0
                            ? skillRow.pendingAdvances > 0
                              ? `+${skillRow.pendingAdvances}`
                              : "-"
                            : `${skillRow.baseAdvances}${skillRow.pendingAdvances > 0 ? ` +${skillRow.pendingAdvances}` : ""}`;
                        const initialDisplay =
                          skillRow.baseCharacteristicValue === 0
                            ? "-"
                            : skillRow.baseCharacteristicValue;
                        const advancesControl = isAdvancementEditMode ? (
                          <input
                            type="number"
                            min={0}
                            value={skillAdvanceDrafts[skillRow.skillName] ?? skillRow.baseAdvances}
                            onChange={(event) =>
                              setSkillAdvanceDrafts((prev) => ({
                                ...prev,
                                [skillRow.skillName]: parseDraftNumber(event.target.value),
                              }))
                            }
                            className="w-14 rounded border border-white/10 bg-black/40 px-1 py-0.5 text-center font-mono text-[11px] text-white"
                            aria-label={`Advances for ${skillRow.skillName}`}
                          />
                        ) : (
                          advancesDisplay
                        );

                        return (
                          <SheetDataAccordionRow
                            key={skillRow.skillName}
                            className={`group ${
                              !skillRow.isCareerSkill ? "opacity-70" : ""
                            }`}
                            summaryClassName={`${skillAdvanceGridClass} gap-0`}
                            contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                            summary={(
                              <>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  setActiveInfo({ type: "skill", name: skillRow.skillName });
                                  clearRollCharacteristic();
                                }}
                                className="wfrp-skill-link min-w-0 truncate text-left"
                              >
                                {skillRow.skillName} ({skillRow.characteristicKey || "-"})
                              </button>
                              <div className="hidden wfrp-list-cell-strong text-center font-mono md:block">
                                {initialDisplay}
                              </div>
                              <div className="wfrp-list-cell-strong text-center font-mono">
                                {advancesControl}
                              </div>
                              <div className="wfrp-list-cell-strong text-center font-mono">
                                {skillRow.isCareerSkill ? skillRow.nextSkillCost : "-"}
                              </div>
                              <div className="flex justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    removePendingSkillAdvance(skillRow.skillName);
                                  }}
                                  disabled={skillRow.pendingAdvances === 0 || !skillRow.isCareerSkill}
                                  className="wfrp-stepper-btn focus-visible:ring-wfrp-red/50"
                                  aria-label={`Decrease skill advances for ${skillRow.skillName}`}
                                >
                                  <span className="wfrp-stepper-btn__inner">
                                    <Minus size={10} />
                                  </span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    purchaseSkillAdvance(skillRow.skillName);
                                  }}
                                  disabled={!canPurchase}
                                  className="wfrp-stepper-btn focus-visible:ring-green-600/50"
                                  aria-label={`Advance skill ${skillRow.skillName}`}
                                >
                                  <span className="wfrp-stepper-btn__inner">
                                    <Plus size={12} />
                                  </span>
                                </button>
                              </div>
                              <SheetDataDisclosureCell />
                              </>
                            )}
                          >
                            <SheetDataAccordionDetails
                              description={`${skillRow.skillName} is ${skillRow.isCareerSkill ? "available" : "not available"} in the current career path.`}
                              rows={[
                                { label: "Initial", value: initialDisplay },
                                { label: "Characteristic", value: skillRow.characteristicKey || "-" },
                                { label: "Advances", value: advancesDisplay },
                                { bordered: true, label: "Next cost", value: skillRow.isCareerSkill ? skillRow.nextSkillCost : "-" },
                              ]}
                            />
                          </SheetDataAccordionRow>
                        );
                      })
                    )}
                </SheetDataSection>
              ))}
            </div>
          </AdvancementSection>
        )}

        {(activeCareerSubtab === "all" || activeCareerSubtab === "talents") && (
          <AdvancementSection title="Talents" hideHeader>
            <SheetDataSection
              gridClassName={talentAdvanceGridClass}
              sectionLabel="Talents"
              valueLabels={[
                { align: "center", label: "Taken" },
                { align: "center", label: "Cost" },
                { align: "right", label: "Advance" },
                { align: "center", label: "More" },
              ]}
            >
                {advancementTalentNames.map((talentName) => {
                  const takenCount = characterTalents.filter(
                    (talent) => talent.name === talentName,
                  ).length;
                  const pendingTakenCount = pendingTalentPurchases[talentName] ?? 0;
                  const isCareerTalent = careerAdvancementData.talents.includes(talentName);
                  const nextTalentCost = getTalentPurchaseCost(takenCount + pendingTakenCount);
                  const canPurchase = isCareerTalent && pendingAvailableXp >= nextTalentCost;
                  const takenDisplay =
                    takenCount === 0
                      ? pendingTakenCount > 0
                        ? `+${pendingTakenCount}`
                        : "-"
                      : `${takenCount}${pendingTakenCount > 0 ? ` +${pendingTakenCount}` : ""}`;

                  return (
                    <SheetDataAccordionRow
                      key={talentName}
                      className={`group ${
                        !isCareerTalent && takenCount === 0 ? "opacity-70" : ""
                      }`}
                      summaryClassName={`${talentAdvanceGridClass} gap-0`}
                      contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                      summary={(
                        <>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.preventDefault();
                            openTalentInfo(talentName);
                          }}
                          className="wfrp-skill-link min-w-0 truncate text-left"
                        >
                          {talentName}
                        </button>
                        <div className="wfrp-list-cell-strong text-center font-mono">
                          {takenDisplay}
                        </div>
                        <div className="wfrp-list-cell-strong text-center font-mono">
                          {isCareerTalent ? nextTalentCost : "-"}
                        </div>
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              removePendingTalentPurchase(talentName);
                            }}
                            disabled={pendingTakenCount === 0}
                            className="wfrp-stepper-btn focus-visible:ring-wfrp-red/50"
                            aria-label={`Decrease talent purchases for ${talentName}`}
                          >
                            <span className="wfrp-stepper-btn__inner">
                              <Minus size={10} />
                            </span>
                          </button>
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              purchaseTalent(talentName);
                            }}
                            disabled={!canPurchase}
                            className="wfrp-stepper-btn focus-visible:ring-green-600/50"
                            aria-label={`Purchase talent ${talentName}`}
                          >
                            <span className="wfrp-stepper-btn__inner">
                              <Plus size={12} />
                            </span>
                          </button>
                        </div>
                        <SheetDataDisclosureCell />
                        </>
                      )}
                    >
                      <SheetDataAccordionDetails
                        description={`${talentName} is ${isCareerTalent ? "available" : "not available"} in the current career path.`}
                        rows={[
                          { label: "Taken", value: takenDisplay },
                          { label: "Current", value: takenCount },
                          { label: "Pending", value: pendingTakenCount },
                          { bordered: true, label: "Next cost", value: isCareerTalent ? nextTalentCost : "-" },
                        ]}
                      />
                    </SheetDataAccordionRow>
                  );
                })}
            </SheetDataSection>
          </AdvancementSection>
        )}
    </SubtabContentFrame>
  );
}
