import type { ResolvedCharacterRecord, ResolvedCharacterSkill } from "../../data/characters/resolved";
import type { RollBonusSource, RollHistoryItem, RollState } from "../../types/dice";

export const createInitialRollState = (): RollState => ({
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

export const formatSignedSl = (
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

export const getRollBaseValue = (
  characterData: ResolvedCharacterRecord,
  characterSkills: ResolvedCharacterSkill[],
  state: Pick<RollState, "characteristic"> & { baseValueOverride?: number | null },
) => {
  if (!state.characteristic) return 0;
  if ("baseValueOverride" in state && state.baseValueOverride !== null) return state.baseValueOverride;

  const baseValue = (characterData.attributes[state.characteristic.key] || 0);
  const skill = characterSkills.find((entry) => entry.displayName === state.characteristic?.label);

  return skill ? baseValue + skill.advances : baseValue;
};

export const getTargetBonusTotal = (targetBonusSources: RollBonusSource[]) =>
  targetBonusSources.reduce((sum, bonus) => sum + bonus.value, 0);

export const getRollTarget = (
  characterData: ResolvedCharacterRecord,
  characterSkills: ResolvedCharacterSkill[],
  state: Pick<RollState, "characteristic" | "modifier" | "targetBonusSources"> & {
    baseValueOverride?: number | null;
  },
) => getRollBaseValue(characterData, characterSkills, state) + state.modifier + getTargetBonusTotal(state.targetBonusSources);

export const getDamageTotal = (state: Pick<RollState, "damageBase" | "sl" | "isSuccess">) => {
  if (state.damageBase === null || state.sl === null) return null;
  return state.damageBase + state.sl;
};

export const getHitLocation = (result: number | null) => {
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

export const getIsCritical = (state: Pick<RollState, "testType" | "result" | "isSuccess">) => {
  if (state.testType !== "attack" || state.result === null) return false;
  const criticalRolls = new Set([11, 22, 33, 44, 55, 66, 77, 88, 99]);
  return criticalRolls.has(state.result);
};

export const getBonusTotal = (bonusSources: RollBonusSource[]) =>
  bonusSources.reduce((sum, bonus) => sum + bonus.value, 0);

export const normalizeD100Roll = (roll: number) => (roll === 0 ? 100 : roll);

export const calculateRollResult = ({
  bonusSources,
  roll,
  target,
}: {
  bonusSources: RollBonusSource[];
  roll: number;
  target: number;
}) => {
  const finalRoll = normalizeD100Roll(roll);

  let success = finalRoll <= target;
  if (finalRoll <= 5) success = true;
  if (finalRoll >= 96) success = false;

  const targetTens = Math.floor(target / 10);
  const rollTens = Math.floor(finalRoll / 10);
  const rawSl = targetTens - rollTens;
  const totalBonus = getBonusTotal(bonusSources);
  const sl = rawSl + totalBonus;

  return {
    finalRoll,
    isSuccess: totalBonus !== 0 ? sl >= 0 : success,
    rawSl,
    sl,
  };
};

export const getTestTypeTitle = (testType: RollState["testType"] | RollHistoryItem["testType"]) => {
  if (testType === "attack") return "Attack Test";
  if (testType === "channeling") return "Channeling Test";
  if (testType === "corruption") return "Corruption Test";
  return "Dramatic Test";
};

export const getOutcome = (sl: number, isSuccess: boolean) => {
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

export const getDifficultyLabel = (modifier: number) => {
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

export const createRollHistoryItem = ({
  getTarget,
  labelSuffix,
  state,
}: {
  getTarget: (state: RollState) => number;
  labelSuffix?: string;
  state: RollState;
}): RollHistoryItem | null => {
  if (!state.characteristic || state.result === null) return null;

  return {
    id: Math.random().toString(36).substring(2, 9),
    label: `${state.characteristic.label}${labelSuffix ?? ""}`,
    title: state.title ? `${state.title}${labelSuffix ?? ""}` : null,
    testType: state.testType,
    result: state.result,
    sl: state.sl || 0,
    isSuccess: state.isSuccess || false,
    modifier: state.modifier,
    targetBonusSources: state.targetBonusSources,
    target: getTarget(state),
    damage: getDamageTotal(state),
    hitLocation: state.testType === "attack" ? getHitLocation(state.result) : null,
    isCritical: getIsCritical(state),
  };
};
