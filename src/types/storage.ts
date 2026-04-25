export interface CharacterProgressData {
  woundsCurrent: number;
  corruptionCurrent: number;
  fateCurrent?: number;
  fortuneCurrent: number;
  resilienceCurrent?: number;
  resolveCurrent?: number;
  xpCurrent: number;
  xpBaselineTotal?: number;
  careerCurrentRank?: number;
  characteristicAdvances?: Record<string, number>;
  skills: Record<string, number>;
  talentIds?: string[];
  equipment: Record<string, boolean>;
  equipmentContainers?: Record<string, string | null>;
  removedEquipmentIds?: string[];
}
