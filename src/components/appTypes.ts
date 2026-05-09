import type { Characteristic } from "../types";

export interface RollHistoryItem {
  id: string;
  label: string;
  result: number;
  sl: number;
  isSuccess: boolean;
  modifier: number;
  targetBonusSources?: Array<{ label: string; value: number }>;
  target: number;
  damage?: number | null;
  isCritical?: boolean;
  isFumble?: boolean;
}

export interface RollState {
  characteristic: Characteristic | null;
  modifier: number;
  targetBonusSources?: Array<{ label: string; value: number }>;
  result: number | null;
  isSuccess: boolean | null;
  sl: number | null;
  isRolling: boolean;
  damageBase: number | null;
  actionId?: string | null;
  weaponProperties?: string[];
  isCritical?: boolean;
  isFumble?: boolean;
}

export interface ActiveInfoState {
  type:
    | "skill"
    | "equipment"
    | "talent"
    | "spell"
    | "property"
    | "attack"
    | "career"
    | "characteristic";
  name: string;
  extra?: any;
}
