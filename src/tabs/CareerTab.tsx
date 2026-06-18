import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Minus, Plus, Search } from "lucide-react";
import { AdvancementSection, InlineSubtabs, SubtabContentFrame } from "../components/ui";
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
  isBasicSkill?: boolean;
  isTrained?: boolean;
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
  saveCareerChanges: () => void;
  hasPendingCareerChanges: boolean;
  onDraftChangesChange: (hasDraftChanges: boolean) => void;
  characterData: ResolvedCharacterRecord;
  displayedCareerRank: number;
  displayedCareerRankRecord: ResolvedCharacterRecord["careerRecord"]["ranks"][number] | null;
  careerAdvancementData: CareerAdvancementData;
  pendingAvailableXp: number;
  pendingXpAdjustment: number;
  setPendingXpAdjustment: Dispatch<SetStateAction<number>>;
  nextCareerRankRecord: ResolvedCharacterRecord["careerRecord"]["ranks"][number] | null;
  increasePendingCareerRank: () => void;
  advancementCharacteristics: AdvancementCharacteristic[];
  getCharacteristicLabel: (key: string) => string;
  updateCharacteristicInitial: (characteristicKey: string, initialValue: number) => void;
  updateCharacteristicAdvances: (characteristicKey: string, advances: number) => void;
  advancementSkillSections: AdvancementSkillSection[];
  updateSkillAdvances: (skillName: string, advances: number) => void;
  advancementTalentNames: string[];
  characterTalents: ResolvedCharacterTalent[];
  purchaseTalent: (talentName: string) => void;
  updateTalentTaken: (talentName: string, takenCount: number) => void;
  getTalentMaxDisplayByName: (talentName: string) => string | number;
  openTalentInfo: (talentName: string) => void;
  setActiveInfo: Dispatch<SetStateAction<ActiveInfoState | null>>;
  clearRollCharacteristic: () => void;
}

export const careerSubtabOptions: Array<{ id: CareerSubtab; label: string }> = [
  { id: "experience", label: "Experience" },
  { id: "characteristics", label: "Characteristics" },
  { id: "careers", label: "Careers" },
  { id: "skills", label: "Skills" },
  { id: "talents", label: "Talents" },
];

type CareerListFilter = "all" | "career" | "other" | "basic" | "advanced" | "trained" | "untrained" | "taken";

const filterOptionsBySubtab: Record<CareerSubtab, Array<{ id: CareerListFilter; label: string }>> = {
  experience: [{ id: "all", label: "All" }],
  characteristics: [{ id: "all", label: "All" }],
  careers: [{ id: "all", label: "All" }],
  skills: [
    { id: "all", label: "All" },
    { id: "career", label: "Career" },
    { id: "basic", label: "Basic" },
    { id: "advanced", label: "Advanced" },
    { id: "trained", label: "Trained" },
    { id: "untrained", label: "Untrained" },
  ],
  talents: [
    { id: "all", label: "All" },
    { id: "career", label: "Career" },
    { id: "taken", label: "Taken" },
    { id: "other", label: "Other" },
  ],
};

const experienceGridClass = "grid-cols-[minmax(0,1fr)_minmax(96px,auto)_minmax(132px,auto)_36px] md:grid-cols-[minmax(0,1fr)_minmax(120px,auto)_minmax(180px,auto)_48px]";
const careerPathGridClass = "grid-cols-[minmax(0,1fr)_64px_36px] md:grid-cols-[minmax(0,1fr)_minmax(120px,0.65fr)_74px_48px]";
const characteristicAdvanceGridClass = "grid-cols-[minmax(0,1fr)_minmax(132px,auto)_36px] md:grid-cols-[minmax(0,1fr)_minmax(132px,auto)_minmax(132px,auto)_48px]";
const skillAdvanceGridClass = "grid-cols-[minmax(0,1fr)_minmax(132px,auto)_36px] md:grid-cols-[minmax(0,1fr)_56px_minmax(132px,auto)_48px]";
const talentAdvanceGridClass = "grid-cols-[minmax(0,1fr)_52px_minmax(132px,auto)_36px] md:grid-cols-[minmax(0,1fr)_72px_minmax(132px,auto)_48px]";
const advanceRowInsetClass = "pl-5 md:pl-6";

const toRoman = (value: number) => ["", "I", "II", "III", "IV"][value] ?? String(value);

export type CareerTabHandle = {
  saveChanges: () => void;
};

export const CareerTab = forwardRef<CareerTabHandle, CareerTabProps>(function CareerTab({
  activeCareerSubtab,
  saveCareerChanges,
  hasPendingCareerChanges,
  onDraftChangesChange,
  characterData,
  displayedCareerRank,
  displayedCareerRankRecord,
  careerAdvancementData,
  pendingAvailableXp,
  pendingXpAdjustment,
  setPendingXpAdjustment,
  nextCareerRankRecord,
  increasePendingCareerRank,
  advancementCharacteristics,
  getCharacteristicLabel,
  updateCharacteristicInitial,
  updateCharacteristicAdvances,
  advancementSkillSections,
  updateSkillAdvances,
  advancementTalentNames,
  characterTalents,
  purchaseTalent,
  updateTalentTaken,
  getTalentMaxDisplayByName,
  openTalentInfo,
  setActiveInfo,
  clearRollCharacteristic,
}, ref) {
  const currentCareerRow =
    displayedCareerRankRecord ??
    characterData.careerRecord.ranks.find((rank) => rank.rank === displayedCareerRank) ??
    null;
  const careerRows = currentCareerRow ? [currentCareerRow] : [];
  const currentXpValue = Math.max(0, pendingAvailableXp + pendingXpAdjustment);
  const currentXpDisplay = currentXpValue;
  const pendingTotalXp = characterData.xpTotal + Math.max(0, pendingXpAdjustment);
  const adjustXp = (amount: number) => {
    setPendingXpAdjustment((current) => Math.max(-pendingAvailableXp, current + amount));
  };
  const setCurrentXpValue = (value: number) => {
    setPendingXpAdjustment(Math.max(0, value) - pendingAvailableXp);
  };

  const xpAdjustActions = (
    <div className="flex flex-wrap items-center justify-center gap-1">
      <button
        onClick={(event) => {
          event.preventDefault();
          adjustXp(-100);
        }}
        disabled={currentXpValue <= 0}
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
        disabled={currentXpValue <= 0}
        className="wfrp-stepper-btn wfrp-stepper-btn--value"
        aria-label="Remove 10 pending XP"
      >
        <span className="wfrp-stepper-btn__inner">-10</span>
      </button>
      <input
        type="number"
        min={0}
        value={currentXpValue}
        onChange={(event) => setCurrentXpValue(Math.floor(Number(event.target.value) || 0))}
        className="h-6 w-16 rounded border border-white/10 bg-black/40 px-1 text-center font-mono text-[11px] text-white"
        aria-label="Current XP"
      />
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

  const [characteristicInitialDrafts, setCharacteristicInitialDrafts] = useState<Record<string, number>>({});
  const [characteristicAdvanceDrafts, setCharacteristicAdvanceDrafts] = useState<Record<string, number>>({});
  const [skillAdvanceDrafts, setSkillAdvanceDrafts] = useState<Record<string, number>>({});
  const [listSearch, setListSearch] = useState("");
  const [listFilter, setListFilter] = useState<CareerListFilter>("all");
  const activeFilterOptions = filterOptionsBySubtab[activeCareerSubtab];
  const activeFilterOptionIds = activeFilterOptions.map((option) => option.id);
  const effectiveListFilter = activeFilterOptionIds.includes(listFilter) ? listFilter : "all";
  const normalizedSearch = listSearch.trim().toLowerCase();
  const matchesSearch = (...values: Array<string | null | undefined>) =>
    normalizedSearch.length === 0 ||
    values.some((value) => value?.toLowerCase().includes(normalizedSearch));
  const careerCharacteristicKeys = new Set(careerAdvancementData.characteristics.map((entry) => entry.key));
  const matchesCharacteristicFilter = (item: AdvancementCharacteristic) => {
    if (effectiveListFilter === "career") return careerCharacteristicKeys.has(item.key);
    if (effectiveListFilter === "other") return !careerCharacteristicKeys.has(item.key);
    return true;
  };
  const matchesSkillFilter = (skillRow: AdvancementSkillRow) => {
    if (effectiveListFilter === "career") return skillRow.isCareerSkill;
    if (effectiveListFilter === "basic") return Boolean(skillRow.isBasicSkill);
    if (effectiveListFilter === "advanced") return !skillRow.isBasicSkill;
    if (effectiveListFilter === "trained") return Boolean(skillRow.isTrained);
    if (effectiveListFilter === "untrained") return !skillRow.isTrained;
    return true;
  };
  const matchesTalentFilter = (talentName: string) => {
    const takenCount = characterTalents.filter((talent) => talent.name === talentName).length;
    const isCareerTalent = careerAdvancementData.talents.includes(talentName);

    if (effectiveListFilter === "career") return isCareerTalent;
    if (effectiveListFilter === "taken") return takenCount > 0;
    if (effectiveListFilter === "other") return !isCareerTalent;
    return true;
  };
  const filteredCareerRows = careerRows.filter((rankRecord) =>
    matchesSearch(characterData.career, rankRecord.name, rankRecord.status, toRoman(rankRecord.rank)),
  );
  const filteredAdvancementCharacteristics = advancementCharacteristics.filter((item) =>
    matchesCharacteristicFilter(item) && matchesSearch(item.label, item.key, getCharacteristicLabel(item.key)),
  );
  const filteredAdvancementSkillSections = advancementSkillSections.map((section) => ({
    ...section,
    skills: section.skills.filter((skillRow) =>
      matchesSkillFilter(skillRow) && matchesSearch(skillRow.skillName, skillRow.characteristicKey, section.title),
    ),
  }));
  const filteredAdvancementTalentNames = advancementTalentNames.filter((talentName) =>
    matchesTalentFilter(talentName) && matchesSearch(talentName),
  );
  useEffect(() => {
    setListFilter("all");
    setListSearch("");
  }, [activeCareerSubtab]);
  const hasAdvancementDraftChanges =
    Object.keys(characteristicInitialDrafts).length > 0 ||
    Object.keys(characteristicAdvanceDrafts).length > 0 ||
    Object.keys(skillAdvanceDrafts).length > 0;
  const clearAdvancementDrafts = () => {
    setCharacteristicInitialDrafts({});
    setCharacteristicAdvanceDrafts({});
    setSkillAdvanceDrafts({});
  };

  const handleSaveCareerClick = () => {
    if (hasAdvancementDraftChanges) {
      Object.entries(characteristicInitialDrafts).forEach(([key, value]) => {
        updateCharacteristicInitial(key, Number(value));
      });
      Object.entries(characteristicAdvanceDrafts).forEach(([key, value]) => {
        updateCharacteristicAdvances(key, Number(value));
      });
      Object.entries(skillAdvanceDrafts).forEach(([skillName, value]) => {
        updateSkillAdvances(skillName, Number(value));
      });
      clearAdvancementDrafts();
    }

    if (hasPendingCareerChanges) {
      saveCareerChanges();
    }
  };

  useImperativeHandle(ref, () => ({
    saveChanges: handleSaveCareerClick,
  }));

  useEffect(() => {
    onDraftChangesChange(hasAdvancementDraftChanges);
  }, [hasAdvancementDraftChanges, onDraftChangesChange]);

  const parseDraftNumber = (value: string) => Math.max(0, Math.floor(Number(value) || 0));

  return (
    <SubtabContentFrame
      className="bg-card"
      subtabBar={
        activeFilterOptions.length > 1 ? (
          <div className="px-3 py-3 md:px-4">
            <div className="min-w-0">
              <InlineSubtabs<CareerListFilter>
                options={activeFilterOptions}
                activeId={effectiveListFilter}
                onChange={setListFilter}
                ariaLabel={`${careerSubtabOptions.find((option) => option.id === activeCareerSubtab)?.label ?? "Edit character"} filters`}
              />
            </div>
          </div>
        ) : undefined
      }
    >
        {activeCareerSubtab !== "experience" ? (
          <div className="px-3 pb-3 pt-0 md:px-4">
            <form
              className="flex min-w-0 items-center gap-2"
              onSubmit={(event) => event.preventDefault()}
            >
              <input
                type="search"
                value={listSearch}
                onChange={(event) => setListSearch(event.target.value)}
                placeholder="Search"
                className="h-9 min-w-0 flex-1 rounded border border-white/10 bg-black/30 px-3 text-sm text-white outline-none transition focus:border-wfrp-gold/60 focus:ring-1 focus:ring-wfrp-gold/40"
                aria-label="Search edit character list"
              />
              <button
                type="submit"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded border border-wfrp-border bg-wfrp-surface text-gray-300 transition-colors hover:border-wfrp-gold/50 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                aria-label="Search"
              >
                <Search size={15} />
              </button>
            </form>
          </div>
        ) : null}

        {activeCareerSubtab === "experience" && (
          <AdvancementSection title="Experience" hideHeader>
            <SheetDataSection
              gridClassName={experienceGridClass}
              sectionLabel="Experience"
              valueLabels={[
                { align: "center", label: "Value" },
                { align: "center", label: "Adjust" },
                { align: "center", label: "More" },
              ]}
            >
              <SheetDataAccordionRow
                summaryClassName={`${experienceGridClass} ${advanceRowInsetClass}`}
                contentClassName="px-3 pb-4 pt-1 md:px-4"
                summary={(
                  <>
                    <div className="wfrp-list-cell-strong min-w-0 truncate text-left">
                      Current Experience
                    </div>
                    <div className="wfrp-list-cell-strong text-center font-mono">
                      {currentXpDisplay}
                    </div>
                    {xpAdjustActions}
                    <SheetDataDisclosureCell />
                  </>
                )}
              >
                <SheetDataAccordionDetails
                  description="Current XP can be edited directly."
                  rows={[
                    { label: "Current XP", value: currentXpDisplay },
                    { label: "Total XP", value: pendingTotalXp },
                  ]}
                />
              </SheetDataAccordionRow>
              <SheetDataAccordionRow
                summaryClassName={`${experienceGridClass} ${advanceRowInsetClass}`}
                contentClassName="px-3 pb-4 pt-1 md:px-4"
                summary={(
                  <>
                    <div className="wfrp-list-cell-strong min-w-0 truncate text-left">
                      Total Experience
                    </div>
                    <div className="wfrp-list-cell-strong text-center font-mono">
                      {pendingTotalXp}
                    </div>
                    <span className="wfrp-list-cell text-center text-wfrp-muted-text">-</span>
                    <SheetDataDisclosureCell />
                  </>
                )}
              >
                <SheetDataAccordionDetails
                  description="Total XP increases when positive current XP adjustments are saved."
                  rows={[
                    { label: "Current XP", value: currentXpDisplay },
                    { label: "Total XP", value: pendingTotalXp },
                  ]}
                />
              </SheetDataAccordionRow>
            </SheetDataSection>
          </AdvancementSection>
        )}

        {activeCareerSubtab === "careers" && (
          <AdvancementSection title="Careers" meta="Current Path" hideHeader>
            <SheetDataSection
              gridClassName={careerPathGridClass}
              sectionLabel="Career"
              valueLabels={[
                { className: "hidden md:block", label: "Tier" },
                { align: "right", label: "Advance" },
                { align: "center", label: "More" },
              ]}
            >
                {filteredCareerRows.map((rankRecord) => {
                  const isActiveCareerRow = rankRecord.rank === displayedCareerRank;
                  const advanceAction = isActiveCareerRow ? (
                    <button
                      onClick={(event) => {
                        event.preventDefault();
                        increasePendingCareerRank();
                      }}
                      disabled={!nextCareerRankRecord}
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
                      summaryClassName={`${careerPathGridClass} ${advanceRowInsetClass}`}
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
                          <div className="hidden wfrp-list-cell-strong min-w-0 truncate text-left md:block">
                            {rankRecord.name}
                          </div>
                          <div className="flex justify-end">{advanceAction}</div>
                          <SheetDataDisclosureCell />
                        </>
                      )}
                    >
                      <SheetDataAccordionDetails
                        rows={[
                          {
                            label: "Tier",
                            value: rankRecord.name,
                          },
                          {
                            label: "Status",
                            value: rankRecord.status,
                          },
                        ]}
                      />
                    </SheetDataAccordionRow>
                  );
                })}
            </SheetDataSection>
          </AdvancementSection>
        )}

        {activeCareerSubtab === "characteristics" && (
          <AdvancementSection title="Characteristics" hideHeader>
            <SheetDataSection
              gridClassName={characteristicAdvanceGridClass}
              sectionLabel="Characteristics"
              valueLabels={[
                { align: "center", className: "hidden md:block", label: "Initial" },
                { align: "center", label: "Advance" },
                { align: "center", label: "More" },
              ]}
            >
                {filteredAdvancementCharacteristics.map((item) => {
                  const initialDraftValue = characteristicInitialDrafts[item.key] ?? item.initial;
                  const advanceDraftValue = characteristicAdvanceDrafts[item.key] ?? item.advances;
                  const initialControl = (
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          setCharacteristicInitialDrafts((prev) => ({
                            ...prev,
                            [item.key]: Math.max(0, (prev[item.key] ?? item.initial) - 1),
                          }));
                        }}
                        disabled={initialDraftValue <= 0}
                        className="wfrp-stepper-btn focus-visible:ring-wfrp-red/50"
                        aria-label={`Decrease initial ${item.label}`}
                      >
                        <span className="wfrp-stepper-btn__inner">
                          <Minus size={10} />
                        </span>
                      </button>
                      <input
                        type="number"
                        min={0}
                        value={initialDraftValue}
                        onChange={(event) =>
                          setCharacteristicInitialDrafts((prev) => ({
                            ...prev,
                            [item.key]: parseDraftNumber(event.target.value),
                          }))
                        }
                        className="h-6 w-11 rounded border border-white/10 bg-black/40 px-1 text-center font-mono text-[11px] text-white"
                        aria-label={`Initial value for ${item.label}`}
                      />
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          setCharacteristicInitialDrafts((prev) => ({
                            ...prev,
                            [item.key]: (prev[item.key] ?? item.initial) + 1,
                          }));
                        }}
                        className="wfrp-stepper-btn focus-visible:ring-green-600/50"
                        aria-label={`Increase initial ${item.label}`}
                      >
                        <span className="wfrp-stepper-btn__inner">
                          <Plus size={12} />
                        </span>
                      </button>
                    </div>
                  );
                  const advancesControl = (
                    <input
                      type="number"
                      min={0}
                      value={advanceDraftValue}
                      onChange={(event) =>
                        setCharacteristicAdvanceDrafts((prev) => ({
                          ...prev,
                          [item.key]: parseDraftNumber(event.target.value),
                        }))
                      }
                      className="h-6 w-11 rounded border border-white/10 bg-black/40 px-1 text-center font-mono text-[11px] text-white"
                      aria-label={`Advances for ${item.label}`}
                    />
                  );

                  return (
                    <SheetDataAccordionRow
                      key={item.key}
                      className="group"
                      summaryClassName={`${characteristicAdvanceGridClass} gap-0 ${advanceRowInsetClass}`}
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
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                setCharacteristicAdvanceDrafts((prev) => ({
                                  ...prev,
                                  [item.key]: Math.max(0, (prev[item.key] ?? item.advances) - 1),
                                }));
                              }}
                              disabled={advanceDraftValue <= 0}
                              className="wfrp-stepper-btn focus-visible:ring-wfrp-red/50"
                              aria-label={`Decrease ${item.label}`}
                            >
                              <span className="wfrp-stepper-btn__inner">
                                <Minus size={10} />
                              </span>
                            </button>
                            {advancesControl}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                setCharacteristicAdvanceDrafts((prev) => ({
                                  ...prev,
                                  [item.key]: (prev[item.key] ?? item.advances) + 1,
                                }));
                              }}
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
                        description={`${getCharacteristicLabel(item.key)} can be edited directly.`}
                        rows={[
                          { label: "Initial", value: initialControl },
                          { label: "Current", value: item.value },
                          { label: "Advances", value: advancesControl },
                        ]}
                      />
                    </SheetDataAccordionRow>
                  );
                })}
            </SheetDataSection>
          </AdvancementSection>
        )}

        {activeCareerSubtab === "skills" && (
          <AdvancementSection title="Skills" hideHeader>
            <div className="flex flex-col gap-3">
              {filteredAdvancementSkillSections.map((section) => (
                <SheetDataSection
                  key={section.id}
                  gridClassName={skillAdvanceGridClass}
                  sectionLabel={section.title}
                  valueLabels={[
                    { align: "center", className: "hidden md:block", label: "Initial" },
                    { align: "center", label: "Advance" },
                    { align: "center", label: "More" },
                  ]}
                >
                    {section.skills.length === 0 ? (
                      <SheetEmptyState title={`No ${section.title.toLowerCase()} skills`}>
                        No skills listed for this section.
                      </SheetEmptyState>
                    ) : (
                      section.skills.map((skillRow) => {
                        const advanceDraftValue =
                          skillAdvanceDrafts[skillRow.skillName] ?? skillRow.baseAdvances;
                        const initialDisplay =
                          skillRow.baseCharacteristicValue === 0
                            ? "-"
                            : skillRow.baseCharacteristicValue;
                        const advancesControl = (
                          <input
                            type="number"
                            min={0}
                            value={advanceDraftValue}
                            onChange={(event) =>
                              setSkillAdvanceDrafts((prev) => ({
                                ...prev,
                                [skillRow.skillName]: parseDraftNumber(event.target.value),
                              }))
                            }
                            className="h-6 w-11 rounded border border-white/10 bg-black/40 px-1 text-center font-mono text-[11px] text-white"
                            aria-label={`Advances for ${skillRow.skillName}`}
                          />
                        );

                        return (
                          <SheetDataAccordionRow
                            key={skillRow.skillName}
                            className="group"
                            summaryClassName={`${skillAdvanceGridClass} gap-0 ${advanceRowInsetClass}`}
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
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    setSkillAdvanceDrafts((prev) => ({
                                      ...prev,
                                      [skillRow.skillName]: Math.max(
                                        0,
                                        (prev[skillRow.skillName] ?? skillRow.baseAdvances) - 1,
                                      ),
                                    }));
                                  }}
                                  disabled={advanceDraftValue <= 0}
                                  className="wfrp-stepper-btn focus-visible:ring-wfrp-red/50"
                                  aria-label={`Decrease skill advances for ${skillRow.skillName}`}
                                >
                                  <span className="wfrp-stepper-btn__inner">
                                    <Minus size={10} />
                                  </span>
                                </button>
                                {advancesControl}
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.preventDefault();
                                    setSkillAdvanceDrafts((prev) => ({
                                      ...prev,
                                      [skillRow.skillName]: (prev[skillRow.skillName] ?? skillRow.baseAdvances) + 1,
                                    }));
                                  }}
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
                              description={`${skillRow.skillName} can be edited directly.`}
                              rows={[
                                { label: "Initial", value: initialDisplay },
                                { label: "Characteristic", value: skillRow.characteristicKey || "-" },
                                { label: "Advances", value: advancesControl },
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

        {activeCareerSubtab === "talents" && (
          <AdvancementSection title="Talents" hideHeader>
            <SheetDataSection
              gridClassName={talentAdvanceGridClass}
              sectionLabel="Talents"
              valueLabels={[
                { align: "center", label: "Max" },
                { align: "center", label: "Taken" },
                { align: "center", label: "More" },
              ]}
            >
                {filteredAdvancementTalentNames.map((talentName) => {
                  const takenCount = characterTalents.filter(
                    (talent) => talent.name === talentName,
                  ).length;
                  const maxDisplay = getTalentMaxDisplayByName(talentName);
                  const takenControl = (
                    <input
                      type="number"
                      min={0}
                      value={takenCount}
                      onChange={(event) =>
                        updateTalentTaken(talentName, parseDraftNumber(event.target.value))
                      }
                      className="h-6 w-11 rounded border border-white/10 bg-black/40 px-1 text-center font-mono text-[11px] text-white"
                      aria-label={`Taken count for ${talentName}`}
                    />
                  );

                  return (
                    <SheetDataAccordionRow
                      key={talentName}
                      className="group"
                      summaryClassName={`${talentAdvanceGridClass} gap-0 ${advanceRowInsetClass}`}
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
                          {maxDisplay}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              updateTalentTaken(talentName, takenCount - 1);
                            }}
                            disabled={takenCount === 0}
                            className="wfrp-stepper-btn focus-visible:ring-wfrp-red/50"
                            aria-label={`Decrease talent purchases for ${talentName}`}
                          >
                            <span className="wfrp-stepper-btn__inner">
                              <Minus size={10} />
                            </span>
                          </button>
                          {takenControl}
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              purchaseTalent(talentName);
                            }}
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
                        description={`${talentName} can be edited directly.`}
                        rows={[
                          { label: "Max", value: maxDisplay },
                          { label: "Taken", value: takenControl },
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
});
