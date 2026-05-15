import { Minus } from "lucide-react";
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent, RefObject } from "react";
import { InlineSubtabs } from "../components/ui";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDisclosureChevron,
  SheetDataHeader,
  SheetDataHeaderCell,
  SheetDataPanel,
  SheetDataTable,
  SheetRowActionButton,
} from "../components/wfrp";
import { InventoryContextMenu } from "./inventory/InventoryContextMenu";
import { useInventoryViewModel } from "./inventory/useInventoryViewModel";
import type { ResolvedCharacterEquipment, ResolvedCharacterRecord } from "../data/characters/resolved";
import type { InventorySubtab } from "./tabTypes";
import type { InventoryDragState, InventoryDropTargetId, InventoryMenuState } from "../types/inventory";
import { getConsumableBaseName } from "./inventory/inventoryUtils";

const desktopInventoryGridClass = "md:grid-cols-[minmax(0,1fr)_140px_48px_60px_60px_48px]";

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
    <div className="flex h-full flex-col overflow-hidden bg-card">
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

      <div className="flex-1 overflow-y-auto overflow-x-hidden bg-card">
        <SheetDataPanel>
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
                className={`mt-4 first:mt-0 ${
                  isActiveDropTarget
                    ? "bg-wfrp-gold/5 ring-1 ring-inset ring-wfrp-gold/50"
                    : canDropHere
                      ? "ring-1 ring-inset ring-wfrp-gold/20"
                      : ""
                }`}
              >
                <SheetDataHeader className={`hidden ${desktopInventoryGridClass} md:grid md:gap-0`}>
                  <SheetDataHeaderCell className="flex min-w-0 items-center gap-2">
                    <span className="truncate">{section.title}</span>
                    {section.subtitle ? (
                      <span className="truncate font-mono text-[9px] font-bold uppercase tracking-wider text-gray-600">
                        {section.subtitle}
                      </span>
                    ) : null}
                  </SheetDataHeaderCell>
                  <SheetDataHeaderCell>Type</SheetDataHeaderCell>
                  <SheetDataHeaderCell align="right">Qty</SheetDataHeaderCell>
                  <SheetDataHeaderCell align="right">Enc</SheetDataHeaderCell>
                  <SheetDataHeaderCell align="right">Value</SheetDataHeaderCell>
                  <SheetDataHeaderCell align="center">More</SheetDataHeaderCell>
                </SheetDataHeader>

                <div className="border-b border-t border-white/5 bg-card px-2 py-1 md:hidden">
                  <span className="wfrp-table-label flex min-w-0 items-center gap-2 text-left">
                    <span className="truncate">{section.title}</span>
                    {section.subtitle ? (
                      <span className="truncate font-mono text-[9px] font-bold uppercase tracking-wider text-gray-600">
                        {section.subtitle}
                      </span>
                    ) : null}
                  </span>
                </div>

                <SheetDataTable>
                  {section.id === "carried" && (
                    <SheetDataAccordionRow
                      className="wfrp-skill-row"
                      summaryClassName={`wfrp-skill-row-summary grid-cols-[minmax(0,1fr)_48px] md:grid ${desktopInventoryGridClass} md:gap-0`}
                      contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                      summary={(
                        <>
                          <span className="wfrp-list-cell-strong flex min-w-0 items-center gap-1.5 text-left text-gray-200">
                            <span className="truncate">Coins</span>
                          </span>
                          <div className="hidden wfrp-list-cell-strong truncate md:block">Currency</div>
                          <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">{wallet.coinCount}</div>
                          <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">{wallet.encumbrance || "-"}</div>
                          <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">{wallet.value}</div>
                          <SheetDataDisclosureChevron className="md:inline-flex" />
                        </>
                      )}
                    >
                      <SheetDataAccordionDetails
                        rows={wallet.mobileDetails.map((field) => ({ label: field.label, value: field.value }))}
                      />
                    </SheetDataAccordionRow>
                  )}

                  {section.itemRows.map((row) => {
                    const { item } = row;

                    return (
                      <SheetDataAccordionRow
                        key={item.id}
                        draggable={row.isDraggable}
                        onDragStart={(event) => handleInventoryDragStart(item, event as unknown as ReactDragEvent<HTMLDivElement>)}
                        onDragEnd={handleInventoryDragEnd}
                        className={`wfrp-skill-row ${row.isDragging ? "opacity-45" : ""} ${
                          row.isDraggable ? "cursor-grab active:cursor-grabbing" : ""
                        }`}
                        summaryClassName={`wfrp-skill-row-summary grid-cols-[minmax(0,1fr)_48px] md:grid ${desktopInventoryGridClass} md:gap-0`}
                        contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                        summary={(
                          <>
                            <span className="wfrp-list-cell-strong flex min-w-0 items-center gap-1.5 text-left text-gray-200">
                              <span className="truncate">{item.name}</span>
                            </span>

                            <div className="hidden wfrp-list-cell-strong truncate md:block">{item.type}</div>
                            <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">{row.quantity}</div>
                            <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">{row.encumbrance}</div>
                            <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">{row.value}</div>
                            <SheetDataDisclosureChevron className="md:inline-flex" />
                          </>
                        )}
                      >
                        <SheetDataAccordionDetails
                          description={item.description}
                          rows={[
                            { label: "Type", value: item.type },
                            { label: "Qty", value: row.quantity },
                            { label: "Enc", value: row.encumbrance },
                            { label: "Value", value: row.value },
                          ]}
                        >
                          <div className="flex flex-wrap items-center justify-end gap-1 border-t border-white/10 pt-2">
                            {renderItemActions(item)}
                          </div>
                        </SheetDataAccordionDetails>
                      </SheetDataAccordionRow>
                    );
                  })}
                </SheetDataTable>

                {section.itemRows.length === 0 && section.id !== "carried" && (
                  <div className="px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-700">
                    {canDropHere ? "Drop here" : "Empty"}
                  </div>
                )}
              </div>
            );
          })}
        </SheetDataPanel>
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
