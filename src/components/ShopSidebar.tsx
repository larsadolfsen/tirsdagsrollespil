import { AnimatePresence, motion } from "motion/react";
import { ChevronDown, Search, ShoppingBag, ShoppingCart, X } from "lucide-react";
import { useMemo, useState } from "react";
import { itemDefinitions } from "../data/rules/wfrp4e/items";
import { formatItemValue } from "../lib/gameSession";
import type { ItemDefinition } from "../types";

const shopStock = [...itemDefinitions].sort((firstItem, secondItem) => {
  const typeOrder = firstItem.type.localeCompare(secondItem.type);
  return typeOrder || firstItem.name.localeCompare(secondItem.name);
});

export function ShopSidebar({
  isOpen,
  coins,
  onAddToCart,
  onClose,
}: {
  isOpen: boolean;
  coins: string;
  onAddToCart: (item: ItemDefinition) => void;
  onClose: () => void;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const filteredStock = useMemo(() => {
    const normalizedSearchTerm = searchTerm.trim().toLowerCase();

    if (!normalizedSearchTerm) {
      return shopStock;
    }

    return shopStock.filter((item) =>
      [item.name, item.type, item.description, item.availability]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearchTerm)),
    );
  }, [searchTerm]);

  const groupedStock = useMemo(() => {
    return filteredStock.reduce<Array<{ type: string; items: typeof shopStock }>>((groups, item) => {
      const existingGroup = groups.find((group) => group.type === item.type);

      if (existingGroup) {
        existingGroup.items.push(item);
      } else {
        groups.push({ type: item.type, items: [item] });
      }

      return groups;
    }, []);
  }, [filteredStock]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          key="shop-sidebar"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="wfrp-sidebar-shell w-[400px]"
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

              <label className="flex h-10 items-center gap-2 rounded border border-white/5 bg-black/30 px-3 text-gray-500 focus-within:border-wfrp-gold/40">
                <Search size={14} />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-xs font-semibold text-gray-200 outline-none placeholder:text-gray-600"
                  placeholder="Search goods"
                  aria-label="Search shop goods"
                />
              </label>

              <div className="wfrp-subpanel-shell">
                <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-3 py-2">
                  <h3 className="wfrp-panel-title text-gray-300">Merchant Stock</h3>
                  <span className="wfrp-table-label">{filteredStock.length} goods</span>
                </div>

                <div className="grid grid-cols-[1fr_54px_64px] gap-3 wfrp-list-header">
                  <span className="text-left">Item</span>
                  <span className="text-center">Enc</span>
                  <span className="text-right">Price</span>
                </div>

                <div className="max-h-[calc(100vh-250px)] overflow-y-auto p-2 no-scrollbar">
                  {groupedStock.map((group) => (
                    <div key={group.type} className="mb-3 last:mb-0">
                      <h4 className="wfrp-list-group">
                        <span>{group.type}</span>
                        <div className="wfrp-panel-rule" />
                      </h4>

                      {group.items.map((item) => (
                        <div key={item.id} className="rounded border border-transparent transition-colors hover:border-white/5">
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedItemId((currentId) =>
                                currentId === item.id ? null : item.id,
                              )
                            }
                            className="wfrp-table-row grid w-full grid-cols-[1fr_54px_64px_18px] gap-3 border-0 text-left"
                            aria-expanded={expandedItemId === item.id}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="wfrp-list-cell-strong truncate text-gray-200">
                                  {item.name}
                                </span>
                                {item.availability ? (
                                  <span className="shrink-0 rounded border border-white/10 bg-black/20 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest text-gray-500">
                                    {item.availability}
                                  </span>
                                ) : null}
                              </div>
                              <p className="mt-1 line-clamp-2 text-[10px] font-semibold leading-snug text-gray-600">
                                {item.description}
                              </p>
                            </div>

                            <div className="wfrp-list-cell-strong text-center font-mono">
                              {item.encumbrance || "-"}
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
                              <button
                                type="button"
                                onClick={() => onAddToCart(item)}
                                className="wfrp-action-btn mt-3 h-9 w-full gap-2 text-[10px] font-black uppercase tracking-widest text-gray-200"
                              >
                                <ShoppingCart size={14} />
                                Add to Cart
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
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
