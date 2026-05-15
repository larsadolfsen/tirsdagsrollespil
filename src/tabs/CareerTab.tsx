import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Minus, Plus } from "lucide-react";
import { AdvancementSection, InlineSubtabs } from "../components/ui";
import type { ActiveInfoState } from "../components/appTypes";
import { useGameSessionContext } from "../context/GameSessionContext";
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
  const { setXpCurrent, setXpTotal } = useGameSessionContext();
  const currentCareerRow =
    displayedCareerRankRecord ??
    characterData.careerRecord.ranks.find((rank) => rank.rank === displayedCareerRank) ??
    null;
  const careerRows = currentCareerRow ? [currentCareerRow] : [];
  const canRemove10Xp = characterData.xpTotal >= 10;
  const canRemove100Xp = characterData.xpTotal >= 100;
  const adjustXp = (amount: number) => {
    setXpCurrent((current) => Math.max(0, current + amount));
    setXpTotal((current) => Math.max(0, current + amount));
  };

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

  const parseDraftNumber = (value: string) => Math.max(0, Math.floor(Number(value) || 0));

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="sticky top-0 z-10 bg-wfrp-bg">
        <InlineSubtabs<CareerSubtab>
          options={careerSubtabOptions}
          activeId={activeCareerSubtab}
          onChange={setActiveCareerSubtab}
          ariaLabel="Career section tabs"
        />
      </div>

      <div className="border-b border-white/5 bg-wfrp-bg px-2 py-2 sm:px-3 lg:px-4">
        <div className="flex gap-2 pb-2">
          <button
            onClick={isAdvancementEditMode ? cancelAdvancementEdit : beginAdvancementEdit}
            className="wfrp-action-btn h-8 px-3 text-[10px] font-black uppercase tracking-widest text-gray-300"
            aria-label={isAdvancementEditMode ? "Cancel advancement edits" : "Edit initial and advances"}
          >
            {isAdvancementEditMode ? "Cancel" : "Edit"}
          </button>
          <button
            onClick={handleSaveCareerClick}
            disabled={!hasPendingCareerChanges && !isAdvancementEditMode}
            className="wfrp-action-btn h-8 px-3 text-[10px] font-black uppercase tracking-widest text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Save career changes"
          >
            Save
          </button>
        </div>
        <div className="wfrp-subpanel-shell flex min-w-0 flex-col">
          <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_72px_72px_minmax(150px,auto)] items-center gap-2 lg:gap-3">
            <span className="wfrp-table-label text-left">XP</span>
            <span className="wfrp-table-label text-center">Current</span>
            <span className="wfrp-table-label text-center">Total</span>
            <span className="wfrp-table-label text-right">Adjust</span>
          </div>
          <div className="divide-y divide-white/5">
            <div className="grid grid-cols-[minmax(0,1fr)_72px_72px_minmax(150px,auto)] items-center gap-2 lg:gap-3 wfrp-table-row">
              <div className="wfrp-list-cell-strong text-left">Experience</div>
              <div className="wfrp-list-cell-strong text-center font-mono text-white">
                {pendingAvailableXp}
              </div>
              <div className="wfrp-list-cell-strong text-center font-mono">
                {characterData.xpTotal}
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {canRemove100Xp && (
                  <button
                    onClick={() => adjustXp(-100)}
                    className="wfrp-stepper-btn w-auto px-2 text-[10px] font-black"
                    aria-label="Remove 100 current and total XP"
                  >
                    -100
                  </button>
                )}
                {canRemove10Xp && (
                  <button
                    onClick={() => adjustXp(-10)}
                    className="wfrp-stepper-btn w-auto px-2 text-[10px] font-black"
                    aria-label="Remove 10 current and total XP"
                  >
                    -10
                  </button>
                )}
                <button
                  onClick={() => adjustXp(10)}
                  className="wfrp-stepper-btn w-auto px-2 text-[10px] font-black"
                  aria-label="Add 10 current and total XP"
                >
                  +10
                </button>
                <button
                  onClick={() => adjustXp(100)}
                  className="wfrp-stepper-btn w-auto px-2 text-[10px] font-black"
                  aria-label="Add 100 current and total XP"
                >
                  +100
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2 space-y-4 no-scrollbar">
        {(activeCareerSubtab === "all" || activeCareerSubtab === "careers") && (
          <AdvancementSection title="Careers" meta="Current Path" hideHeader>
            <div className="wfrp-subpanel-shell flex flex-col">
              <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_minmax(180px,1.4fr)_minmax(0,1fr)_62px_74px] gap-2 lg:gap-3 items-center">
                <span className="wfrp-table-label text-left">Careers</span>
                <span className="wfrp-table-label text-left">Progress</span>
                <span className="wfrp-table-label text-left">Tier</span>
                <span className="wfrp-table-label text-center">Cost</span>
                <span className="wfrp-table-label text-right">Advance</span>
              </div>
              <div className="divide-y divide-white/5">
                {careerRows.map((rankRecord) => {
                  const isActiveCareerRow = rankRecord.rank === displayedCareerRank;
                  const rowProgress = isActiveCareerRow ? advancementProgress : 100;

                  return (
                    <div
                      key={rankRecord.rank}
                      className="grid grid-cols-[minmax(0,1fr)_minmax(180px,1.4fr)_minmax(0,1fr)_62px_74px] items-center gap-2 lg:gap-3 wfrp-table-row"
                    >
                      <div className="min-w-0">
                        <button
                          onClick={() => {
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
                      <div className="min-w-0">
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
                      <div className="wfrp-list-cell-strong text-left truncate">
                        {rankRecord.name}
                      </div>
                      <div className="wfrp-list-cell-strong text-center font-mono">
                        {isActiveCareerRow ? nextCareerAdvanceCost ?? "-" : "-"}
                      </div>
                      <div className="flex justify-end">
                        {isActiveCareerRow ? (
                          <button
                            onClick={increasePendingCareerRank}
                            disabled={
                              !nextCareerRankRecord ||
                              nextCareerAdvanceCost === null ||
                              pendingAvailableXp < nextCareerAdvanceCost
                            }
                            className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={`Advance ${characterData.career} from rank ${rankRecord.rank}`}
                            title="Advance career"
                          >
                            <Plus size={12} />
                          </button>
                        ) : (
                          <span className="wfrp-list-cell text-right" aria-label="Read-only career rank">
                            -
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AdvancementSection>
        )}

        {(activeCareerSubtab === "all" || activeCareerSubtab === "characteristics") && (
          <AdvancementSection title="Characteristics" meta="Scaffolded" hideHeader>
            <div className="wfrp-subpanel-shell flex flex-col">
              <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_64px_72px_62px_74px] gap-2 lg:gap-3 items-center">
                <span className="wfrp-table-label text-left">Characteristics</span>
                <span className="wfrp-table-label text-left">Initial</span>
                <span className="wfrp-table-label text-center">Advances</span>
                <span className="wfrp-table-label text-center">Cost</span>
                <span className="wfrp-table-label text-right">Advance</span>
              </div>
              <div className="divide-y divide-white/5">
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

                  return (
                    <div
                      key={item.key}
                      className={`grid grid-cols-[minmax(0,1fr)_64px_72px_62px_74px] items-center gap-2 lg:gap-3 wfrp-table-row ${
                        !isAvailable ? "opacity-70" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <button
                          onClick={() => {
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
                          className="wfrp-skill-link truncate text-left"
                        >
                          {item.label} ({item.key})
                        </button>
                      </div>
                      <div className="wfrp-list-cell-strong text-left font-mono">
                        {isAdvancementEditMode ? (
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
                        )}
                      </div>
                      <div className="wfrp-list-cell-strong text-center font-mono">
                        {isAdvancementEditMode ? (
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
                        )}
                      </div>
                      <div className="wfrp-list-cell-strong text-center font-mono">
                        {isAvailable ? nextCharacteristicCost : "-"}
                      </div>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => removePendingCharacteristicAdvance(item.key)}
                          disabled={item.pendingAdvances === 0 || !isAvailable}
                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-wfrp-red/50"
                          aria-label={`Decrease ${item.label}`}
                        >
                          <Minus size={10} />
                        </button>
                        <button
                          onClick={() => purchaseCharacteristicAdvance(item.key)}
                          disabled={!isAvailable || pendingAvailableXp < nextCharacteristicCost}
                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-green-600/50"
                          aria-label={`Increase ${item.label}`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AdvancementSection>
        )}

        {(activeCareerSubtab === "all" || activeCareerSubtab === "skills") && (
          <AdvancementSection title="Skills" hideHeader>
            <div className="flex flex-col gap-3">
              {advancementSkillSections.map((section) => (
                <div key={section.id} className="wfrp-subpanel-shell flex flex-col">
                  <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_56px_62px_62px_74px] gap-2 lg:gap-3 items-center">
                    <span className="wfrp-table-label text-left">{section.title}</span>
                    <span className="wfrp-table-label text-center">Initial</span>
                    <span className="wfrp-table-label text-center">Advances</span>
                    <span className="wfrp-table-label text-center">Cost</span>
                    <span className="wfrp-table-label text-right">Advance</span>
                  </div>
                  <div className="divide-y divide-white/5">
                    {section.skills.length === 0 ? (
                      <div className="px-3 py-4 text-[10px] italic text-gray-600">
                        No {section.title.toLowerCase()} skills listed.
                      </div>
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

                        return (
                          <div
                            key={skillRow.skillName}
                            className={`grid grid-cols-[minmax(0,1fr)_56px_62px_62px_74px] items-center gap-2 lg:gap-3 wfrp-table-row group ${
                              !skillRow.isCareerSkill ? "opacity-70" : ""
                            }`}
                          >
                            <div className="min-w-0">
                              <button
                                onClick={() => {
                                  setActiveInfo({ type: "skill", name: skillRow.skillName });
                                  clearRollCharacteristic();
                                }}
                                className="wfrp-skill-link truncate text-left"
                              >
                                {skillRow.skillName} ({skillRow.characteristicKey || "-"})
                              </button>
                            </div>
                            <div className="wfrp-list-cell-strong text-center font-mono">
                              {skillRow.baseCharacteristicValue === 0
                                ? "-"
                                : skillRow.baseCharacteristicValue}
                            </div>
                            <div className="wfrp-list-cell-strong text-center font-mono">
                              {isAdvancementEditMode ? (
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
                              )}
                            </div>
                            <div className="wfrp-list-cell-strong text-center font-mono">
                              {skillRow.isCareerSkill ? skillRow.nextSkillCost : "-"}
                            </div>
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={() => removePendingSkillAdvance(skillRow.skillName)}
                                disabled={skillRow.pendingAdvances === 0 || !skillRow.isCareerSkill}
                                className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-wfrp-red/50"
                                aria-label={`Decrease skill advances for ${skillRow.skillName}`}
                              >
                                <Minus size={10} />
                              </button>
                              <button
                                onClick={() => purchaseSkillAdvance(skillRow.skillName)}
                                disabled={!canPurchase}
                                className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-green-600/50"
                                aria-label={`Advance skill ${skillRow.skillName}`}
                              >
                                <Plus size={12} />
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              ))}
            </div>
          </AdvancementSection>
        )}

        {(activeCareerSubtab === "all" || activeCareerSubtab === "talents") && (
          <AdvancementSection title="Talents" hideHeader>
            <div className="wfrp-subpanel-shell flex flex-col">
              <div className="wfrp-subpanel-header grid grid-cols-[minmax(0,1fr)_72px_62px_74px] gap-2 lg:gap-3 items-center">
                <span className="wfrp-table-label text-left">Talents</span>
                <span className="wfrp-table-label text-center">Taken</span>
                <span className="wfrp-table-label text-center">Cost</span>
                <span className="wfrp-table-label text-right">Advance</span>
              </div>
              <div className="divide-y divide-white/5">
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
                    <div
                      key={talentName}
                      className={`grid grid-cols-[minmax(0,1fr)_72px_62px_74px] items-center gap-2 lg:gap-3 wfrp-table-row group ${
                        !isCareerTalent && takenCount === 0 ? "opacity-70" : ""
                      }`}
                    >
                      <div className="min-w-0">
                        <button
                          onClick={() => openTalentInfo(talentName)}
                          className="wfrp-skill-link truncate text-left"
                        >
                          {talentName}
                        </button>
                      </div>
                      <div className="wfrp-list-cell-strong text-center font-mono">
                        {takenDisplay}
                      </div>
                      <div className="wfrp-list-cell-strong text-center font-mono">
                        {isCareerTalent ? nextTalentCost : "-"}
                      </div>
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => removePendingTalentPurchase(talentName)}
                          disabled={pendingTakenCount === 0}
                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-wfrp-red/50"
                          aria-label={`Decrease talent purchases for ${talentName}`}
                        >
                          <Minus size={10} />
                        </button>
                        <button
                          onClick={() => purchaseTalent(talentName)}
                          disabled={!canPurchase}
                          className="wfrp-stepper-btn disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-green-600/50"
                          aria-label={`Purchase talent ${talentName}`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </AdvancementSection>
        )}
      </div>
    </div>
  );
}
