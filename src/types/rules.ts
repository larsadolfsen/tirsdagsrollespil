export type RulesTextDefinition = {
  id: string;
  name: string;
  description: string;
};

export type TalentEffect =
  | {
      type: "test_sl_bonus";
      test: string;
      valuePerLevel: number;
      condition?: string;
    }
  | {
      type: "test_reverse_failed_roll";
      test: string;
      condition?: string;
    }
  | {
      type: "attribute_bonus";
      attribute: string;
      valuePerLevel: number;
      condition?: string;
    }
  | {
      type: "damage_bonus";
      valuePerLevel: number;
      condition?: string;
    }
  | {
      type: "ignore_penalty";
      penalty: string;
      condition?: string;
    }
  | {
      type: "action_unlock";
      action: string;
      condition?: string;
    }
  | {
      type: "special_rule";
      rule: string;
    };

export type SkillType = "basic" | "advanced";

export interface SkillDefinition extends RulesTextDefinition {
  type: SkillType;
  grouped?: boolean;
  specialisationLabel?: string;
}

export interface SkillSpecialisationDefinition {
  id: string;
  skillId: string;
  name: string;
}

export interface ActionDefinition extends RulesTextDefinition {}

export interface PropertyDefinition extends RulesTextDefinition {}

export interface TalentDefinition extends RulesTextDefinition {
  max: string;
  tests?: string;
  effects?: TalentEffect[];
}

export interface SpellDefinition extends RulesTextDefinition {
  category: "petty" | "arcane" | "school";
  school?: string;
  schools?: string[];
  cn: number;
  range: string;
  target: string;
  duration: string;
  damage: string;
}

export interface ItemDefinition extends RulesTextDefinition {
  type: string;
  encumbrance: number;
  value: number;
  currency: string;
  priceLabel?: string;
  availability?: Availability;
  carries?: number;
  weaponId?: string;
  armourId?: string;
  armourLocations?: ArmourLocation[];
}

export type Availability = "common" | "average" | "scarce" | "rare" | "exotic" | "n/a";

export type ArmourLocation = "head" | "arms" | "body" | "legs";

export type ArmourQualityOrFlawInstance = {
  id: string;
  value?: number | string;
};

export type ArmourPenalty = {
  skillId: string;
  value: number;
};

export type ArmourDefinition = {
  id: string;
  name: string;
  category: "soft_leather" | "boiled_leather" | "mail" | "plate";
  price: string;
  encumbrance: number;
  availability: Availability;
  locations: ArmourLocation[];
  aps: number;
  penalties: ArmourPenalty[];
  qualities: ArmourQualityOrFlawInstance[];
  flaws: ArmourQualityOrFlawInstance[];
  notes?: string[];
};

export type MeleeWeaponGroup =
  | "basic"
  | "brawling"
  | "cavalry"
  | "fencing"
  | "flail"
  | "parry"
  | "polearm"
  | "two_handed";

export type RangedWeaponGroup =
  | "blackpowder"
  | "bow"
  | "crossbow"
  | "engineering"
  | "entangling"
  | "explosives"
  | "sling"
  | "throwing";

export type WeaponAvailability = "common" | "average" | "scarce" | "rare" | "exotic" | "n/a";

export interface WeaponPrice {
  value: number;
  currency: string;
  label?: string;
}

export interface WeaponDefinitionBase extends RulesTextDefinition {
  type: "melee_weapon" | "ranged_weapon";
  groupType: "melee" | "ranged";
  price: WeaponPrice;
  encumbrance: number;
  availability: WeaponAvailability;
  damage: string;
  hands?: 1 | 2;
  qualities: string[];
  flaws: string[];
  specialRules: string[];
}

export interface MeleeWeaponDefinition extends WeaponDefinitionBase {
  type: "melee_weapon";
  groupType: "melee";
  group: MeleeWeaponGroup;
  reach: string;
}

export interface RangedWeaponDefinition extends WeaponDefinitionBase {
  type: "ranged_weapon";
  groupType: "ranged";
  group: RangedWeaponGroup;
  range: string;
}

export type WeaponDefinition = MeleeWeaponDefinition | RangedWeaponDefinition;

export interface CareerRankDefinition {
  rank: number;
  name: string;
  status: string;
}

export interface CareerCharacteristicAdvanceDefinition {
  characteristic: string;
  availableFromRank: number;
}

export interface CareerDefinition {
  id: string;
  name: string;
  tier: string;
  skillIds: string[];
  talentIds: string[];
  characteristicAdvances: CareerCharacteristicAdvanceDefinition[];
  ranks: CareerRankDefinition[];
}

export interface CareerPathDefinition {
  id: string;
  name: string;
  classId: string;
  speciesIds: string[];
  stepIds: string[];
}

export interface CareerStepDefinition {
  id: string;
  careerPathId: string;
  rank: number;
  name: string;
  status: string;
  characteristicAdvances: CareerCharacteristicAdvanceDefinition[];
  skillIds: string[];
  talentIds: string[];
  trappingIds: string[];
}

export interface RaceDefinition {
  id: string;
  name: string;
  attributeRolls: Record<string, string>;
  woundsFormula: string;
  fate: number;
  resilience: number;
  extraPoints: number;
  movement: number;
}

export interface Ruleset {
  id: string;
  name: string;
  races: RaceDefinition[];
  skills: SkillDefinition[];
  skillSpecialisations: SkillSpecialisationDefinition[];
  actions: ActionDefinition[];
  properties: PropertyDefinition[];
  talents: TalentDefinition[];
  spells: SpellDefinition[];
  items: ItemDefinition[];
  weapons: WeaponDefinition[];
  armours: ArmourDefinition[];
  careers: CareerDefinition[];
}
