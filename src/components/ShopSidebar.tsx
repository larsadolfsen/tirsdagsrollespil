import { AnimatePresence, motion } from "motion/react";
import { ArrowDown, ArrowUp, ChevronDown, ListFilter, Search, ShoppingBag, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Chip } from "./Chip";
import { itemDefinitions } from "../data/rules/wfrp4e/items";
import { formatItemValue, getItemPriceInBrass } from "../lib/gameSession";
import type { ItemDefinition } from "../types";

const shopStock = [...itemDefinitions].sort((firstItem, secondItem) => {
  const typeOrder = firstItem.type.localeCompare(secondItem.type);
  return typeOrder || firstItem.name.localeCompare(secondItem.name);
});

const availabilityOrder = ["common", "average", "scarce", "rare", "exotic", "n/a"];
type ItemSortKey = "name" | "type" | "rarity" | "price";
type SortDirection = "asc" | "desc";

function OwnershipDot({ label }: { label: string }) {
  return (
    <span
      className="h-1 w-1 shrink-0 rounded-full bg-wfrp-gold shadow-[0_0_4px_rgba(214,168,86,0.65)]"
      aria-label={label}
    />
  );
}

function formatFilterLabel(value: string) {
  return value
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getItemRarity(item: ItemDefinition) {
  return item.availability ?? "standard";
}

function getItemSortValue(item: ItemDefinition, sortKey: ItemSortKey) {
  if (sortKey === "type") {
    return item.type;
  }

  if (sortKey === "rarity") {
    const rarity = getItemRarity(item);
    const rarityIndex = availabilityOrder.indexOf(rarity);
    return rarityIndex === -1 ? Number.MAX_SAFE_INTEGER : rarityIndex;
  }

  if (sortKey === "price") {
    return getItemPriceInBrass(item);
  }

  return item.name;
}

function compareItems(firstItem: ItemDefinition, secondItem: ItemDefinition, sortKey: ItemSortKey) {
  const firstValue = getItemSortValue(firstItem, sortKey);
  const secondValue = getItemSortValue(secondItem, sortKey);

  if (typeof firstValue === "number" && typeof secondValue === "number") {
    return firstValue - secondValue || firstItem.name.localeCompare(secondItem.name, undefined, { sensitivity: "base" });
  }

  return String(firstValue).localeCompare(String(secondValue), undefined, { sensitivity: "base" }) ||
    firstItem.name.localeCompare(secondItem.name, undefined, { sensitivity: "base" });
}

function SortHeaderButton({
  align = "left",
  activeSortKey,
  label,
  sortDirection,
  sortKey,
  onSort,
}: {
  align?: "left" | "center" | "right";
  activeSortKey: ItemSortKey;
  label: string;
  sortDirection: SortDirection;
  sortKey: ItemSortKey;
  onSort: (sortKey: ItemSortKey) => void;
}) {
  const isActive = activeSortKey === sortKey;
  const alignClass = align === "center" ? "justify-center text-center" : align === "right" ? "justify-end text-right" : "justify-start text-left";

  return (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={`inline-flex items-center gap-1 uppercase transition-colors hover:text-wfrp-gold ${alignClass} ${
        isActive ? "text-wfrp-gold" : ""
      }`}
      aria-label={`Sort goods by ${label}`}
    >
      <span>{label}</span>
      {isActive ? (
        sortDirection === "asc" ? (
          <ArrowUp size={10} aria-hidden="true" strokeWidth={3} />
        ) : (
          <ArrowDown size={10} aria-hidden="true" strokeWidth={3} />
        )
      ) : null}
    </button>
  );
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
  coins: string;
  ownedItemIds: Set<string>;
  onAddToInventory: (item: ItemDefinition) => void;
  onBuy: (item: ItemDefinition) => void;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItemType, setSelectedItemType] = useState("All");
  const [selectedAvailability, setSelectedAvailability] = useState("All");
  const [sortKey, setSortKey] = useState<ItemSortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const sidebarRef = useRef<HTMLElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!sidebarRef.current?.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isFilterOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!filterRef.current?.contains(event.target as Node)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isFilterOpen]);

  const itemTypes = useMemo(() => {
    return Array.from(new Set(shopStock.map((item) => item.type)));
  }, []);

  const itemAvailabilities = useMemo(() => {
    return Array.from(new Set(shopStock.map((item) => item.availability ?? "standard"))).sort(
      (firstAvailability, secondAvailability) => {
        const firstIndex = availabilityOrder.indexOf(firstAvailability);
        const secondIndex = availabilityOrder.indexOf(secondAvailability);

        if (firstIndex !== -1 || secondIndex !== -1) {
          return (firstIndex === -1 ? Number.MAX_SAFE_INTEGER : firstIndex) -
            (secondIndex === -1 ? Number.MAX_SAFE_INTEGER : secondIndex);
        }

        return firstAvailability.localeCompare(secondAvailability);
      },
    );
  }, []);

  const filteredStock = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    const typeFilteredStock =
      selectedItemType === "All"
        ? shopStock
        : shopStock.filter((item) => item.type === selectedItemType);
    const availabilityFilteredStock =
      selectedAvailability === "All"
        ? typeFilteredStock
        : typeFilteredStock.filter((item) => (item.availability ?? "standard") === selectedAvailability);

    if (!normalizedSearchTerm) {
      return availabilityFilteredStock;
    }

    return availabilityFilteredStock.filter((item) =>
      [item.name, item.type, item.description, item.availability]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearchTerm)),
    );
  }, [searchTerm, selectedAvailability, selectedItemType]);

  const groupedStock = useMemo(() => {
    const sortItems = (stock: typeof shopStock) =>
      [...stock].sort((firstItem, secondItem) => {
        const comparison = compareItems(firstItem, secondItem, sortKey);
        return sortDirection === "asc" ? comparison : -comparison;
      });

    if (selectedItemType === "All") {
      return [
        {
          type: "All Goods",
          items: sortItems(filteredStock),
        },
      ];
    }

    const groups = filteredStock.reduce<Array<{ type: string; items: typeof shopStock }>>((groups, item) => {
      const existingGroup = groups.find((group) => group.type === item.type);

      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        groups.push({ type: item.type, items: [item] });
      }

      return groups;
    }, []);

    return groups.map((group) => ({ ...group, items: sortItems(group.items) }));
  }, [filteredStock, selectedItemType, sortDirection, sortKey]);

  const handleSort = (nextSortKey: ItemSortKey) => {
    setSortDirection((currentDirection) =>
      sortKey === nextSortKey && currentDirection === "asc" ? "desc" : "asc",
    );
    setSortKey(nextSortKey);
  };

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          ref={sidebarRef}
          key="shop-sidebar"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="wfrp-sidebar-shell w-[620px]"
        >
          <div className="wfrp-sidebar-header p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded border border-wfrp-gold/30 bg-black/20 text-wfrp-gold">
                <ShoppingBag size={18} />
              </div>
              <div className="flex flex-col">
                <h2 className="wfrp-sidebar-title text-sm uppercase tracking-widest text-wfrp-gold">
                  Shop
                </h2>
                <span className="wfrp-sidebar-kicker">Market & trade</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="wfrp-icon-btn rounded-full p-1 hover:bg-[#303030]"
              aria-label="Close shop"
            >
              <X size={20} className="cursor-pointer" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto bg-black/10 p-4 no-scrollbar">
            <div className="flex flex-col gap-4">
              <div className="wfrp-subpanel rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="wfrp-table-label">Coin</span>
                  <span className="wfrp-list-cell-strong font-mono text-gray-100">{coins}</span>
                </div>
              </div>

              <div ref={filterRef} className="relative flex gap-2">
                <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded border border-white/5 bg-black/30 px-3 text-gray-500 focus-within:border-wfrp-gold/40">
                  <Search size={14} />
                  <input
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-gray-200 outline-none placeholder:text-gray-600"
                    placeholder="Search goods"
                    aria-label="Search shop goods"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setIsFilterOpen((isOpen) => !isOpen)}
                  className="wfrp-action-btn h-10 shrink-0 gap-2 px-4"
                  aria-expanded={isFilterOpen}
                  aria-label="Filter shop goods by item type"
                >
                  <ListFilter size={14} />
                  Filter
                </button>

                {isFilterOpen && (
                  <div className="absolute right-0 top-12 z-20 max-h-[70vh] w-64 overflow-y-auto rounded border border-white/10 bg-[#151515] p-2 shadow-xl shadow-black/40 no-scrollbar">
                    <div className="px-2 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-700">
                      Type
                    </div>
                    {["All", ...itemTypes].map((itemType) => {
                      const itemCount =
                        itemType === "All"
                          ? shopStock.length
                          : shopStock.filter((item) => item.type === itemType).length;

                      return (
                        <button
                          key={itemType}
                          type="button"
                          onClick={() => {
                            setSelectedItemType(itemType);
                            setExpandedItemId(null);
                          }}
                          className={`flex h-8 w-full items-center justify-between rounded px-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors ${
                            selectedItemType === itemType
                              ? "bg-wfrp-gold/10 text-wfrp-gold"
                              : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
                          }`}
                        >
                          <span>{itemType}</span>
                          <span className="font-mono text-[9px] text-gray-600">{itemCount}</span>
                        </button>
                      );
                    })}

                    <div className="mx-2 my-2 border-t border-white/5" />
                    <div className="px-2 pb-1 text-[9px] font-black uppercase tracking-widest text-gray-700">
                      Rarity
                    </div>
                    {["All", ...itemAvailabilities].map((availability) => {
                      const itemCount =
                        availability === "All"
                          ? shopStock.length
                          : shopStock.filter((item) => (item.availability ?? "standard") === availability).length;

                      return (
                        <button
                          key={availability}
                          type="button"
                          onClick={() => {
                            setSelectedAvailability(availability);
                            setExpandedItemId(null);
                          }}
                          className={`flex h-8 w-full items-center justify-between rounded px-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors ${
                            selectedAvailability === availability
                              ? "bg-wfrp-gold/10 text-wfrp-gold"
                              : "text-gray-500 hover:bg-white/5 hover:text-gray-200"
                          }`}
                        >
                          <span>{formatFilterLabel(availability)}</span>
                          <span className="font-mono text-[9px] text-gray-600">{itemCount}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {(selectedItemType !== "All" || selectedAvailability !== "All") && (
                <div className="flex flex-wrap gap-2">
                  {selectedItemType !== "All" && (
                  <Chip
                    onClose={() => {
                      setSelectedItemType("All");
                      setExpandedItemId(null);
                    }}
                    closeLabel={`Clear ${selectedItemType} shop filter`}
                  >
                    {selectedItemType}
                  </Chip>
                  )}
                  {selectedAvailability !== "All" && (
                    <Chip
                      onClose={() => {
                        setSelectedAvailability("All");
                        setExpandedItemId(null);
                      }}
                      closeLabel={`Clear ${formatFilterLabel(selectedAvailability)} rarity filter`}
                    >
                      {formatFilterLabel(selectedAvailability)}
                    </Chip>
                  )}
                </div>
              )}

              <div className="wfrp-subpanel-shell">
                <div className="grid grid-cols-[1fr_132px_96px_84px_18px] gap-3 wfrp-list-header">
                  <SortHeaderButton activeSortKey={sortKey} label="Item" sortDirection={sortDirection} sortKey="name" onSort={handleSort} />
                  <SortHeaderButton activeSortKey={sortKey} label="Type" sortDirection={sortDirection} sortKey="type" onSort={handleSort} />
                  <SortHeaderButton activeSortKey={sortKey} label="Rarity" sortDirection={sortDirection} sortKey="rarity" onSort={handleSort} />
                  <SortHeaderButton align="right" activeSortKey={sortKey} label="Price" sortDirection={sortDirection} sortKey="price" onSort={handleSort} />
                  <span aria-hidden="true" />
                </div>

                <div className="max-h-[calc(100vh-250px)] overflow-y-auto p-2 no-scrollbar">
                  {groupedStock.map((group) => (
                    <div key={group.type} className="mb-3 last:mb-0">
                      {selectedItemType !== "All" ? (
                        <h4 className="wfrp-list-group">
                          <span>{group.type}</span>
                          <div className="wfrp-panel-rule" />
                        </h4>
                      ) : null}

                      {group.items.map((item) => {
                        const isOwned = ownedItemIds.has(item.id);

                        return (
                        <div key={item.id} className="rounded border border-transparent transition-colors hover:border-white/5">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedItemId((currentId) =>
                                currentId === item.id ? null : item.id,
                              )
                            }
                            className="wfrp-table-row grid w-full grid-cols-[1fr_132px_96px_84px_18px] gap-3 border-0 text-left"
                            aria-expanded={expandedItemId === item.id}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="wfrp-list-cell-strong truncate text-gray-200">
                                  {item.name}
                                </span>
                                {isOwned ? <OwnershipDot label="Already owned" /> : null}
                              </div>
                            </div>

                            <div className="wfrp-list-cell-strong min-w-0 truncate text-left">
                              {item.type}
                            </div>

                            <div className="wfrp-list-cell-strong min-w-0 truncate text-left">
                              {formatFilterLabel(getItemRarity(item))}
                            </div>

                            <div className="wfrp-list-cell-strong text-right font-mono">
                              {formatItemValue(item)}
                            </div>

                            <ChevronDown
                              size={14}
                              className={`mt-0.5 text-gray-600 transition-transform ${
                                expandedItemId === item.id ? "rotate-180 text-wfrp-gold" : ""
                              }`}
                            />
                          </button>

                          {expandedItemId === item.id && (
                            <div className="mx-2 mb-2 rounded border border-white/5 bg-black/20 p-3">
                              <p className="text-[11px] font-semibold leading-relaxed text-gray-400">
                                {item.description}
                              </p>
                              <div className="mt-3 grid grid-cols-2 gap-2">
                                <div>
                                  <span className="wfrp-table-label">Type</span>
                                  <p className="wfrp-list-cell-strong mt-1 text-gray-200">{item.type}</p>
                                </div>
                                <div>
                                  <span className="wfrp-table-label">Availability</span>
                                  <p className="wfrp-list-cell-strong mt-1 text-gray-200">
                                    {item.availability ?? "Standard"}
                                  </p>
                                </div>
                                <div>
                                  <span className="wfrp-table-label">Encumbrance</span>
                                  <p className="wfrp-list-cell-strong mt-1 font-mono text-gray-200">
                                    {item.encumbrance || "-"}
                                  </p>
                                </div>
                                <div>
                                  <span className="wfrp-table-label">Price</span>
                                  <p className="wfrp-list-cell-strong mt-1 font-mono text-gray-200">
                                    {formatItemValue(item)}
                                  </p>
                                </div>
                                {item.carries ? (
                                  <div className="col-span-2">
                                    <span className="wfrp-table-label">Carries</span>
                                    <p className="wfrp-list-cell-strong mt-1 font-mono text-gray-200">
                                      {item.carries} enc
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onAddToInventory(item)}
                                  className="wfrp-action-btn whitespace-nowrap px-4 py-1.5"
                                >
                                  Add
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onBuy(item)}
                                  className="wfrp-action-btn whitespace-nowrap px-4 py-1.5"
                                >
                                  Buy
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        );
                      })}
                    </div>
                  ))}

                  {filteredStock.length === 0 && (
                    <div className="px-2 py-6 text-center text-[10px] font-bold uppercase tracking-widest text-gray-700">
                      No matching goods
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
