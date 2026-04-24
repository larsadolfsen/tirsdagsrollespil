import type {
  MeleeWeaponGroup,
  RangedWeaponGroup,
  WeaponAvailability,
} from "../../../types";

export type WeaponPropertyKind = "quality" | "flaw";

export type WeaponPropertyValueType = "none" | "number";

export interface WeaponPropertyDefinition {
  id: string;
  name: string;
  kind: WeaponPropertyKind;
  valueType: WeaponPropertyValueType;
  description: string;
}

export interface WeaponPropertyReference {
  propertyId: string;
  value?: number;
}

interface WeaponRecordBase {
  id: string;
  name: string;
  groupType: "melee" | "ranged";
  price: string;
  encumbrance: number;
  availability: WeaponAvailability;
  damage: string;
  hands?: 1 | 2;
  qualities: WeaponPropertyReference[];
  flaws: WeaponPropertyReference[];
  description?: string;
  specialRules?: string[];
}

export interface MeleeWeaponDefinition extends WeaponRecordBase {
  type: "melee";
  groupType: "melee";
  group: MeleeWeaponGroup;
  reach: string;
}

export interface RangedWeaponDefinition extends WeaponRecordBase {
  type: "ranged";
  groupType: "ranged";
  group: RangedWeaponGroup;
  range: string;
  ammunitionGroup?: string;
}
