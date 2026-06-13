import { ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { AppSidebar, SidebarItemList } from "./sidebar";
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
const FILTER_BUTTON_BASE_WIDTH = 32;
const FILTER_BUTTON_CHARACTER_WIDTH = 8;
const FILTER_MORE_BUTTON_WIDTH = 92;
const FILTER_ROW_PADDING = 8;
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

function getFilterOptionWidth(label: string) {
  return FILTER_BUTTON_BASE_WIDTH + label.length * FILTER_BUTTON_CHARACTER_WIDTH;
}

function getVisibleFilterCount(options: string[], rowWidth: number) {
  if (!rowWidth || options.length <= 1) return options.length;

  let usedWidth = FILTER_ROW_PADDING;

  for (let index = 0; index < options.length; index += 1) {
    const hasOverflow = index < options.length - 1;
    const nextWidth = getFilterOptionWidth(formatFilterLabel(options[index]));
    const reservedOverflowWidth = hasOverflow ? FILTER_MORE_BUTTON_WIDTH : 0;

    if (usedWidth + nextWidth + reservedOverflowWidth > rowWidth) {
      return Math.max(1, index);
    }

    usedWidth += nextWidth;
  }

  return options.length;
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
  const [typeFilterRowWidth, setTypeFilterRowWidth] = useState(0);
  const [isTypeOverflowOpen, setIsTypeOverflowOpen] = useState(false);
  const typeFilterRowRef = useRef<HTMLDivElement | null>(null);
  const typeOverflowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const row = typeFilterRowRef.current;
    if (!row) return;

    const updateRowWidth = () => setTypeFilterRowWidth(row.clientWidth);
    updateRowWidth();

    const observer = new ResizeObserver(updateRowWidth);
    observer.observe(row);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isTypeOverflowOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!typeOverflowRef.current?.contains(event.target as Node)) {
        setIsTypeOverflowOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isTypeOverflowOpen]);

  const itemTypes = useMemo(() => Array.from(new Set(inventoryStock.map((item) => item.type))), []);
  const itemTypeOptions = useMemo(() => ["All", ...itemTypes], [itemTypes]);
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
  const rarityOptions = useMemo(() => ["All", ...itemRarities], [itemRarities]);
  const visibleTypeCount = getVisibleFilterCount(itemTypeOptions, typeFilterRowWidth);
  const visibleTypeOptions = itemTypeOptions.slice(0, visibleTypeCount);
  const overflowTypeOptions = itemTypeOptions.slice(visibleTypeCount);

  const filteredStock = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    return inventoryStock.filter((item) => {
      if (selectedItemType !== "All" && item.type !== selectedItemType) return false;
      if (selectedRarity !== "All" && getItemRarity(item) !== selectedRarity) return false;

      if (!normalizedSearchTerm) return true;

      return [item.name, item.type, item.description, getItemRarity(item)]
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
        { label: "Type", value: item.type },
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

  const listTitle = selectedItemType === "All" ? "All Items" : selectedItemType;

  const renderFilterButton = (
    option: string,
    selectedOption: string,
    setSelectedOption: (option: string) => void,
    index: number,
    optionCount: number,
  ) => {
    const isActive = selectedOption === option;

    return (
      <button
        key={option}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => setSelectedOption(option)}
        tabIndex={isActive ? 0 : -1}
        className="group inline-flex h-12 shrink-0 cursor-pointer items-center justify-center bg-transparent p-0 text-[11px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50"
      >
        <span
          className={cn(
            "inline-flex h-6 items-center justify-center px-3 transition-all group-active:scale-95 sm:px-4",
            index === 0 && "rounded-l",
            index === optionCount - 1 && "rounded-r",
            index < optionCount - 1 && "border-r border-card",
            isActive ? "bg-wfrp-gold text-primary-foreground" : "bg-[#303030] text-wfrp-muted-text",
          )}
        >
          {formatFilterLabel(option)}
        </span>
      </button>
    );
  };

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
              <div key={coinKey} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-xs font-bold text-gray-100">
                <span className="flex min-w-0 items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full shadow-sm", colorClass)} aria-hidden="true" />
                  <span className="min-w-0 truncate">{label}</span>
                </span>
                <span className="font-mono text-[11px] font-black text-gray-100">{coins[coinKey]}</span>
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
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-wfrp-muted-text">
              Type
            </div>
            <div ref={typeFilterRowRef} className="relative z-30 inline-flex min-w-0 max-w-full items-center justify-start" role="tablist" aria-label="Inventory type filters">
              {visibleTypeOptions.map((option, index) =>
                renderFilterButton(
                  option,
                  selectedItemType,
                  setSelectedItemType,
                  index,
                  visibleTypeOptions.length + (overflowTypeOptions.length ? 1 : 0),
                ))}
              {overflowTypeOptions.length ? (
                <div ref={typeOverflowRef} className="relative z-30 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsTypeOverflowOpen((isOpen) => !isOpen)}
                    className={cn(
                      "group inline-flex h-12 cursor-pointer items-center justify-center bg-transparent p-0 text-[11px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50",
                      overflowTypeOptions.includes(selectedItemType) && "text-wfrp-gold",
                    )}
                    aria-expanded={isTypeOverflowOpen}
                    aria-label="Show more inventory type filters"
                  >
                    <span
                      className={cn(
                        "inline-flex h-6 items-center justify-center gap-1 rounded-r px-3 text-wfrp-muted-text transition-all group-active:scale-95 sm:px-4",
                        overflowTypeOptions.includes(selectedItemType)
                          ? "bg-wfrp-gold text-primary-foreground"
                          : "bg-[#303030] text-wfrp-muted-text",
                      )}
                    >
                      {overflowTypeOptions.includes(selectedItemType) ? formatFilterLabel(selectedItemType) : "More"}
                      <ChevronDown size={13} aria-hidden="true" />
                    </span>
                  </button>
                  {isTypeOverflowOpen ? (
                    <div className="absolute left-0 top-10 z-50 max-h-72 min-w-56 overflow-y-auto rounded border border-wfrp-border bg-wfrp-popover p-1 shadow-xl shadow-black/40 no-scrollbar">
                      {overflowTypeOptions.map((option) => {
                        const isActive = selectedItemType === option;

                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => {
                              setSelectedItemType(option);
                              setIsTypeOverflowOpen(false);
                            }}
                            className={cn(
                              "flex h-8 w-full items-center whitespace-nowrap rounded px-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors",
                              isActive ? "bg-wfrp-gold/10 text-wfrp-gold" : "text-wfrp-muted-text hover:bg-white/5 hover:text-gray-200",
                            )}
                          >
                            {formatFilterLabel(option)}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>

          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-wfrp-muted-text">
              Rarity
            </div>
            <div className="inline-flex min-w-max items-center justify-start" role="tablist" aria-label="Inventory rarity filters">
              {rarityOptions.map((option, index) =>
                renderFilterButton(option, selectedRarity, setSelectedRarity, index, rarityOptions.length))}
            </div>
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
