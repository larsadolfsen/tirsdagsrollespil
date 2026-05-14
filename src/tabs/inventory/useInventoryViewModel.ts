import { useMemo } from "react";
import type { ResolvedCharacterEquipment, ResolvedCharacterRecord } from "../../data/characters/resolved";
import type { InventoryDragState } from "../../types/inventory";
import type { InventorySubtab } from "../tabTypes";
import {
  formatCoinTotalValue,
  getCoinCount,
  getCoinEncumbrance,
  getConsumableCount,
  getInventoryEncumbrance,
} from "./inventoryUtils";

export type InventorySectionViewModel = {
  id: string;
  title: string;
  subtitle?: string;
  items: ResolvedCharacterEquipment[];
  dropContainerId: string | null;
  alwaysVisible: boolean;
  acceptsDrops?: boolean;
  dropWorn?: boolean;
  dropCarried?: boolean;
};

export type InventoryItemRow = {
  item: ResolvedCharacterEquipment;
  quantity: number;
  encumbrance: string | number;
  value: string;
  mobileDetails: Array<{ label: string; value: string | number }>;
};

export function useInventoryViewModel({
  activeInventorySubtab,
  characterData,
  carriedItems,
  containers,
  formatItemValue,
  getContainerContents,
  getContainerUsedEncumbrance,
  inventoryDrag,
  wornItems,
}: {
  activeInventorySubtab: InventorySubtab;
  characterData: ResolvedCharacterRecord;
  carriedItems: ResolvedCharacterEquipment[];
  containers: ResolvedCharacterEquipment[];
  formatItemValue: (item: ResolvedCharacterEquipment) => string;
  getContainerContents: (containerId: string) => ResolvedCharacterEquipment[];
  getContainerUsedEncumbrance: (containerId: string) => number;
  inventoryDrag: InventoryDragState | null;
  wornItems: ResolvedCharacterEquipment[];
}) {
  const walletCoinCount = getCoinCount(characterData.coins);
  const walletEncumbrance = getCoinEncumbrance(characterData.coins);
  const walletValue = formatCoinTotalValue(characterData.coins);

  const inventorySubtabOptions = useMemo(
    () => [
      { id: "all" as InventorySubtab, label: "All" },
      { id: "carried" as InventorySubtab, label: "Ready" },
      { id: "worn" as InventorySubtab, label: "Worn" },
      ...containers.map((container) => ({
        id: `container:${container.id}` as InventorySubtab,
        label: container.name,
      })),
    ],
    [containers],
  );

  const sections = useMemo<InventorySectionViewModel[]>(
    () => [
      {
        id: "carried",
        title: "Ready",
        items: carriedItems,
        dropContainerId: null,
        dropCarried: true,
        alwaysVisible:
          activeInventorySubtab === "carried" ||
          carriedItems.length > 0 ||
          walletCoinCount > 0 ||
          Boolean(inventoryDrag),
      },
      {
        id: "worn",
        title: "Worn",
        items: wornItems,
        dropContainerId: null,
        dropWorn: true,
        alwaysVisible: true,
      },
      ...containers.map((container) => ({
        id: container.id,
        title: container.name,
        subtitle: `${getContainerUsedEncumbrance(container.id)} / ${container.carries ?? 0} enc`,
        items: getContainerContents(container.id),
        dropContainerId: container.id,
        alwaysVisible: true,
      })),
    ],
    [
      activeInventorySubtab,
      carriedItems,
      containers,
      getContainerContents,
      getContainerUsedEncumbrance,
      inventoryDrag,
      walletCoinCount,
      wornItems,
    ],
  );

  const visibleSections = useMemo(
    () => sections.filter((section) => {
      if (!section.alwaysVisible) return false;
      if (activeInventorySubtab === "all") return true;
      if (activeInventorySubtab === "worn") return section.id === "worn";
      if (activeInventorySubtab === "carried") return section.id === "carried";
      return activeInventorySubtab === `container:${section.id}`;
    }),
    [activeInventorySubtab, sections],
  );

  const getItemRow = (item: ResolvedCharacterEquipment): InventoryItemRow => {
    const quantity = getConsumableCount(item) ?? 1;
    const encumbrance = getInventoryEncumbrance(item) || "-";
    const value = formatItemValue(item);

    return {
      item,
      quantity,
      encumbrance,
      value,
      mobileDetails: [
        { label: "Type", value: item.type },
        { label: "Qty", value: quantity },
        { label: "Enc", value: encumbrance },
        { label: "Value", value },
      ],
    };
  };

  return {
    getItemRow,
    inventorySubtabOptions,
    sections,
    visibleSections,
    wallet: {
      coinCount: walletCoinCount,
      encumbrance: walletEncumbrance,
      value: walletValue,
      mobileDetails: [
        { label: "Type", value: "Currency" },
        { label: "Qty", value: walletCoinCount },
        { label: "Enc", value: walletEncumbrance || "-" },
        { label: "Value", value: walletValue },
      ],
    },
  };
}
