import type { ResolvedCharacterEquipment } from "../../data/characters/resolved";
import {
  formatConsumableName as formatConsumableNameValue,
  getConsumableBaseName as getConsumableBaseNameValue,
  getConsumableCount as getConsumableCountValue,
} from "../../lib/consumables";

const PACKS_AND_CONTAINERS_TYPE = "Packs and containers";

export const formatCoinTotalValue = (coins: { gc: number; s: number; d: number }) => {
  const totalBrass = coins.gc * 240 + coins.s * 12 + coins.d;
  const gc = Math.floor(totalBrass / 240);
  const remainingAfterGold = totalBrass % 240;
  const ss = Math.floor(remainingAfterGold / 12);
  const b = remainingAfterGold % 12;
  const parts = [
    gc > 0 ? `${gc}gc` : null,
    ss > 0 ? `${ss}ss` : null,
    b > 0 ? `${b}bp` : null,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(" ") : "0bp";
};

export const getCoinCount = (coins: { gc: number; s: number; d: number }) =>
  coins.gc + coins.s + coins.d;

export const getCoinEncumbrance = (coins: { gc: number; s: number; d: number }) => {
  const coinCount = getCoinCount(coins);
  return coinCount > 0 ? Math.ceil(coinCount / 200) : 0;
};

export const sortEquipmentByName = (items: ResolvedCharacterEquipment[]) =>
  [...items].sort((first, second) => {
    const nameComparison = first.name.localeCompare(second.name, undefined, {
      sensitivity: "base",
    });

    return nameComparison || first.id.localeCompare(second.id);
  });

export const getConsumableCount = (item: ResolvedCharacterEquipment) => {
  return getConsumableCountValue(item);
};

export const getConsumableBaseName = (item: ResolvedCharacterEquipment) =>
  getConsumableBaseNameValue(item);

export const formatConsumableName = (item: ResolvedCharacterEquipment, count: number) =>
  formatConsumableNameValue(item, count);

export const isPacksAndContainersItem = (item: ResolvedCharacterEquipment) =>
  item.type === PACKS_AND_CONTAINERS_TYPE || item.type === "Container";

export const isBackpackContainerItem = (item: ResolvedCharacterEquipment) =>
  isPacksAndContainersItem(item) &&
  (item.itemId === "backpack_item" || item.name.toLowerCase() === "backpack");

export const isWearableInventoryItem = (item: ResolvedCharacterEquipment) =>
  item.type === "Clothing" ||
  item.type === "Jewellery" ||
  item.type === "Jewelry" ||
  item.type === "Armor" ||
  isBackpackContainerItem(item);

export const isWornInventoryItem = (item: ResolvedCharacterEquipment) =>
  !item.containerId &&
  isWearableInventoryItem(item) &&
  (item.type !== "Armor" || item.equipped) &&
  (!isPacksAndContainersItem(item) || item.equipped);

export const getInventoryEncumbrance = (item: ResolvedCharacterEquipment) => {
  const encumbrance = Number(item.encumbrance || 0);
  return isWornInventoryItem(item) ? Math.max(0, encumbrance - 1) : encumbrance;
};
