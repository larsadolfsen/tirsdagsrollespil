export interface CharacterSkillRecord {
  skillId: string;
  specialisationId?: string;
  advances: number;
}

export interface CharacterEquipmentRecord {
  id: string;
  itemId: string;
  equipped: boolean;
  containerId?: string | null;
}

export interface CharacterTalentRecord {
  talentId: string;
}

export interface CharacterSpellRecord {
  spellId: string;
}

export interface CharacterCareerRecord {
  careerId: string;
  currentRank: number;
}

export interface CharacterCoins {
  gc: number;
  s: number;
  d: number;
}

export interface CharacterRecord {
  id: string;
  campaignId: string;
  rulesetId: string;
  name: string;
  aka?: string[];
  race: string;
  career: CharacterCareerRecord;
  wounds: {
    current: number;
    max: number;
    temp: number;
  };
  fate: number;
  fortune: number;
  resilience: number;
  resolve: number;
  move: number;
  corruption: number;
  xpTotal: number;
  coins: CharacterCoins;
  attributes: Record<string, number>;
  characteristicAdvances?: Record<string, number>;
  skills: CharacterSkillRecord[];
  equipment: CharacterEquipmentRecord[];
  talents: CharacterTalentRecord[];
  spells: CharacterSpellRecord[];
}
