export type RollMechanicsInput = {
  result: number | null;
  isSuccess: boolean | null;
  sl: number | null;
  damageBase: number | null;
  actionId?: string | null;
  weaponProperties?: string[];
};

export type AdjustedSlResult = {
  total: number;
  baseSl: number;
  preciseBonus: number;
  imprecisePenalty: number;
};

export type AttackDamageResult = {
  total: number;
  damageSl: number;
  impactDamage: number;
  unitsDie: number;
  hasDamaging: boolean;
  hasImpact: boolean;
};

export type RollFlagResult = {
  isCritical: boolean;
  isFumble: boolean;
  isDouble: boolean;
  hasImpaleCritical: boolean;
  hasDangerousFumble: boolean;
};

export const getTensDie = (result: number) => (result === 100 ? 0 : Math.floor(result / 10));

export const getUnitsDie = (result: number) => (result === 100 ? 0 : result % 10);

export const hasWeaponProperty = (roll: RollMechanicsInput, property: string) =>
  roll.weaponProperties?.includes(property) ?? false;

export const calculateRollFlags = (roll: RollMechanicsInput): RollFlagResult => {
  if (roll.result === null || roll.isSuccess === null) {
    return {
      isCritical: false,
      isFumble: false,
      isDouble: false,
      hasImpaleCritical: false,
      hasDangerousFumble: false,
    };
  }

  const tensDie = getTensDie(roll.result);
  const unitsDie = getUnitsDie(roll.result);
  const isDouble = tensDie === unitsDie;
  const hasImpaleCritical =
    roll.isSuccess && hasWeaponProperty(roll, "Impale") && roll.result % 10 === 0;
  const hasDangerousFumble =
    !roll.isSuccess &&
    hasWeaponProperty(roll, "Dangerous") &&
    (tensDie === 9 || unitsDie === 9);

  return {
    isCritical: (roll.isSuccess && isDouble) || hasImpaleCritical,
    isFumble: (!roll.isSuccess && isDouble) || hasDangerousFumble,
    isDouble,
    hasImpaleCritical,
    hasDangerousFumble,
  };
};

export const calculateAdjustedSl = (roll: RollMechanicsInput): AdjustedSlResult => {
  const baseSl = roll.sl ?? 0;
  const preciseBonus = roll.isSuccess && hasWeaponProperty(roll, "Precise") ? 1 : 0;
  const imprecisePenalty = hasWeaponProperty(roll, "Imprecise") ? 1 : 0;

  return {
    total: baseSl + preciseBonus - imprecisePenalty,
    baseSl,
    preciseBonus,
    imprecisePenalty,
  };
};

export const calculateAttackDamage = (roll: RollMechanicsInput): AttackDamageResult | null => {
  if (!roll.isSuccess || roll.result === null || roll.damageBase === null) {
    return null;
  }

  const unitsDie = getUnitsDie(roll.result);
  const adjustedSl = calculateAdjustedSl(roll);
  const canUseTiringTraits = !hasWeaponProperty(roll, "Tiring") || roll.actionId === "charge";
  const hasDamaging = hasWeaponProperty(roll, "Damaging") && canUseTiringTraits;
  const hasImpact = hasWeaponProperty(roll, "Impact") && canUseTiringTraits;
  const damageSl = hasDamaging ? Math.max(adjustedSl.total, unitsDie) : adjustedSl.total;
  const impactDamage = hasImpact ? unitsDie : 0;

  return {
    total: roll.damageBase + damageSl + impactDamage,
    damageSl,
    impactDamage,
    unitsDie,
    hasDamaging,
    hasImpact,
  };
};

export const getWeaponTraitNotes = (roll: RollMechanicsInput) => {
  if (!roll.weaponProperties?.length || roll.result === null) {
    return [];
  }

  const notes: string[] = [];

  if (roll.isSuccess && hasWeaponProperty(roll, "Hack")) {
    notes.push("Hack: damage a struck piece of armour or shield by 1 point.");
  }

  if (roll.isSuccess && hasWeaponProperty(roll, "Pummel")) {
    notes.push("Pummel: if the hit location is Head, test to inflict Stunned.");
  }

  if (roll.isSuccess && hasWeaponProperty(roll, "Penetrating")) {
    notes.push("Penetrating: ignore all non-metal AP, or ignore 1 point of other armour.");
  }

  if (roll.isSuccess && hasWeaponProperty(roll, "Undamaging")) {
    notes.push("Undamaging: double Armour Points against this hit and do not inflict minimum 1 Wound.");
  }

  if (roll.isSuccess && hasWeaponProperty(roll, "Distract")) {
    notes.push("Distract: you may forgo damage to push the opponent back 1 yard per winning SL.");
  }

  if (roll.isSuccess && hasWeaponProperty(roll, "Entangle")) {
    notes.push("Entangle: target gains Entangled with Strength equal to your Strength Characteristic.");
  }

  if (hasWeaponProperty(roll, "Fast")) {
    notes.push("Fast: may affect attack order and can penalise defenders without Fast.");
  }

  if (hasWeaponProperty(roll, "Slow")) {
    notes.push("Slow: you strike last and defenders gain +1 SL against your attacks.");
  }

  if (hasWeaponProperty(roll, "Wrap")) {
    notes.push("Wrap: Melee Tests opposing this attack suffer -1 SL.");
  }

  if (hasWeaponProperty(roll, "Trap Blade")) {
    notes.push("Trap Blade: if you score a defensive Critical against a bladed weapon, you may try to trap it.");
  }

  if (hasWeaponProperty(roll, "Unbreakable")) {
    notes.push("Unbreakable: this weapon is highly resistant to breaking or losing its edge.");
  }

  return notes;
};
