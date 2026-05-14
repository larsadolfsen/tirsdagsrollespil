import { ChevronDown, Minus } from "lucide-react";
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent, RefObject } from "react";
import { InlineSubtabs } from "../components/ui";
import { InventoryContextMenu } from "./inventory/InventoryContextMenu";
import type { ResolvedCharacterEquipment, ResolvedCharacterRecord } from "../data/characters/resolved";
import type { InventorySubtab } from "./tabTypes";
import type { InventoryDragState, InventoryDropTargetId, InventoryMenuState } from "../types/inventory";
import {
  formatCoinTotalValue,
  getCoinCount,
  getCoinEncumbrance,
  getConsumableBaseName,
  getConsumableCount,
  getInventoryEncumbrance,
  isPacksAndContainersItem,
} from "./inventory/inventoryUtils";

type InventorySection = {
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

const inventoryMobileDetailsClass =
  "mt-2 grid grid-cols-2 gap-2 rounded border border-white/5 bg-black/20 p-2 md:hidden";

function MobileDetail({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="wfrp-table-label">{label}</div>
      <div className="wfrp-list-cell-strong">{value}</div>
    </div>
  );
}

export function InventoryTab({
  activeInventorySubtab,
  setActiveInventorySubtab,
  characterData,
  equipmentState,
  totalEncumbrance,
  carryCapacity,
  encumbrancePercent,
  containers,
  wornItems,
  carriedItems,
  inventoryDrag,
  inventoryDropTarget,
  setInventoryDropTarget,
  activeInventoryMenu,
  inventoryMenuRef,
  getContainerUsedEncumbrance,
  getContainerContents,
  canDropInventoryItem,
  canStoreInContainer,
  handleInventoryDragOver,
  handleInventoryDrop,
  handleInventoryDragStart,
  handleInventoryDragEnd,
  handleConsumeItem,
  handleToggleInventoryMenu,
  handleDropItem,
  handleWearItem,
  handleUnwearItem,
  handleCarryItem,
  handleStoreItem,
  formatItemValue,
  openShop,
  openEquipmentInfo,
}: {
  activeInventorySubtab: InventorySubtab;
  setActiveInventorySubtab: (subtab: InventorySubtab) => void;
  characterData: ResolvedCharacterRecord;
  equipmentState: ResolvedCharacterEquipment[];
  totalEncumbrance: number;
  carryCapacity: number;
  encumbrancePercent: number;
  containers: ResolvedCharacterEquipment[];
  wornItems: ResolvedCharacterEquipment[];
  carriedItems: ResolvedCharacterEquipment[];
  inventoryDrag: InventoryDragState | null;
  inventoryDropTarget: InventoryDropTargetId | null;
  setInventoryDropTarget: (updater: (current: InventoryDropTargetId | null) => InventoryDropTargetId | null) => void;
  activeInventoryMenu: InventoryMenuState | null;
  inventoryMenuRef: RefObject<HTMLDivElement | null>;
  getContainerUsedEncumbrance: (containerId: string) => number;
  getContainerContents: (containerId: string) => ResolvedCharacterEquipment[];
  canDropInventoryItem: (
    itemId: string,
    targetContainerId: string | null,
    targetWorn?: boolean,
    targetCarried?: boolean,
  ) => boolean;
  canStoreInContainer: (itemId: string, containerId: string) => boolean;
  handleInventoryDragOver: (
    targetId: InventoryDropTargetId,
    targetContainerId: string | null,
    event: ReactDragEvent<HTMLDivElement>,
    targetWorn?: boolean,
    targetCarried?: boolean,
  ) => void;
  handleInventoryDrop: (
    targetContainerId: string | null,
    event: ReactDragEvent<HTMLDivElement>,
    targetWorn?: boolean,
    targetCarried?: boolean,
  ) => void;
  handleInventoryDragStart: (item: ResolvedCharacterEquipment, event: ReactDragEvent<HTMLDivElement>) => void;
  handleInventoryDragEnd: () => void;
  handleConsumeItem: (itemId: string) => void;
  handleToggleInventoryMenu: (
    itemId: string,
    event: ReactMouseEvent<HTMLButtonElement>,
    mode: InventoryMenuState["mode"],
  ) => void;
  handleDropItem: (itemId: string) => void;
  handleWearItem: (itemId: string) => void;
  handleUnwearItem: (itemId: string) => void;
  handleCarryItem: (itemId: string) => void;
  handleStoreItem: (itemId: string, containerId: string) => void;
  formatItemValue: (item: ResolvedCharacterEquipment) => string;
  openShop: () => void;
  openEquipmentInfo: (itemName: string) => void;
}) {
  const walletCoinCount = getCoinCount(characterData.coins);
  const walletEncumbrance = getCoinEncumbrance(characterData.coins);

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
        walletCoinCount > 0 ||
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

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <InlineSubtabs<InventorySubtab>
        options={[
          { id: "all", label: "All" },
          { id: "carried", label: "Ready" },
          { id: "worn", label: "Worn" },
          ...containers.map((container) => ({
            id: `container:${container.id}` as InventorySubtab,
            label: container.name,
          })),
        ]}
        activeId={activeInventorySubtab}
        onChange={setActiveInventorySubtab}
        trailingContent={
          <div className="flex items-center gap-4">
            <div className="hidden w-32 flex-col gap-1 sm:flex lg:w-40">
              <div className="flex items-end justify-between leading-none">
                <span className="text-[9px] font-bold uppercase tracking-tight text-gray-400">
                  Encumbrance
                </span>
                <span className="font-mono text-[10px] font-bold text-gray-200">
                  {totalEncumbrance} / {carryCapacity}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-wfrp-border shadow-inner">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    totalEncumbrance > carryCapacity ? "bg-wfrp-red" : "bg-wfrp-gold"
                  }`}
                  style={{ width: `${encumbrancePercent}%` }}
                  role="progressbar"
                  aria-valuenow={totalEncumbrance}
                  aria-valuemin={0}
                  aria-valuemax={carryCapacity}
                  aria-label="Current encumbrance"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={openShop}
              className="wfrp-standard-btn h-7 gap-1.5 px-3 font-black tracking-[0.12em] max-md:hidden"
              aria-label="Add item"
            >
              <span className="whitespace-nowrap">Add item</span>
            </button>
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        {sections
          .filter((section) => {
            if (!section.alwaysVisible) return false;
            if (activeInventorySubtab === "all") return true;
            if (activeInventorySubtab === "worn") return section.id === "worn";
            if (activeInventorySubtab === "carried") return section.id === "carried";
            return activeInventorySubtab === `container:${section.id}`;
          })
          .map((section) => {
            const isActiveDropTarget = inventoryDropTarget === section.id;
            const acceptsDrops = section.acceptsDrops !== false;
            const dropsToWorn = section.dropWorn === true;
            const dropsToCarried = section.dropCarried === true;
            const canDropHere = acceptsDrops && inventoryDrag
              ? canDropInventoryItem(
                  inventoryDrag.itemId,
                  section.dropContainerId,
                  dropsToWorn,
                  dropsToCarried,
                )
              : false;

            return (
              <div
                key={section.id}
                onDragOver={(event) =>
                  acceptsDrops
                    ? handleInventoryDragOver(
                        section.id,
                        section.dropContainerId,
                        event,
                        dropsToWorn,
                        dropsToCarried,
                      )
                    : undefined
                }
                onDragLeave={() =>
                  setInventoryDropTarget((current) =>
                    current === section.id ? null : current,
                  )
                }
                onDrop={(event) =>
                  acceptsDrops
                    ? handleInventoryDrop(
                        section.dropContainerId,
                        event,
                        dropsToWorn,
                        dropsToCarried,
                      )
                    : undefined
                }
                className={`wfrp-subpanel overflow-x-hidden shadow-sm md:overflow-x-auto ${
                  isActiveDropTarget
                    ? "border-wfrp-gold/50 bg-wfrp-gold/5"
                    : canDropHere
                      ? "border-wfrp-gold/20"
                      : ""
                }`}
              >
                <div className="hidden min-w-[700px] grid-cols-[1fr_140px_48px_60px_60px_132px] gap-2 lg:gap-4 wfrp-list-header md:grid">
                  <span className="flex min-w-0 items-center gap-2 text-left">
                    <span className="truncate">{section.title}</span>
                    {section.subtitle ? (
                      <span className="truncate font-mono text-[9px] font-bold uppercase tracking-wider text-gray-600">
                        {section.subtitle}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-left">Type</span>
                  <span className="text-center">Qty</span>
                  <span className="text-center">Enc</span>
                  <span className="text-center">Value</span>
                  <span className="text-right">Actions</span>
                </div>

                <div className="border-b border-white/5 bg-black/10 px-2 py-1 md:hidden">
                  <span className="wfrp-table-label flex min-w-0 items-center gap-2 text-left">
                    <span className="truncate">{section.title}</span>
                    {section.subtitle ? (
                      <span className="truncate font-mono text-[9px] font-bold uppercase tracking-wider text-gray-600">
                        {section.subtitle}
                      </span>
                    ) : null}
                  </span>
                </div>

                {section.id === "carried" && (
                  <div className="wfrp-table-row border-0 group md:flex md:min-w-[700px]">
                    <details className="group/details md:hidden">
                      <summary className="grid min-h-11 cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-2 [&::-webkit-details-marker]:hidden">
                        <span className="wfrp-list-cell-strong flex items-center gap-1.5 text-gray-200">Coins</span>
                        <ChevronDown size={14} className="text-gray-500 transition-transform group-open/details:rotate-180" aria-hidden="true" />
                      </summary>
                      <div className={inventoryMobileDetailsClass}>
                        <MobileDetail label="Type" value="Currency" />
                        <MobileDetail label="Qty" value={walletCoinCount} />
                        <MobileDetail label="Enc" value={walletEncumbrance || "-"} />
                        <MobileDetail label="Value" value={formatCoinTotalValue(characterData.coins)} />
                      </div>
                    </details>

                    <div className="hidden flex-1 grid-cols-[1fr_140px_48px_60px_60px_132px] gap-2 lg:gap-4 items-center md:grid">
                      <span className="wfrp-list-cell-strong flex items-center gap-1.5 text-gray-200">Coins</span>
                      <div className="wfrp-list-cell-strong truncate">Currency</div>
                      <div className="wfrp-list-cell-strong text-center font-mono">{walletCoinCount}</div>
                      <div className="wfrp-list-cell-strong text-center font-mono">{walletEncumbrance || "-"}</div>
                      <div className="wfrp-list-cell-strong text-center font-mono">{formatCoinTotalValue(characterData.coins)}</div>
                      <div className="wfrp-list-cell-strong pr-1 text-right font-mono">-</div>
                    </div>
                  </div>
                )}

                {section.items.map((item) => {
                  const quantity = getConsumableCount(item) ?? 1;
                  const itemEncumbrance = getInventoryEncumbrance(item) || "-";
                  const itemValue = formatItemValue(item);

                  return (
                    <div
                      key={item.id}
                      draggable={!isPacksAndContainersItem(item)}
                      onDragStart={(event) => handleInventoryDragStart(item, event)}
                      onDragEnd={handleInventoryDragEnd}
                      className={`wfrp-table-row border-0 group md:flex md:min-w-[700px] ${
                        inventoryDrag?.itemId === item.id ? "opacity-45" : ""
                      } ${
                        isPacksAndContainersItem(item) ? "" : "cursor-grab active:cursor-grabbing"
                      }`}
                    >
                      <details className="group/details md:hidden">
                        <summary className="grid min-h-11 cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 [&::-webkit-details-marker]:hidden">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.preventDefault();
                              openEquipmentInfo(item.name);
                            }}
                            className="wfrp-skill-link flex min-w-0 items-center gap-1.5 text-left"
                          >
                            <span className="truncate">{item.name}</span>
                          </button>

                          <div className="relative flex items-center justify-end gap-1 pr-1">
                            {item.type === "Consumable" && (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.preventDefault();
                                  handleConsumeItem(item.id);
                                }}
                                className="wfrp-stepper-btn focus-visible:ring-wfrp-red/50 disabled:cursor-not-allowed disabled:opacity-20"
                                aria-label={`Use one ${getConsumableBaseName(item).toLowerCase()}`}
                              >
                                <Minus size={10} />
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                handleToggleInventoryMenu(item.id, event, "drop");
                              }}
                              className="wfrp-stepper-btn inline-flex h-5 min-w-12 items-center justify-center px-1.5 py-0 focus-visible:ring-wfrp-gold/50"
                              aria-label={`Drop ${item.name}`}
                            >
                              <span className="font-mono text-[10px] font-bold leading-none">Drop</span>
                            </button>
                            <button
                              type="button"
                              onClick={(event) => {
                                event.preventDefault();
                                handleToggleInventoryMenu(item.id, event, "move");
                              }}
                              className="wfrp-stepper-btn inline-flex h-5 min-w-12 items-center justify-center px-1.5 py-0 focus-visible:ring-wfrp-gold/50"
                              aria-label={`Move ${item.name}`}
                            >
                              <span className="font-mono text-[10px] font-bold leading-none">Move</span>
                            </button>
                          </div>

                          <ChevronDown size={14} className="text-gray-500 transition-transform group-open/details:rotate-180" aria-hidden="true" />
                        </summary>

                        <div className={inventoryMobileDetailsClass}>
                          <MobileDetail label="Type" value={item.type} />
                          <MobileDetail label="Qty" value={quantity} />
                          <MobileDetail label="Enc" value={itemEncumbrance} />
                          <MobileDetail label="Value" value={itemValue} />
                        </div>
                      </details>

                      <div className="hidden flex-1 grid-cols-[1fr_140px_48px_60px_60px_132px] gap-2 lg:gap-4 items-center md:grid">
                        <button
                          type="button"
                          onClick={() => openEquipmentInfo(item.name)}
                          className="wfrp-skill-link flex min-w-0 items-center gap-1.5 text-left"
                        >
                          <span className="truncate">{item.name}</span>
                        </button>
                        <div className="wfrp-list-cell-strong truncate">{item.type}</div>
                        <div className="wfrp-list-cell-strong text-center font-mono">{quantity}</div>
                        <div className="wfrp-list-cell-strong text-center font-mono">{itemEncumbrance}</div>
                        <div className="wfrp-list-cell-strong text-center font-mono">{itemValue}</div>
                        <div className="relative flex items-center justify-end gap-1 pr-1">
                          {item.type === "Consumable" && (
                            <button
                              type="button"
                              onClick={() => handleConsumeItem(item.id)}
                              className="wfrp-stepper-btn focus-visible:ring-wfrp-red/50 disabled:cursor-not-allowed disabled:opacity-20"
                              aria-label={`Use one ${getConsumableBaseName(item).toLowerCase()}`}
                            >
                              <Minus size={10} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(event) => handleToggleInventoryMenu(item.id, event, "drop")}
                            className="wfrp-stepper-btn inline-flex h-5 min-w-12 items-center justify-center px-1.5 py-0 focus-visible:ring-wfrp-gold/50"
                            aria-label={`Drop ${item.name}`}
                          >
                            <span className="font-mono text-[10px] font-bold leading-none">Drop</span>
                          </button>
                          <button
                            type="button"
                            onClick={(event) => handleToggleInventoryMenu(item.id, event, "move")}
                            className="wfrp-stepper-btn inline-flex h-5 min-w-12 items-center justify-center px-1.5 py-0 focus-visible:ring-wfrp-gold/50"
                            aria-label={`Move ${item.name}`}
                          >
                            <span className="font-mono text-[10px] font-bold leading-none">Move</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {section.items.length === 0 && section.id !== "carried" && (
                  <div className="px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-700">
                    {canDropHere ? "Drop here" : "Empty"}
                  </div>
                )}
              </div>
            );
          })}
      </div>

      <InventoryContextMenu
        activeInventoryMenu={activeInventoryMenu}
        canDropInventoryItem={canDropInventoryItem}
        canStoreInContainer={canStoreInContainer}
        containers={containers}
        equipmentState={equipmentState}
        handleCarryItem={handleCarryItem}
        handleDropItem={handleDropItem}
        handleStoreItem={handleStoreItem}
        handleUnwearItem={handleUnwearItem}
        handleWearItem={handleWearItem}
        inventoryMenuRef={inventoryMenuRef}
      />
    </div>
  );
}
