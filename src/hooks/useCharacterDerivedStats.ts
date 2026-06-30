import { useCallback, useMemo } from "react";
import type {
  ResolvedCharacterEquipment,
  ResolvedCharacterRecord,
} from "../data/characters/resolved";
import { formatCharacterCoins } from "../lib/gameSession";
import {
  getApplicableTalentEffects,
  getTalentEncumbranceBonus,
} from "../lib/talentEffects";
import {
  getCoinEncumbrance,
  getInventoryEncumbrance,
  isPacksAndContainersItem,
  isWornInventoryItem,
  sortEquipmentByName,
} from "../tabs/inventory/inventoryUtils";
import type { ArmourDefinition, ArmourLocation, Ruleset } from "../types";

type EquippedArmour = {
  item: ResolvedCharacterEquipment;
  armour: ArmourDefinition;
  locations: ArmourLocation[];
};

interface UseCharacterDerivedStatsOptions {
  characterData: ResolvedCharacterRecord;
  coinContainerId: string | null;
  equipmentState: ResolvedCharacterEquipment[];
  ruleset: Ruleset;
}

export function useCharacterDerivedStats({
  characterData,
  coinContainerId,
  equipmentState,
  ruleset,
}: UseCharacterDerivedStatsOptions) {
  const attributes = characterData.attributes as Record<string, number>;
  const tb = Math.floor((attributes.T || 0) / 10);
  const wpb = Math.floor((attributes.WP || 0) / 10);
  const sb = Math.floor((attributes.S || 0) / 10);
  const maxCorruption = tb + wpb;

  const formattedCoins = useMemo(
    () => formatCharacterCoins(characterData.coins),
    [characterData.coins],
  );
  const ownedShopItemIds = useMemo(
    () => new Set(equipmentState.map((item) => item.itemId)),
    [equipmentState],
  );
  const coinEncumbrance = getCoinEncumbrance(characterData.coins);
  const totalEncumbrance = equipmentState.reduce((sum, item) => {
    if (item.containerId) return sum;
    return sum + getInventoryEncumbrance(item);
  }, coinContainerId ? 0 : coinEncumbrance);
  const talentEncumbranceBonus = getTalentEncumbranceBonus(
    getApplicableTalentEffects({
      talents: characterData.talents,
      talentDefinitions: ruleset.talents,
    }),
  );
  const carryCapacity = Math.max(sb + tb + talentEncumbranceBonus, 1);
  const encumbrancePercent = Math.min((totalEncumbrance / carryCapacity) * 100, 100);
  const containers = equipmentState.filter(
    (item) => isPacksAndContainersItem(item) && !item.containerId,
  );
  const wornItems = sortEquipmentByName(equipmentState.filter(isWornInventoryItem));
  const carriedItems = sortEquipmentByName(
    equipmentState.filter(
      (item) => !item.containerId && !isWornInventoryItem(item),
    ),
  );

  const itemDefinitionsById = useMemo(
    () => Object.fromEntries(ruleset.items.map((item) => [item.id, item])),
    [ruleset.items],
  );
  const armourDefinitionsById = useMemo(
    () => Object.fromEntries(ruleset.armours.map((armour) => [armour.id, armour])),
    [ruleset.armours],
  );

  const getItemArmour = useCallback(
    (item: ResolvedCharacterEquipment): EquippedArmour | null => {
      const definition = itemDefinitionsById[item.itemId];
      const armourId = item.armourId ?? definition?.armourId;
      if (!armourId) return null;

      const armour = armourDefinitionsById[armourId];
      const locations = item.armourLocations ?? definition?.armourLocations ?? armour?.locations;
      return armour && locations ? { item, armour, locations } : null;
    },
    [armourDefinitionsById, itemDefinitionsById],
  );

  const isSoftLeather = (armour: ArmourDefinition) => armour.category === "soft_leather";
  const isFlexible = (armour: ArmourDefinition) =>
    armour.qualities.some((quality) => quality.id === "flexible");

  const canLayerArmours = useCallback((first: ArmourDefinition, second: ArmourDefinition) => {
    if (isSoftLeather(first) || isSoftLeather(second)) {
      return !isSoftLeather(first) || !isSoftLeather(second);
    }

    return isFlexible(first) !== isFlexible(second);
  }, []);

  const getArmourFitConflictsForArmour = useCallback(
    (armourToFit: EquippedArmour, fittedArmours: EquippedArmour[]) =>
      fittedArmours.filter((fittedArmour) =>
        armourToFit.locations.some((location) =>
          fittedArmour.locations.includes(location) &&
          !canLayerArmours(armourToFit.armour, fittedArmour.armour),
        ),
      ),
    [canLayerArmours],
  );

  const getFittedArmours = useCallback(
    (items: ResolvedCharacterEquipment[]) =>
      items.reduce<EquippedArmour[]>((fittedArmours, item) => {
        if (!item.equipped) return fittedArmours;

        const armourToFit = getItemArmour(item);
        if (!armourToFit || getArmourFitConflictsForArmour(armourToFit, fittedArmours).length > 0) {
          return fittedArmours;
        }

        return [...fittedArmours, armourToFit];
      }, []),
    [getArmourFitConflictsForArmour, getItemArmour],
  );

  const getArmourFitConflicts = useCallback(
    (itemToFit: ResolvedCharacterEquipment, items: ResolvedCharacterEquipment[]) => {
      const armourToFit = getItemArmour(itemToFit);
      if (!armourToFit) return [];

      return getArmourFitConflictsForArmour(
        armourToFit,
        getFittedArmours(items),
      );
    },
    [getArmourFitConflictsForArmour, getFittedArmours, getItemArmour],
  );

  const equippedArmours = getFittedArmours(equipmentState);
  const armourCoverageTotals = equippedArmours.reduce(
    (totals, { armour, locations }) => {
      locations.forEach((location) => {
        totals[location] += armour.aps;
      });
      return totals;
    },
    { head: 0, arms: 0, body: 0, legs: 0 } as Record<"head" | "arms" | "body" | "legs", number>,
  );
  const armourTotals = {
    head: armourCoverageTotals.head,
    leftArm: armourCoverageTotals.arms,
    rightArm: armourCoverageTotals.arms,
    body: armourCoverageTotals.body,
    leftLeg: armourCoverageTotals.legs,
    rightLeg: armourCoverageTotals.legs,
    shield: 0,
  };
  const equippedArmourNames = equippedArmours.map(({ armour }) => armour.name);

  const getContainerContents = (containerId: string) =>
    sortEquipmentByName(equipmentState.filter((item) => item.containerId === containerId));

  const getContainerUsedEncumbrance = (containerId: string) =>
    getContainerContents(containerId).reduce(
      (sum, item) => sum + Number(item.encumbrance || 0),
      coinContainerId === containerId ? coinEncumbrance : 0,
    );

  return {
    attributes,
    carryCapacity,
    carriedItems,
    containers,
    encumbrancePercent,
    equippedArmourNames,
    formattedCoins,
    getArmourFitConflicts,
    getContainerContents,
    getContainerUsedEncumbrance,
    maxCorruption,
    ownedShopItemIds,
    sb,
    tb,
    totalEncumbrance,
    wornItems,
    armourTotals,
  };
}
