import type { ResolvedCharacterEquipment } from "../data/characters/resolved";

const CONSUMABLE_COUNT_PATTERN = /\s*\((\d+)\)\s*$/;

export const isConsumableItem = (item: Pick<ResolvedCharacterEquipment, "type">) =>
  item.type === "Consumable";

export const getConsumableCountFromName = (name: string) => {
  const match = name.match(CONSUMABLE_COUNT_PATTERN);
  return match ? Number(match[1]) : null;
};

export const getConsumableBaseNameFromName = (name: string) =>
  name.replace(CONSUMABLE_COUNT_PATTERN, "");

export const getConsumableCount = (
  item: Pick<ResolvedCharacterEquipment, "type" | "name" | "quantity">,
) => {
  if (!isConsumableItem(item)) return null;

  return item.quantity ?? getConsumableCountFromName(item.name) ?? 1;
};

export const getConsumableBaseName = (
  item: Pick<ResolvedCharacterEquipment, "type" | "name">,
) => isConsumableItem(item) ? getConsumableBaseNameFromName(item.name) : item.name;

export const normalizeConsumableName = (
  item: Pick<ResolvedCharacterEquipment, "type" | "name">,
) => isConsumableItem(item) ? getConsumableBaseNameFromName(item.name) : item.name;

export const formatConsumableName = (
  item: Pick<ResolvedCharacterEquipment, "type" | "name">,
  count: number,
) => `${getConsumableBaseName(item)} (${count})`;
