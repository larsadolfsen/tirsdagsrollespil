import { useMemo, useState } from "react";
import { AppSidebar, SidebarFilterList, SidebarItemList } from "./sidebar";
import { WfrpSearchField } from "./ui";
import { allItemDefinitions, wfrp4eRuleset } from "../data/rules/wfrp4e";
import { formatItemValue } from "../lib/gameSession";
import { cn } from "../lib/utils";
import type { CharacterCoins, ItemDefinition } from "../types";

const weaponAvailabilityById = new Map(
  wfrp4eRuleset.weapons.map((weapon) => [weapon.id, weapon.availability]),
);
const armourAvailabilityById = new Map(
  wfrp4eRuleset.armours.map((armour) => [armour.id, armour.availability]),
);

const inventoryStock = [...allItemDefinitions].sort((firstItem, secondItem) => {
  const typeOrder = firstItem.type.localeCompare(secondItem.type);
  return typeOrder || firstItem.name.localeCompare(secondItem.name);
});

const availabilityOrder = ["common", "average", "scarce", "rare", "exotic", "n/a"];
const coinRows = [
  ["gc", "Gold Crowns", "bg-wfrp-gold"],
  ["s", "Silver Shillings", "bg-wfrp-silver"],
  ["d", "Brass Pennies", "bg-wfrp-coin-brass"],
] as const;

function formatFilterLabel(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function formatItemTypeLabel(type: string) {
  return type.toLowerCase() === "packs and containers" ? "Containers" : formatFilterLabel(type);
}

function formatItemTypeShortLabel(type: string) {
  if (type === "Melee Weapon") return "Melee";
  if (type === "Ranged Weapon") return "Ranged";
  return formatItemTypeLabel(type);
}

function getItemRarity(item: ItemDefinition) {
  if (item.availability) {
    return item.availability;
  }

  if (item.weaponId) {
    return weaponAvailabilityById.get(item.weaponId) ?? "n/a";
  }

  if (item.armourId) {
    return armourAvailabilityById.get(item.armourId) ?? "n/a";
  }

  return "n/a";
}

export function ShopSidebar({
  isOpen,
  coins,
  ownedItemIds,
  onAddToInventory,
  onBuy,
  onClose,
}: {
  isOpen: boolean;
  coins: CharacterCoins;
  ownedItemIds: Set<string>;
  onAddToInventory: (item: ItemDefinition) => void;
  onBuy: (item: ItemDefinition) => void;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("All");
  const [selectedRarity, setSelectedRarity] = useState("All");

  const itemTypes = useMemo(() => Array.from(new Set(inventoryStock.map((item) => item.type))), []);
  const itemTypeOptions = useMemo(
    () => [
      { id: "All", label: "All" },
      ...itemTypes.map((itemType) => ({
        id: itemType,
        label: formatItemTypeLabel(itemType),
        shortLabel: formatItemTypeShortLabel(itemType),
      })),
    ],
    [itemTypes],
  );
  const itemRarities = useMemo(() => {
    return Array.from(new Set(inventoryStock.map((item) => getItemRarity(item)))).sort(
      (firstRarity, secondRarity) => {
        const firstIndex = availabilityOrder.indexOf(firstRarity);
        const secondIndex = availabilityOrder.indexOf(secondRarity);

        if (firstIndex !== -1 || secondIndex !== -1) {
          return (firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex) -
            (secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex);
        }

        return firstRarity.localeCompare(secondRarity);
      },
    );
  }, []);
  const rarityOptions = useMemo(
    () => [
      { id: "All", label: "All" },
      ...itemRarities.map((rarity) => ({ id: rarity, label: formatFilterLabel(rarity) })),
    ],
    [itemRarities],
  );

  const filteredStock = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return inventoryStock.filter((item) => {
      if (selectedItemType !== "All" && item.type !== selectedItemType) return false;
      if (selectedRarity !== "All" && getItemRarity(item) !== selectedRarity) return false;

      if (!normalizedSearchTerm) return true;

      return [item.name, item.type, formatItemTypeLabel(item.type), item.description, getItemRarity(item)]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearchTerm));
    });
  }, [searchTerm, selectedItemType, selectedRarity]);

  const inventoryItems = filteredStock.map((item) => {
    const rarity = getItemRarity(item);
    const isOwned = ownedItemIds.has(item.id);

    return {
      actions: [
        {
          isActive: true,
          label: "Add",
          onClick: () => onAddToInventory(item),
        },
        {
          label: "Buy",
          onClick: () => onBuy(item),
        },
      ],
      description: item.description,
      details: [
        { label: "Type", value: formatItemTypeLabel(item.type) },
        { label: "Rarity", value: formatFilterLabel(rarity) },
        { label: "Encumbrance", value: item.encumbrance || "-" },
        { label: "Price", value: formatItemValue(item) },
        ...(item.carries ? [{ label: "Carries", value: `${item.carries} enc` }] : []),
      ],
      id: item.id,
      isMarked: isOwned,
      name: item.name,
    };
  });

  const listTitle = selectedItemType === "All" ? "All Items" : formatItemTypeLabel(selectedItemType);

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="add-inventory-sidebar"
      onClose={onClose}
      overlayUntil="desktop"
      side="right"
      title="Add Inventory"
      titleId="add-inventory-sidebar-title"
      closeLabel="Close add inventory sidebar"
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <div className="border-b border-wfrp-border bg-[#242424] px-4 py-3">
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-wfrp-muted-text">
            Coin
          </span>
          <div className="space-y-1">
            {coinRows.map(([coinKey, label, colorClass]) => (
              <div key={coinKey} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-xs font-bold text-wfrp-muted-text">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full shadow-sm", colorClass)} aria-hidden="true" />
                  <span className="min-w-0 truncate">{label}</span>
                </span>
                <span className="font-mono text-[11px] font-black text-wfrp-muted-text">{coins[coinKey]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <WfrpSearchField
        id="add-inventory-sidebar-search"
        label="Search inventory"
        placeholder="Search inventory"
        value={searchTerm}
        onSearch={setSearchTerm}
        onValueChange={setSearchTerm}
      />

      <div className="border-b border-wfrp-border bg-[#242424] px-4 py-3">
        <div className="space-y-2">
          <SidebarFilterList
            ariaLabel="Inventory type filters"
            label="Type"
            options={itemTypeOptions}
            value={selectedItemType}
            onChange={setSelectedItemType}
          />
          <SidebarFilterList
            ariaLabel="Inventory rarity filters"
            label="Rarity"
            options={rarityOptions}
            value={selectedRarity}
            onChange={setSelectedRarity}
          />
        </div>
      </div>

      <SidebarItemList
        className="!rounded-none !border-0"
        items={inventoryItems}
        title={listTitle}
        emptyMessage="No inventory items match the selected filters."
      />
    </AppSidebar>
  );
}
