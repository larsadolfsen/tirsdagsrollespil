import type { ResolvedCharacterEquipment, ResolvedCharacterRecord } from "../../data/characters/resolved";
import type { InventoryDragState } from "../../types/inventory";
import type { InventorySubtab, TabOption } from "../tabTypes";
import {
  formatCoinTotalValue,
  getCoinCount,
  getCoinEncumbrance,
} from "./inventoryUtils";

export type InventorySection = {
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

export function useInventoryViewModel({
  activeInventorySubtab,
  carriedItems,
  characterCoins,
  containers,
  getContainerContents,
  getContainerUsedEncumbrance,
  inventoryDrag,
  wornItems,
}: {
  activeInventorySubtab: InventorySubtab;
  carriedItems: ResolvedCharacterEquipment[];
  characterCoins: ResolvedCharacterRecord["coins"];
  containers: ResolvedCharacterEquipment[];
  getContainerContents: (containerId: string) => ResolvedCharacterEquipment[];
  getContainerUsedEncumbrance: (containerId: string) => number;
  inventoryDrag: InventoryDragState | null;
  wornItems: ResolvedCharacterEquipment[];
}) {
  const wallet = {
    coinCount: getCoinCount(characterCoins),
    encumbrance: getCoinEncumbrance(characterCoins),
    value: formatCoinTotalValue(characterCoins),
  };

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
      items: carriedItems,
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
