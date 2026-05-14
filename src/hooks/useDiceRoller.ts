import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  ResolvedCharacterRecord,
  ResolvedCharacterSkill,
  ResolvedCharacterTalent,
} from "../data/characters/resolved";
import { getApplicableTalentEffects, getTalentSlBonus } from "../lib/talentEffects";
import type { ActiveInfoState } from "../components/appTypes";
import type { Characteristic, Ruleset } from "../types";
import type { RollBonusSource, RollHistoryItem, RollState } from "../types/dice";

const createInitialRollState = (): RollState => ({
  characteristic: null,
  title: null,
  baseValueOverride: null,
  testType: "dramatic",
  modifier: 0,
  targetBonusSources: [],
  result: null,
  isSuccess: null,
  rawSl: null,
  sl: null,
  isRolling: false,
  damageBase: null,
  bonusSources: [],
  fortuneActionUsed: false,
});

interface UseDiceRollerOptions {
  characterData: ResolvedCharacterRecord;
  characterSkills: ResolvedCharacterSkill[];
  characterTalents: ResolvedCharacterTalent[];
  fortuneCurrent: number;
  resilienceCurrent: number;
  ruleset: Ruleset;
  setActiveInfo: Dispatch<SetStateAction<ActiveInfoState | null>>;
  setFortuneCurrent: Dispatch<SetStateAction<number>>;
  setIsShopOpen: Dispatch<SetStateAction<boolean>>;
  setResilienceCurrent: Dispatch<SetStateAction<number>>;
}

export function useDiceRoller({
  characterData,
  characterSkills,
  characterTalents,
  fortuneCurrent,
  resilienceCurrent,
  ruleset,
  setActiveInfo,
  setFortuneCurrent,
  setIsShopOpen,
  setResilienceCurrent,
}: UseDiceRollerOptions) {
  const [rollHistory, setRollHistory] = useState<RollHistoryItem[]>([]);
  const [isDiceLogOpen, setIsDiceLogOpen] = useState(false);
  const [rollState, setRollState] = useState<RollState>(createInitialRollState);
  const [displayRoll, setDisplayRoll] = useState(0);
  const activeRollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (rollState.isRolling) {
      interval = setInterval(() => {
        setDisplayRoll(Math.floor(Math.random() * 99) + 1);
      }, 40);
    }
    return () => clearInterval(interval);
  }, [rollState.isRolling]);

  useEffect(() => {
    if (rollState.characteristic && rollState.result === null) {
      setTimeout(() => {
        activeRollerRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }
  }, [rollState.characteristic, rollState.result]);

  const resetDiceRoller = useCallback(() => {
    setIsDiceLogOpen(false);
    setRollHistory([]);
    setRollState(createInitialRollState());
  }, []);

  const clearRollCharacteristic = () => {
    setRollState((prev) => ({ ...prev, characteristic: null }));
  };

  const formatSignedSl = (
    value: number,
    zeroSign: "positive" | "negative" | "neutral" = "neutral",
  ) => {
    if (value === 0) {
      if (zeroSign === "positive") return "+0";
      if (zeroSign === "negative") return "-0";
      return "0";
    }

    return value > 0 ? `+${value}` : `${value}`;
  };

  const getRollBaseValue = (state: Pick<RollState, "characteristic"> & { baseValueOverride?: number | null }) => {
    if (!state.characteristic) return 0;
    if ("baseValueOverride" in state && state.baseValueOverride !== null) return state.baseValueOverride;

    const baseValue = (characterData.attributes[state.characteristic.key] || 0);
    const skill = characterSkills.find((entry) => entry.displayName === state.characteristic?.label);

    return skill ? baseValue + skill.advances : baseValue;
  };

  const getTargetBonusTotal = (targetBonusSources: RollBonusSource[]) =>
    targetBonusSources.reduce((sum, bonus) => sum + bonus.value, 0);

  const getRollTarget = (
    state: Pick<RollState, "characteristic" | "modifier" | "targetBonusSources"> & {
      baseValueOverride?: number | null;
    },
  ) => getRollBaseValue(state) + state.modifier + getTargetBonusTotal(state.targetBonusSources);

  const getDamageTotal = (state: Pick<RollState, "damageBase" | "sl" | "isSuccess">) => {
    if (state.damageBase === null || state.sl === null) return null;
    return state.damageBase + state.sl;
  };

  const getHitLocation = (result: number | null) => {
    if (result === null) return null;

    const normalized = result === 100 ? 0 : result;
    const reversed = (normalized % 10) * 10 + Math.floor(normalized / 10);

    if (reversed >= 1 && reversed <= 9) return "Head";
    if (reversed >= 10 && reversed <= 24) return "Left Arm";
    if (reversed >= 25 && reversed <= 44) return "Right Arm";
    if (reversed >= 45 && reversed <= 79) return "Body";
    if (reversed >= 80 && reversed <= 89) return "Left Leg";
    return "Right Leg";
  };

  const getIsCritical = (state: Pick<RollState, "testType" | "result" | "isSuccess">) => {
    if (state.testType !== "attack" || state.result === null) return false;
    const criticalRolls = new Set([11, 22, 33, 44, 55, 66, 77, 88, 99]);
    return criticalRolls.has(state.result);
  };

  const getBonusTotal = (bonusSources: RollBonusSource[]) =>
    bonusSources.reduce((sum, bonus) => sum + bonus.value, 0);

const getTestTypeTitle = (testType: RollState["testType"] | RollHistoryItem["testType"]) => {
  if (testType === "attack") return "Attack Test";
  if (testType === "channeling") return "Channeling Test";
  if (testType === "corruption") return "Corruption Test";
  return "Dramatic Test";
};

  const archiveRoll = (state: RollState, labelSuffix?: string) => {
    if (!state.characteristic || state.result === null) return;

    const historyItem: RollHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      label: `${state.characteristic.label}${labelSuffix ?? ""}`,
      title: state.title ? `${state.title}${labelSuffix ?? ""}` : null,
      testType: state.testType,
      result: state.result,
      sl: state.sl || 0,
      isSuccess: state.isSuccess || false,
      modifier: state.modifier,
      targetBonusSources: state.targetBonusSources,
      target: getRollTarget(state),
      damage: getDamageTotal(state),
      hitLocation: state.testType === "attack" ? getHitLocation(state.result) : null,
      isCritical: getIsCritical(state),
    };

    setRollHistory((prev) => [historyItem, ...prev]);
  };

  const applySlChange = (delta: number) => {
    setRollState((prev) => {
      if (prev.result === null || prev.sl === null) return prev;

      const nextSl = prev.sl + delta;
      return {
        ...prev,
        sl: nextSl,
        isSuccess: nextSl >= 0,
      };
    });
  };

  const handleIWillNotFail = () => {
    if (resilienceCurrent <= 0) return;

    setResilienceCurrent((prev) => prev - 1);
    setRollState((prev) => {
      if (prev.result === null) return prev;

      return {
        ...prev,
        sl: 1,
        isSuccess: true,
      };
    });
  };

  const handleAddSl = () => {
    if (fortuneCurrent <= 0 || rollState.fortuneActionUsed) return;

    setFortuneCurrent((prev) => prev - 1);
    applySlChange(1);
    setRollState((prev) => ({ ...prev, fortuneActionUsed: true }));
  };

  const handleRoll = (
    char: Characteristic,
    damage?: number,
    options?: {
      bonuses?: RollBonusSource[];
      slBonus?: number;
      slBonusLabel?: string | null;
      testType?: RollState["testType"];
      title?: string | null;
      baseValueOverride?: number | null;
    },
  ) => {
    setActiveInfo(null);
    setIsShopOpen(false);
    archiveRoll(rollState);

    const optionBonusSources = options?.bonuses
      ?? (options?.slBonusLabel || options?.slBonus
        ? [{ label: options?.slBonusLabel ?? "Bonus", value: options?.slBonus ?? 0 }]
        : []);
    const talentEffects = getApplicableTalentEffects({
      talents: characterTalents,
      talentDefinitions: ruleset.talents,
      context: { testName: char.label },
    });
    const talentSlBonus = getTalentSlBonus(talentEffects);
    const bonusSources = talentSlBonus === 0
      ? optionBonusSources
      : [
          ...optionBonusSources,
          {
            label: "Talents",
            value: talentSlBonus,
          },
        ];

    setRollState({
      characteristic: char,
      title: options?.title ?? null,
      baseValueOverride: options?.baseValueOverride ?? null,
      testType: options?.testType ?? (damage === undefined ? "dramatic" : "attack"),
      modifier: 0,
      targetBonusSources: [],
      result: null,
      isSuccess: null,
      rawSl: null,
      sl: null,
      isRolling: false,
      damageBase: damage || null,
      bonusSources,
      fortuneActionUsed: false,
    });
  };

  const executeRoll = () => {
    if (!rollState.characteristic) return;

    const baseValue = characterData.attributes[rollState.characteristic.key] || 0;
    const skill = characterSkills.find((skillEntry) => skillEntry.displayName === rollState.characteristic?.label);
    const value = skill ? baseValue + skill.advances : baseValue;

    const target = value + rollState.modifier + getTargetBonusTotal(rollState.targetBonusSources);
    const roll = Math.floor(Math.random() * 100);
    const finalRoll = roll === 0 ? 100 : roll;

    let success = finalRoll <= target;
    if (finalRoll <= 5) success = true;
    if (finalRoll >= 96) success = false;

    const targetTens = Math.floor(target / 10);
    const rollTens = Math.floor(finalRoll / 10);
    const sl = targetTens - rollTens;

    setRollState((prev) => {
      const totalBonus = getBonusTotal(prev.bonusSources);
      const totalSl = sl + totalBonus;
      const finalSuccess = totalBonus !== 0 ? totalSl >= 0 : success;

      return {
        ...prev,
        isRolling: true,
        result: finalRoll,
        isSuccess: finalSuccess,
        rawSl: sl,
        sl: totalSl,
      };
    });

    setTimeout(() => {
      setRollState((prev) => ({ ...prev, isRolling: false }));
    }, 2200);
  };

  const handleReroll = () => {
    if (fortuneCurrent > 0 && !rollState.fortuneActionUsed) {
      setFortuneCurrent((prev) => prev - 1);
      archiveRoll(rollState, " (Original)");
      setRollState((prev) => ({ ...prev, result: null, isRolling: false, fortuneActionUsed: true }));
      setTimeout(() => executeRoll(), 50);
    }
  };

  const handleRollCritical = () => {
    if (!rollState.characteristic || !getIsCritical(rollState)) return;

    archiveRoll(rollState);
    setRollState({
      characteristic: { key: rollState.characteristic.key, label: "Critical" },
      title: "Critical Roll",
      baseValueOverride: 0,
      testType: "dramatic",
      modifier: 0,
      targetBonusSources: [],
      result: null,
      isSuccess: null,
      rawSl: null,
      sl: null,
      isRolling: false,
      damageBase: null,
      bonusSources: [],
      fortuneActionUsed: false,
    });
  };

  const getOutcome = (sl: number, isSuccess: boolean) => {
    if (isSuccess) {
      if (sl >= 6) return "Astounding Success";
      if (sl >= 4) return "Impressive Success";
      if (sl >= 2) return "Success";
      return "Marginal Success";
    }

    if (sl <= -6) return "Astounding Failure";
    if (sl <= -4) return "Impressive Failure";
    if (sl <= -2) return "Failure";
    return "Marginal Failure";
  };

  const getDifficultyLabel = (modifier: number) => {
    switch (modifier) {
      case 60: return "Very Easy";
      case 40: return "Easy";
      case 20: return "Average";
      case 0: return "Challenging";
      case -10: return "Difficult";
      case -20: return "Hard";
      case -30: return "Very Hard";
      default: return modifier > 0 ? "Bonus" : "Penalty";
    }
  };

  const canUseFortuneActions =
    !rollState.isRolling &&
    rollState.result !== null &&
    !rollState.fortuneActionUsed &&
    fortuneCurrent > 0;

  const canUseResilienceAction =
    !rollState.isRolling &&
    rollState.result !== null &&
    resilienceCurrent > 0;

  const canRollCritical =
    !rollState.isRolling &&
    rollState.result !== null &&
    getIsCritical(rollState);

  return {
    activeRollerRef,
    archiveRoll,
    canRollCritical,
    canUseFortuneActions,
    canUseResilienceAction,
    clearRollCharacteristic,
    displayRoll,
    executeRoll,
    formatSignedSl,
    getDamageTotal,
    getDifficultyLabel,
    getHitLocation,
    getIsCritical,
    getOutcome,
    getRollBaseValue,
    getRollTarget,
    getTargetBonusTotal,
    getTestTypeTitle,
    handleAddSl,
    handleIWillNotFail,
    handleReroll,
    handleRoll,
    handleRollCritical,
    isDiceLogOpen,
    resetDiceRoller,
    rollHistory,
    rollState,
    setIsDiceLogOpen,
    setRollHistory,
    setRollState,
  };
}
