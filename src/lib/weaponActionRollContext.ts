const offensiveWeaponProperties = new Set([
  "Damaging",
  "Distract",
  "Entangle",
  "Fast",
  "Hack",
  "Impact",
  "Impale",
  "Imprecise",
  "Penetrating",
  "Precise",
  "Pummel",
  "Slow",
  "Tiring",
  "Undamaging",
  "Unbreakable",
  "Wrap",
]);

const defensiveWeaponProperties = new Set([
  "Defensive",
  "Shield",
  "Trap Blade",
  "Unbreakable",
]);

export const getRelevantWeaponPropertiesForAction = (
  actionId: string,
  weaponProperties: string[],
) => {
  if (actionId === "attack" || actionId === "charge") {
    return weaponProperties.filter((property) => offensiveWeaponProperties.has(property));
  }

  if (actionId === "parry") {
    return weaponProperties.filter(
      (property) =>
        defensiveWeaponProperties.has(property) || property.startsWith("Shield"),
    );
  }

  return [];
};

export const buildWeaponActionRollContext = (
  actionId: string,
  weaponProperties: string[],
) => ({
  actionId,
  weaponProperties: getRelevantWeaponPropertiesForAction(actionId, weaponProperties),
});
