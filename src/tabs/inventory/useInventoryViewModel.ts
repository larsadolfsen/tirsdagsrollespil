import type { ResolvedCharacterEquipment, ResolvedCharacterRecord } from "../../data/characters/resolved";
import type { InventoryDragState } from "../../types/inventory";
import type { InventorySubtab, TabOption } from "../tabTypes";
import {
  formatCoinTotalValue,
  getCoinCount,
  getCoinEncumbrance,
  getConsumableCount,
  getInventoryEncumbrance,
  isPacksAndContainersItem,
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
  encumbrance: number;
  value: string;
  mobileDetails: InventoryMobileDetail[];
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
    encumbrance: coinEncumbrance,
    value: coinValue,
    mobileDetails: [
      { label: "Type", value: "Currency" },
      { label: "Qty", value: coinCount },
      { label: "Enc", value: coinEncumbrance || "-" },
      { label: "Value", value: coinValue },
    ],
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
        isDraggable: !isPacksAndContainersItem(item),
        isDragging: inventoryDrag?.itemId === item.id,
      };
    });

  const inventorySubtabOptions: Array<TabOption<InventorySubtab>> = [
    { id: "all", label: "All" },
    { id: "carried", label: "Ready" },
    { id: "worn", label: "Worn" },
    ...containers.map((container) => ({
      id: `container:${container.id}` as InventorySubtab,
      label: container.name,
    })),
  ];

  const sections: InventorySection[] = [
    {
      id: "carried",
      title: "Ready",
      itemRows: buildItemRows(carriedItems),
      dropContainerId: null,
      dropCarried: true,
      alwaysVisible:
        activeInventorySubtab === "carried" ||
        carriedItems.length > 0 ||
        wallet.coinCount > 0 ||
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
