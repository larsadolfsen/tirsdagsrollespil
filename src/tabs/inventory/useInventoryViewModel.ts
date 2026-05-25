import type { ResolvedCharacterEquipment, ResolvedCharacterRecord } from "../../data/characters/resolved";
import type { InventoryDragState } from "../../types/inventory";
import type { InventorySubtab, TabOption } from "../tabTypes";
import {
  formatCoinTotalValue,
  getCoinCount,
  getCoinEncumbrance,
  getConsumableCount,
  getInventoryEncumbrance,
} from "./inventoryUtils";

export type InventoryMobileDetail = {
  label: string;
  value: string | number;
};

export type InventoryItemRow = {
  item: ResolvedCharacterEquipment;
  quantity: number;
  encumbrance: number | "-";
  value: string;
  mobileDetails: InventoryMobileDetail[];
  isDraggable: boolean;
  isDragging: boolean;
};

export type InventoryWalletRow = {
  coinCount: number;
  containerId: string | null;
  encumbrance: number;
  value: string;
  mobileDetails: InventoryMobileDetail[];
  isDraggable: boolean;
  isDragging: boolean;
};

export type InventorySection = {
  id: string;
  title: string;
  subtitle?: string;
  itemRows: InventoryItemRow[];
  dropContainerId: string | null;
  alwaysVisible: boolean;
  acceptsDrops?: boolean;
  dropWorn?: boolean;
  dropCarried?: boolean;
};

export function useInventoryViewModel({
  activeInventorySubtab,
  carriedItems,
  characterCoins,
  coinContainerId,
  containers,
  getContainerContents,
  getContainerUsedEncumbrance,
  formatItemValue,
  inventoryDrag,
  wornItems,
}: {
  activeInventorySubtab: InventorySubtab;
  carriedItems: ResolvedCharacterEquipment[];
  characterCoins: ResolvedCharacterRecord["coins"];
  coinContainerId: string | null;
  containers: ResolvedCharacterEquipment[];
  getContainerContents: (containerId: string) => ResolvedCharacterEquipment[];
  getContainerUsedEncumbrance: (containerId: string) => number;
  formatItemValue: (item: ResolvedCharacterEquipment) => string;
  inventoryDrag: InventoryDragState | null;
  wornItems: ResolvedCharacterEquipment[];
}) {
  const coinCount = getCoinCount(characterCoins);
  const coinEncumbrance = getCoinEncumbrance(characterCoins);
  const coinValue = formatCoinTotalValue(characterCoins);
  const wallet: InventoryWalletRow = {
    coinCount,
    containerId: coinContainerId,
    encumbrance: coinEncumbrance,
    value: coinValue,
    mobileDetails: [
      { label: "Type", value: "Currency" },
      { label: "Qty", value: coinCount },
      { label: "Enc", value: coinEncumbrance || "-" },
      { label: "Value", value: coinValue },
    ],
    isDraggable: coinCount > 0,
    isDragging: inventoryDrag?.type === "coins",
  };

  const buildItemRows = (items: ResolvedCharacterEquipment[]): InventoryItemRow[] =>
    items.map((item) => {
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
        isDraggable: true,
        isDragging: inventoryDrag?.type === "item" && inventoryDrag.itemId === item.id,
      };
    });

  const inventorySubtabOptions: Array<TabOption<InventorySubtab>> = [
    { id: "all", label: "All" },
    { id: "carried", label: "Carried" },
    { id: "worn", label: "Worn" },
    ...containers.map((container) => ({
      id: `container:${container.id}` as InventorySubtab,
      label: container.name,
    })),
  ];

  const sections: InventorySection[] = [
    {
      id: "carried",
      title: "Carried",
      itemRows: buildItemRows(carriedItems),
      dropContainerId: null,
      dropCarried: true,
      alwaysVisible:
        activeInventorySubtab === "carried" ||
        carriedItems.length > 0 ||
        (wallet.coinCount > 0 && wallet.containerId === null) ||
        Boolean(inventoryDrag),
    },
    {
      id: "worn",
      title: "Worn",
      itemRows: buildItemRows(wornItems),
      dropContainerId: null,
      dropWorn: true,
      alwaysVisible: true,
    },
    ...containers.map((container) => {
      const containerItems = getContainerContents(container.id);

      return {
        id: container.id,
        title: container.name,
        subtitle: `${getContainerUsedEncumbrance(container.id)} / ${container.carries ?? 0} enc`,
        itemRows: buildItemRows(containerItems),
        dropContainerId: container.id,
        alwaysVisible: true,
      };
    }),
  ];

  const visibleSections = sections.filter((section) => {
    if (!section.alwaysVisible) return false;
    if (activeInventorySubtab === "all") return true;
    if (activeInventorySubtab === "worn") return section.id === "worn";
    if (activeInventorySubtab === "carried") return section.id === "carried";
    return activeInventorySubtab === `container:${section.id}`;
  });

  return {
    inventorySubtabOptions,
    sections,
    visibleSections,
    wallet,
  };
}
