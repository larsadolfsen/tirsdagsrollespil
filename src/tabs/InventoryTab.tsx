import { Minus } from "lucide-react";
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent, RefObject } from "react";
import { InlineSubtabs } from "../components/ui";
import {
  SheetDataDisclosureChevron,
  SheetDataHeader,
  SheetDataList,
  SheetDataListRow,
  SheetDataMobileDetails,
  SheetDataPanel,
  SheetRowActionButton,
} from "../components/wfrp";
import { InventoryContextMenu } from "./inventory/InventoryContextMenu";
import { useInventoryViewModel } from "./inventory/useInventoryViewModel";
import type { ResolvedCharacterEquipment, ResolvedCharacterRecord } from "../data/characters/resolved";
import type { InventorySubtab } from "./tabTypes";
import type { InventoryDragState, InventoryDropTargetId, InventoryMenuState } from "../types/inventory";
import { getConsumableBaseName } from "./inventory/inventoryUtils";

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
  const { inventorySubtabOptions, visibleSections, wallet } = useInventoryViewModel({
    activeInventorySubtab,
    carriedItems,
    characterCoins: characterData.coins,
    containers,
    getContainerContents,
    getContainerUsedEncumbrance,
    formatItemValue,
    inventoryDrag,
    wornItems,
  });

  const renderItemActions = (item: ResolvedCharacterEquipment) => (
    <>
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
      <SheetRowActionButton
        onClick={(event) => {
          event.preventDefault();
          handleToggleInventoryMenu(item.id, event, "drop");
        }}
        aria-label={`Drop ${item.name}`}
      >
        <span className="font-mono text-[10px] font-bold leading-none">Drop</span>
      </SheetRowActionButton>
      <SheetRowActionButton
        onClick={(event) => {
          event.preventDefault();
          handleToggleInventoryMenu(item.id, event, "move");
        }}
        aria-label={`Move ${item.name}`}
      >
        <span className="font-mono text-[10px] font-bold leading-none">Move</span>
      </SheetRowActionButton>
    </>
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <InlineSubtabs<InventorySubtab>
        options={inventorySubtabOptions}
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
        {visibleSections.map((section) => {
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
              <SheetDataPanel
                key={section.id}
                as="div"
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
                <SheetDataHeader className="hidden min-w-[700px] grid-cols-[1fr_140px_48px_60px_60px_132px] gap-2 lg:gap-4 md:grid">
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
                </SheetDataHeader>

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

                <SheetDataList className="divide-y-0">
                  {section.id === "carried" && (
                    <SheetDataListRow className="border-0 group md:flex md:min-w-[700px]">
                      <details className="group/details md:hidden">
                        <summary className="grid min-h-11 cursor-pointer list-none grid-cols-[minmax(0,1fr)_auto] items-center gap-2 [&::-webkit-details-marker]:hidden">
                          <span className="wfrp-list-cell-strong flex items-center gap-1.5 text-gray-200">Coins</span>
                          <SheetDataDisclosureChevron className="md:inline" />
                        </summary>
                        <SheetDataMobileDetails fields={wallet.mobileDetails} />
                      </details>

                      <div className="hidden flex-1 grid-cols-[1fr_140px_48px_60px_60px_132px] gap-2 lg:gap-4 items-center md:grid">
                        <span className="wfrp-list-cell-strong flex items-center gap-1.5 text-gray-200">Coins</span>
                        <div className="wfrp-list-cell-strong truncate">Currency</div>
                        <div className="wfrp-list-cell-strong text-center font-mono">{wallet.coinCount}</div>
                        <div className="wfrp-list-cell-strong text-center font-mono">{wallet.encumbrance || "-"}</div>
                        <div className="wfrp-list-cell-strong text-center font-mono">{wallet.value}</div>
                        <div className="wfrp-list-cell-strong pr-1 text-right font-mono">-</div>
                      </div>
                    </SheetDataListRow>
                  )}

                  {section.itemRows.map((row) => {
                    const { item } = row;

                    return (
                      <SheetDataListRow
                        key={item.id}
                        draggable={row.isDraggable}
                        onDragStart={(event) => handleInventoryDragStart(item, event)}
                        onDragEnd={handleInventoryDragEnd}
                        className={`border-0 group md:flex md:min-w-[700px] ${
                          row.isDragging ? "opacity-45" : ""
                        } ${
                          row.isDraggable ? "cursor-grab active:cursor-grabbing" : ""
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
                              {renderItemActions(item)}
                            </div>

                            <SheetDataDisclosureChevron className="md:inline" />
                          </summary>

                          <SheetDataMobileDetails fields={row.mobileDetails} />
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
                          <div className="wfrp-list-cell-strong text-center font-mono">{row.quantity}</div>
                          <div className="wfrp-list-cell-strong text-center font-mono">{row.encumbrance}</div>
                          <div className="wfrp-list-cell-strong text-center font-mono">{row.value}</div>
                          <div className="relative flex items-center justify-end gap-1 pr-1">
                            {renderItemActions(item)}
                          </div>
                        </div>
                      </SheetDataListRow>
                    );
                  })}

                  {section.itemRows.length === 0 && section.id !== "carried" && (
                    <div className="px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-700">
                      {canDropHere ? "Drop here" : "Empty"}
                    </div>
                  )}
                </SheetDataList>
              </SheetDataPanel>
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
