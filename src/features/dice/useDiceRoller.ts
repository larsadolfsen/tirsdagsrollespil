import { useCallback, useEffect, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type {
  ResolvedCharacterRecord,
  ResolvedCharacterSkill,
  ResolvedCharacterTalent,
} from "../../data/characters/resolved";
import { getApplicableTalentEffects, getTalentSlBonusSources } from "../../lib/talentEffects";
import type { ActiveInfoState } from "../../components/appTypes";
import type { Characteristic, Ruleset } from "../../types";
import type { RollBonusSource, RollHistoryItem, RollState } from "../../types/dice";
import {
  calculateRollResult,
  createInitialRollState,
  createRollHistoryItem,
  formatSignedSl,
  getDamageTotal,
  getDifficultyLabel,
  getHitLocation,
  getIsCritical,
  getOutcome,
  getRollBaseValue as getRollBaseValueForCharacter,
  getRollTarget as getRollTargetForCharacter,
  getTargetBonusTotal,
  getTestTypeTitle,
} from "./diceMath";

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

  const getRollBaseValue = (state: Pick<RollState, "characteristic"> & { baseValueOverride?: number | null }) =>
    getRollBaseValueForCharacter(characterData, characterSkills, state);

  const getRollTarget = (
    state: Pick<RollState, "characteristic" | "modifier" | "targetBonusSources"> & {
      baseValueOverride?: number | null;
    },
  ) => getRollTargetForCharacter(characterData, characterSkills, state);

  const archiveRoll = (state: RollState, labelSuffix?: string) => {
    const historyItem = createRollHistoryItem({
      getTarget: getRollTarget,
      labelSuffix,
      state,
    });

    if (!historyItem) return;
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
    const testType = options?.testType ?? (damage === undefined ? "dramatic" : "attack");
    const talentEffects = getApplicableTalentEffects({
      talents: characterTalents,
      talentDefinitions: ruleset.talents,
      context: {
        testName: testType === "corruption" ? "Corruption Test" : char.label,
        testType,
      },
    });
    const talentBonusSources = getTalentSlBonusSources(talentEffects);
    const bonusSources = [...optionBonusSources, ...talentBonusSources];

    setRollState({
      characteristic: char,
      title: options?.title ?? null,
      baseValueOverride: options?.baseValueOverride ?? null,
      testType,
      modifier: 0,
      targetBonusSources: [],
      result: null,
      isSuccess: null,
      rawSl: null,
      sl: null,
      isRolling: false,
      damageBase: damage ?? null,
      bonusSources,
      fortuneActionUsed: false,
    });
  };

  const executeRoll = () => {
    if (!rollState.characteristic) return;

    const target = getRollTarget(rollState);
    const roll = Math.floor(Math.random() * 100);

    setRollState((prev) => {
      const result = calculateRollResult({
        bonusSources: prev.bonusSources,
        roll,
        target,
      });

      return {
        ...prev,
        isRolling: true,
        result: result.finalRoll,
        isSuccess: result.isSuccess,
        rawSl: result.rawSl,
        sl: result.sl,
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
