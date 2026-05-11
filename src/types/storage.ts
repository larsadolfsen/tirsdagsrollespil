export interface CharacterProgressData {
  woundsCurrent: number;
  corruptionCurrent: number;
  fateCurrent?: number;
  fortuneCurrent: number;
  resilienceCurrent?: number;
  resolveCurrent?: number;
  xpCurrent: number;
  xpBaselineTotal?: number;
  characterName?: string;
  coins?: {
    gc: number;
    s: number;
    d: number;
  };
  careerCurrentRank?: number;
  characteristicAdvances?: Record<string, number>;
  skills: Record<string, number>;
  talentIds?: string[];
  spellIds?: string[];
  equipment: Record<string, boolean>;
  equipmentContainers?: Record<string, string | null>;
  consumableCounts?: Record<string, number>;
  addedEquipment?: Array<{
    id: string;
    itemId: string;
    equipped: boolean;
    containerId?: string | null;
  }>;
  removedEquipmentIds?: string[];
  backgroundText?: string;
  notes?: CharacterNoteData[];
}

export interface CharacterNoteData {
  id: string;
  title?: string;
  text: string;
  createdAt: string;
}
