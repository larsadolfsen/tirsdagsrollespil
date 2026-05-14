import type { Characteristic } from "./index";

export type RollTestType = "dramatic" | "attack" | "channeling" | "corruption";

export interface RollBonusSource {
  label: string;
  value: number;
}

export interface RollHistoryItem {
  id: string;
  label: string;
  title?: string | null;
  testType: RollTestType;
  result: number;
  sl: number;
  isSuccess: boolean;
  modifier: number;
  targetBonusSources: RollBonusSource[];
  target: number;
  damage?: number | null;
  hitLocation?: string | null;
  isCritical?: boolean;
}

export interface RollState {
  characteristic: Characteristic | null;
  title: string | null;
  baseValueOverride: number | null;
  testType: RollTestType;
  modifier: number;
  targetBonusSources: RollBonusSource[];
  result: number | null;
  isSuccess: boolean | null;
  rawSl: number | null;
  sl: number | null;
  isRolling: boolean;
  damageBase: number | null;
  bonusSources: RollBonusSource[];
  fortuneActionUsed: boolean;
}
