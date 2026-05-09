import type { Characteristic } from "../types";

export interface RollHistoryItem {
  id: string;
  label: string;
  result: number;
  sl: number;
  isSuccess: boolean;
  modifier: number;
  target: number;
  damage?: number | null;
}

export interface RollState {
  characteristic: Characteristic | null;
  modifier: number;
  result: number | null;
  isSuccess: boolean | null;
  sl: number | null;
  isRolling: boolean;
  damageBase: number | null;
  actionId?: string | null;
  weaponProperties?: string[];
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
