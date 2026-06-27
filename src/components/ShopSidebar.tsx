import { useMemo, useState } from "react";
import { AppSidebar, SidebarItemList } from "./sidebar";
import { WfrpFilterChips, WfrpSearchField } from "./ui";
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

const inventoryStock = [...allItemDefinitions].sort((firstItem, secondItem) =>
  firstItem.name.localeCompare(secondItem.name),
);


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

const itemTypePluralLabels: Record<string, string> = {
  "armor": "Armors",
  "consumable": "Consumables",
  "melee weapon": "Melee Weapons",
  "packs and containers": "Containers",
  "ranged weapon": "Ranged Weapons",
  "tool": "Tools",
  "travel gear": "Travel Gear",
};

function formatItemTypeLabel(type: string) {
  return itemTypePluralLabels[type.toLowerCase()] ?? formatFilterLabel(type);
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
  const [selectedItemTypes, setSelectedItemTypes] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);

  const itemTypes = useMemo(() => Array.from(new Set(inventoryStock.map((item) => item.type))), []);
  const itemTypeOptions = useMemo(
    () =>
      itemTypes
        .map((itemType) => ({
          id: itemType,
          label: formatItemTypeLabel(itemType),
        }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [itemTypes],
  );
  const rarityOptions = useMemo(
    () => {
      const rarityOrder = ["common", "average", "scarce", "rare", "exotic", "n/a"];
      return Array.from(new Set(inventoryStock.map((item) => getItemRarity(item))))
        .map((rarity) => ({ id: rarity, label: rarity === "n/a" ? "None" : formatFilterLabel(rarity) }))
        .sort((a, b) => {
          const aIndex = rarityOrder.indexOf(a.id);
          const bIndex = rarityOrder.indexOf(b.id);
          if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
          if (aIndex !== -1) return -1;
          if (bIndex !== -1) return 1;
          return a.label.localeCompare(b.label);
        });
    },
    [],
  );

  const filteredStock = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return inventoryStock.filter((item) => {
      if (selectedItemTypes.length > 0 && !selectedItemTypes.includes(item.type)) return false;
      if (selectedRarities.length > 0 && !selectedRarities.includes(getItemRarity(item))) return false;

      if (!normalizedSearchTerm) return true;

      return [item.name, item.type, formatItemTypeLabel(item.type), item.description, getItemRarity(item)]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearchTerm));
    });
  }, [searchTerm, selectedItemTypes, selectedRarities]);

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

  const listTitle = selectedItemTypes.length === 1
    ? formatItemTypeLabel(selectedItemTypes[0])
    : "All Items";

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
          <span className="wfrp-label text-wfrp-muted-text">
            Coin
          </span>
          <div className="space-y-1">
            {coinRows.map(([coinKey, label, colorClass]) => (
              <div key={coinKey} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 wfrp-text-strong text-wfrp-muted-text">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full shadow-sm", colorClass)} aria-hidden="true" />
                  <span className="min-w-0 truncate">{label}</span>
                </span>
                <span className="font-mono wfrp-text-strong text-wfrp-muted-text">{coins[coinKey]}</span>
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
        <div className="space-y-3">
          <div className="space-y-1.5">
            <div className="wfrp-label text-wfrp-muted-text">Type</div>
            <WfrpFilterChips
              ariaLabel="Inventory type filters"
              options={itemTypeOptions}
              selectedIds={selectedItemTypes}
              onChange={setSelectedItemTypes}
            />
          </div>
          <div className="space-y-1.5">
            <div className="wfrp-label text-wfrp-muted-text">Rarity</div>
            <WfrpFilterChips
              ariaLabel="Inventory rarity filters"
              options={rarityOptions}
              selectedIds={selectedRarities}
              onChange={setSelectedRarities}
            />
          </div>
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
