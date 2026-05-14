import type { RefObject } from "react";
import type { ResolvedCharacterEquipment } from "../../data/characters/resolved";
import type { InventoryMenuState } from "../../types/inventory";
import {
  isPacksAndContainersItem,
  isWornInventoryItem,
} from "./inventoryUtils";

interface InventoryContextMenuProps {
  activeInventoryMenu: InventoryMenuState | null;
  canDropInventoryItem: (
    itemId: string,
    targetContainerId: string | null,
    targetWorn?: boolean,
    targetCarried?: boolean,
  ) => boolean;
  canStoreInContainer: (itemId: string, containerId: string) => boolean;
  containers: ResolvedCharacterEquipment[];
  equipmentState: ResolvedCharacterEquipment[];
  handleCarryItem: (itemId: string) => void;
  handleDropItem: (itemId: string) => void;
  handleStoreItem: (itemId: string, containerId: string) => void;
  handleUnwearItem: (itemId: string) => void;
  handleWearItem: (itemId: string) => void;
  inventoryMenuRef: RefObject<HTMLDivElement | null>;
}

export function InventoryContextMenu({
  activeInventoryMenu,
  canDropInventoryItem,
  canStoreInContainer,
  containers,
  equipmentState,
  handleCarryItem,
  handleDropItem,
  handleStoreItem,
  handleUnwearItem,
  handleWearItem,
  inventoryMenuRef,
}: InventoryContextMenuProps) {
  if (!activeInventoryMenu) return null;

  const activeItem = equipmentState.find((item) => item.id === activeInventoryMenu.id);
  if (!activeItem) return null;

  const stowableContainers = containers.filter(
    (item) =>
      isPacksAndContainersItem(item) &&
      item.id !== activeItem.id &&
      item.id !== activeItem.containerId &&
      canStoreInContainer(activeItem.id, item.id),
  );
  const canMoveToWorn = canDropInventoryItem(activeItem.id, null, true);
  const canMoveToCarried = isWornInventoryItem(activeItem)
    ? canDropInventoryItem(activeItem.id, null, false, true)
    : canDropInventoryItem(activeItem.id, null);

  return (
    <div
      ref={inventoryMenuRef}
      className="fixed z-50 min-w-[152px] overflow-hidden rounded border border-white/10 bg-wfrp-menu py-1 shadow-xl"
      style={{ top: activeInventoryMenu.top, left: activeInventoryMenu.left }}
    >
      {activeInventoryMenu.mode === "drop" ? (
        <button
          onClick={() => handleDropItem(activeItem.id)}
          className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-semibold leading-relaxed text-gray-300 transition-colors hover:bg-white/5 hover:text-wfrp-gold"
        >
          Confirm
        </button>
      ) : (
        <>
          {canMoveToWorn && (
            <button
              onClick={() => handleWearItem(activeItem.id)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-semibold leading-relaxed text-gray-300 transition-colors hover:bg-white/5 hover:text-wfrp-gold"
            >
              Wear
            </button>
          )}
          {canMoveToCarried && (
            <button
              onClick={() => {
                if (isWornInventoryItem(activeItem)) {
                  handleUnwearItem(activeItem.id);
                } else {
                  handleCarryItem(activeItem.id);
                }
              }}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-semibold leading-relaxed text-gray-300 transition-colors hover:bg-white/5 hover:text-wfrp-gold"
            >
              Ready
            </button>
          )}
          {stowableContainers.map((container) => (
            <button
              key={container.id}
              onClick={() => handleStoreItem(activeItem.id, container.id)}
              className="flex w-full items-center justify-between px-3 py-1.5 text-left text-xs font-semibold leading-relaxed text-gray-300 transition-colors hover:bg-white/5 hover:text-wfrp-gold"
            >
              {container.name}
            </button>
          ))}
        </>
      )}
    </div>
  );
}
