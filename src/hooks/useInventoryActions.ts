import { useEffect, useRef, useState } from "react";
import type { DragEvent as ReactDragEvent, Dispatch, MouseEvent as ReactMouseEvent, SetStateAction } from "react";
import type { ResolvedCharacterEquipment, ResolvedCharacterRecord } from "../data/characters/resolved";
import {
  getConsumableCount,
  normalizeConsumableName,
} from "../lib/consumables";
import {
  getCoinEncumbrance,
  isBackpackContainerItem,
  isPacksAndContainersItem,
  isWearableInventoryItem,
  isWornInventoryItem,
} from "../tabs/inventory/inventoryUtils";
import type { MainTab, MobileTabMenuTarget } from "../tabs/tabTypes";
import type { CoinKey } from "../tabs/tabTypes";
import type { ItemDefinition, SpellDefinition } from "../types";
import type { InventoryDragState, InventoryDropTargetId, InventoryMenuState } from "../types/inventory";

interface UseInventoryActionsOptions {
  characterCoins: ResolvedCharacterRecord["coins"];
  coinContainerId: string | null;
  equipmentState: ResolvedCharacterEquipment[];
  getArmourFitConflicts: (
    itemToFit: ResolvedCharacterEquipment,
    items: ResolvedCharacterEquipment[],
  ) => unknown[];
  setActiveMainTab: Dispatch<SetStateAction<MainTab>>;
  setActiveMobileMainView: Dispatch<SetStateAction<MobileTabMenuTarget>>;
  setCharacterCoins: Dispatch<SetStateAction<ResolvedCharacterRecord["coins"]>>;
  setCoinContainerId: Dispatch<SetStateAction<string | null>>;
  setCharacterSpells: Dispatch<SetStateAction<ResolvedCharacterRecord["spells"]>>;
  setEquipmentState: Dispatch<SetStateAction<ResolvedCharacterEquipment[]>>;
}

export function useInventoryActions({
  characterCoins,
  coinContainerId,
  equipmentState,
  getArmourFitConflicts,
  setActiveMainTab,
  setActiveMobileMainView,
  setCharacterCoins,
  setCoinContainerId,
  setCharacterSpells,
  setEquipmentState,
}: UseInventoryActionsOptions) {
  const [activeInventoryMenu, setActiveInventoryMenu] = useState<InventoryMenuState | null>(null);
  const [inventoryDrag, setInventoryDrag] = useState<InventoryDragState | null>(null);
  const [inventoryDropTarget, setInventoryDropTarget] = useState<InventoryDropTargetId | null>(null);
  const inventoryMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeInventoryMenu) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!inventoryMenuRef.current?.contains(event.target as Node)) {
        setActiveInventoryMenu(null);
      }
    };

    const handleWindowChange = () => {
      setActiveInventoryMenu(null);
    };

    window.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleWindowChange);
    window.addEventListener("scroll", handleWindowChange, true);

    return () => {
      window.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleWindowChange);
      window.removeEventListener("scroll", handleWindowChange, true);
    };
  }, [activeInventoryMenu]);

  const handleStoreItem = (itemId: string, containerId: string) => {
    const storedItem = equipmentState.find((item) => item.id === itemId);
    const disabledContainerIds = new Set<string>();

    if (storedItem && isPacksAndContainersItem(storedItem)) {
      const collectContainedContainers = (parentId: string) => {
        disabledContainerIds.add(parentId);
        equipmentState
          .filter((item) => item.containerId === parentId && isPacksAndContainersItem(item))
          .forEach((item) => collectContainedContainers(item.id));
      };

      collectContainedContainers(itemId);

      if (coinContainerId && disabledContainerIds.has(coinContainerId)) {
        setCoinContainerId(null);
      }
    }

    setEquipmentState((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          return { ...item, equipped: false, containerId };
        }

        if (disabledContainerIds.has(item.containerId ?? "")) {
          return { ...item, containerId: null };
        }

        return item;
      }),
    );
    setActiveInventoryMenu(null);
  };

  const handleCarryItem = (itemId: string) => {
    setEquipmentState((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, containerId: null }
          : item,
      ),
    );
    setActiveInventoryMenu(null);
  };

  const handleWearItem = (itemId: string) => {
    const activeItem = equipmentState.find((item) => item.id === itemId);
    if (!activeItem || !isWearableInventoryItem(activeItem)) return;

    if (activeItem.type === "Armor") {
      const conflicts = getArmourFitConflicts(
        activeItem,
        equipmentState.filter((item) => item.id !== activeItem.id),
      );

      if (conflicts.length > 0) {
        return;
      }
    }

    setEquipmentState((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              equipped:
                item.type === "Armor" || isBackpackContainerItem(item)
                  ? true
                  : item.equipped,
              containerId: null,
            }
          : item,
      ),
    );
    setActiveInventoryMenu(null);
  };

  const handleUnwearItem = (itemId: string) => {
    setEquipmentState((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? {
              ...item,
              equipped:
                item.type === "Armor" || isBackpackContainerItem(item)
                  ? false
                  : item.equipped,
              containerId: null,
            }
          : item,
      ),
    );
    setActiveInventoryMenu(null);
  };

  const handleDropItem = (itemId: string) => {
    if (coinContainerId === itemId) {
      setCoinContainerId(null);
    }

    setEquipmentState((prev) =>
      prev
        .filter((item) => item.id !== itemId)
        .map((item) =>
          item.containerId === itemId
            ? { ...item, containerId: null }
            : item,
        ),
    );
    setActiveInventoryMenu(null);
  };

  const handleConsumeItem = (itemId: string) => {
    setEquipmentState((prev) =>
      prev
        .map((item) => {
          if (item.id !== itemId) return item;

          const count = getConsumableCount(item);
          if (!count || count <= 1) return null;

          return { ...item, quantity: count - 1 };
        })
        .filter((item): item is ResolvedCharacterEquipment => Boolean(item)),
    );
  };

  const handleAddConsumableItem = (itemId: string) => {
    setEquipmentState((prev) =>
      prev.map((item) => {
        if (item.id !== itemId || item.type !== "Consumable") return item;

        return { ...item, quantity: (getConsumableCount(item) ?? 0) + 1 };
      }),
    );
  };

  const handleResolveArmourFit = (
    newItemId: string,
    conflictItemIds: string[],
    action: "container" | "drop",
    containerId?: string,
  ) => {
    const conflictIds = new Set(conflictItemIds);
    setEquipmentState((prev) =>
      prev
        .filter((item) => action !== "drop" || !conflictIds.has(item.id))
        .map((item) => {
          if (item.id === newItemId) {
            return { ...item, equipped: true, containerId: null };
          }

          if (action === "container" && conflictIds.has(item.id)) {
            return { ...item, equipped: false, containerId: containerId ?? null };
          }

          return item;
        }),
    );
    setActiveInventoryMenu(null);
  };

  const handleAddShopItem = (item: ItemDefinition) => {
    const purchasedAt = Date.now();

    const quantity = getConsumableCount({
      type: item.type,
      name: item.name,
    });

    setEquipmentState((prev) => [
      ...prev,
      {
        id: `shop-${item.id}-${purchasedAt}`,
        itemId: item.id,
        weaponId: item.weaponId,
        armourId: item.armourId,
        armourLocations: item.armourLocations,
        name: normalizeConsumableName(item),
        type: item.type,
        description: item.description,
        encumbrance: item.encumbrance,
        carries: item.carries,
        value: item.value,
        currency: item.currency,
        priceLabel: item.priceLabel,
        availability: item.availability,
        quantity: quantity ?? undefined,
        equipped: item.id === "backpack_item",
        containerId: null,
      },
    ]);
    setActiveMainTab("inventory");
    setActiveMobileMainView("inventory");
  };

  const handleAddSpell = (spell: SpellDefinition) => {
    setCharacterSpells((currentSpells) => {
      if (currentSpells.some((currentSpell) => currentSpell.id === spell.id)) {
        return currentSpells;
      }

      return [
        ...currentSpells,
        {
          id: spell.id,
          name: spell.name,
          description: spell.description,
          category: spell.category,
          school: spell.school,
          cn: spell.cn,
          range: spell.range,
          target: spell.target,
          duration: spell.duration,
          damage: spell.damage,
        },
      ];
    });
    setActiveMainTab("spells");
    setActiveMobileMainView("spells");
  };

  const handleAdjustCoinType = (coinKey: CoinKey, amount: number) => {
    setCharacterCoins((prev) => ({
      ...prev,
      [coinKey]: Math.max(0, prev[coinKey] + amount),
    }));
  };

  const handleToggleInventoryMenu = (
    itemId: string,
    event: ReactMouseEvent<HTMLButtonElement>,
    mode: InventoryMenuState["mode"],
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const menuWidth = 136;
    const nextLeft = Math.min(
      rect.right - menuWidth,
      window.innerWidth - menuWidth - 12,
    );

    setActiveInventoryMenu((current) =>
      current?.id === itemId && current.mode === mode
        ? null
        : {
            id: itemId,
            mode,
            top: rect.bottom + 6,
            left: Math.max(12, nextLeft),
          },
    );
  };

  const getContainerUsedEncumbrance = (containerId: string) =>
    equipmentState
      .filter((item) => item.containerId === containerId)
      .reduce(
        (sum, item) => sum + Number(item.encumbrance || 0),
        coinContainerId === containerId ? getCoinEncumbrance(characterCoins) : 0,
      );

  const canStoreInContainer = (itemId: string, containerId: string) => {
    const item = equipmentState.find((entry) => entry.id === itemId);
    const container = equipmentState.find((entry) => entry.id === containerId);

    if (!item || !container || item.id === container.id) return false;
    if (container.containerId) return false;

    const capacity = container.carries ?? 0;
    if (capacity <= 0) return false;

    const used = getContainerUsedEncumbrance(containerId);
    const currentContribution = item.containerId === containerId ? item.encumbrance : 0;

    return used - currentContribution + item.encumbrance <= capacity;
  };

  const canStoreCoinsInContainer = (containerId: string) => {
    const container = equipmentState.find((entry) => entry.id === containerId);
    if (!container) return false;
    if (container.containerId) return false;

    const coinEncumbrance = getCoinEncumbrance(characterCoins);
    const capacity = container.carries ?? 0;
    if (capacity <= 0 || coinEncumbrance <= 0) return false;

    const used = getContainerUsedEncumbrance(containerId);
    const currentContribution = coinContainerId === containerId ? coinEncumbrance : 0;

    return used - currentContribution + coinEncumbrance <= capacity;
  };

  const handleMoveCoins = (containerId: string | null) => {
    if (containerId && !canStoreCoinsInContainer(containerId)) return;

    setCoinContainerId(containerId);
    setActiveInventoryMenu(null);
  };

  const canDropInventoryItem = (
    itemId: string,
    targetContainerId: string | null,
    targetWorn = false,
    targetCarried = false,
  ) => {
    const item = equipmentState.find((entry) => entry.id === itemId);
    if (!item) return false;

    if (targetWorn) {
      if (!isWearableInventoryItem(item) || isWornInventoryItem(item)) return false;
      if (item.type === "Armor") {
        return getArmourFitConflicts(
          item,
          equipmentState.filter((entry) => entry.id !== item.id),
        ).length === 0;
      }
      return true;
    }

    if (targetCarried && isWornInventoryItem(item)) {
      return item.type === "Armor" || isPacksAndContainersItem(item);
    }

    const currentContainerId = item.containerId ?? null;
    if (currentContainerId === targetContainerId) return false;
    if (!targetContainerId) return true;

    return canStoreInContainer(itemId, targetContainerId);
  };

  const canDropCoins = (
    targetContainerId: string | null,
    targetWorn = false,
  ) => {
    if (targetWorn) return false;
    if (getCoinEncumbrance(characterCoins) <= 0) return false;

    const currentContainerId = coinContainerId ?? null;
    if (currentContainerId === targetContainerId) return false;
    if (!targetContainerId) return true;

    return canStoreCoinsInContainer(targetContainerId);
  };

  const canDropInventoryDrag = (
    dragState: InventoryDragState,
    targetContainerId: string | null,
    targetWorn = false,
    targetCarried = false,
  ) =>
    dragState.type === "coins"
      ? canDropCoins(targetContainerId, targetWorn)
      : canDropInventoryItem(dragState.itemId, targetContainerId, targetWorn, targetCarried);

  const handleInventoryDragStart = (
    item: ResolvedCharacterEquipment,
    event: ReactDragEvent<HTMLDivElement>,
  ) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item.id);
    setActiveInventoryMenu(null);
    setInventoryDrag({
      type: "item",
      itemId: item.id,
    });
  };

  const handleCoinDragStart = (event: ReactDragEvent<HTMLDivElement>) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", "coins");
    setActiveInventoryMenu(null);
    setInventoryDrag({ type: "coins" });
  };

  const handleInventoryDragEnd = () => {
    setInventoryDrag(null);
    setInventoryDropTarget(null);
  };

  const handleInventoryDragOver = (
    targetId: InventoryDropTargetId,
    targetContainerId: string | null,
    event: ReactDragEvent<HTMLDivElement>,
    targetWorn = false,
    targetCarried = false,
  ) => {
    if (
      !inventoryDrag ||
      !canDropInventoryDrag(inventoryDrag, targetContainerId, targetWorn, targetCarried)
    ) {
      return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    setInventoryDropTarget(targetId);
  };

  const handleInventoryDrop = (
    targetContainerId: string | null,
    event: ReactDragEvent<HTMLDivElement>,
    targetWorn = false,
    targetCarried = false,
  ) => {
    event.preventDefault();
    if (
      !inventoryDrag ||
      !canDropInventoryDrag(inventoryDrag, targetContainerId, targetWorn, targetCarried)
    ) {
      handleInventoryDragEnd();
      return;
    }

    if (inventoryDrag.type === "coins") {
      setCoinContainerId(targetContainerId);
    } else if (targetWorn) {
      handleWearItem(inventoryDrag.itemId);
    } else if (targetCarried && isWornInventoryItem(equipmentState.find((item) => item.id === inventoryDrag.itemId)!)) {
      handleUnwearItem(inventoryDrag.itemId);
    } else if (targetContainerId) {
      handleStoreItem(inventoryDrag.itemId, targetContainerId);
    } else {
      handleCarryItem(inventoryDrag.itemId);
    }
    handleInventoryDragEnd();
  };

  return {
    activeInventoryMenu,
    canDropInventoryDrag,
    canDropInventoryItem,
    canStoreCoinsInContainer,
    canStoreInContainer,
    handleAddConsumableItem,
    handleAddShopItem,
    handleAddSpell,
    handleAdjustCoinType,
    handleCarryItem,
    handleConsumeItem,
    handleDropItem,
    handleCoinDragStart,
    handleInventoryDragEnd,
    handleInventoryDragOver,
    handleInventoryDragStart,
    handleInventoryDrop,
    handleMoveCoins,
    handleResolveArmourFit,
    handleStoreItem,
    handleToggleInventoryMenu,
    handleUnwearItem,
    handleWearItem,
    inventoryDrag,
    inventoryDropTarget,
    inventoryMenuRef,
    setActiveInventoryMenu,
    setInventoryDropTarget,
  };
}
