import { GripVertical, Minus } from "lucide-react";
import type { DragEvent as ReactDragEvent, MouseEvent as ReactMouseEvent, RefObject } from "react";
import { useMobileMainViewSwipeHandlers } from "../components/MobileMainViewSwipeContext";
import { InlineSubtabs, SubtabActionButton } from "../components/ui";
import {
  SheetDataAccordionDetails,
  SheetDataAccordionRow,
  SheetDataDisclosureCell,
  SheetDataPanel,
  SheetDataSection,
  SheetRowActionButton,
} from "../components/wfrp";
import { InventoryContextMenu } from "./inventory/InventoryContextMenu";
import { useInventoryViewModel } from "./inventory/useInventoryViewModel";
import type { ResolvedCharacterEquipment, ResolvedCharacterRecord } from "../data/characters/resolved";
import type { InventorySubtab } from "./tabTypes";
import type { InventoryDragState, InventoryDropTargetId, InventoryMenuState } from "../types/inventory";
import { getConsumableBaseName } from "./inventory/inventoryUtils";

const desktopInventoryGridClass = "md:grid-cols-[36px_minmax(0,1fr)_140px_48px_60px_60px_48px]";
const mobileInventoryGridClass = "grid-cols-[32px_minmax(0,1fr)_44px_44px_48px]";

export function InventoryTab({
  activeInventorySubtab,
  setActiveInventorySubtab,
  characterData,
  coinContainerId,
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
  canDropInventoryDrag,
  canDropInventoryItem,
  canStoreInContainer,
  handleInventoryDragOver,
  handleInventoryDrop,
  handleInventoryDragStart,
  handleCoinDragStart,
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
  coinContainerId: string | null;
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
  canDropInventoryDrag: (
    dragState: InventoryDragState,
    targetContainerId: string | null,
    targetWorn?: boolean,
    targetCarried?: boolean,
  ) => boolean;
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
  handleCoinDragStart: (event: ReactDragEvent<HTMLDivElement>) => void;
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
  const mobileMainViewSwipeHandlers = useMobileMainViewSwipeHandlers();
  const { inventorySubtabOptions, visibleSections, wallet } = useInventoryViewModel({
    activeInventorySubtab,
    carriedItems,
    characterCoins: characterData.coins,
    coinContainerId,
    containers,
    getContainerContents,
    getContainerUsedEncumbrance,
    formatItemValue,
    inventoryDrag,
    wornItems,
  });

  const renderDragHandle = ({
    draggable,
    label,
  }: {
    draggable: boolean;
    label: string;
  }) => (
    <div className="flex h-9 w-8 items-center justify-center">
      <button
        type="button"
        className="flex h-7 w-7 cursor-grab items-center justify-center rounded bg-transparent text-wfrp-muted-text transition-colors hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 active:cursor-grabbing disabled:cursor-default disabled:opacity-20"
        aria-label={label}
        disabled={!draggable}
        tabIndex={draggable ? 0 : -1}
        onClick={(event) => event.preventDefault()}
      >
        <GripVertical size={14} aria-hidden="true" />
      </button>
    </div>
  );

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
          <SubtabActionButton
            onClick={openShop}
            hideOnMobile
            aria-label="Add item"
          >
            Add item
          </SubtabActionButton>
        }
      />

      <div
        {...(mobileMainViewSwipeHandlers ?? {})}
        className="flex-1 space-y-4 overflow-y-auto overflow-x-hidden bg-transparent px-2 pb-2 pt-1 sm:px-3 sm:pb-3 lg:px-4 lg:pb-4"
      >
        <SheetDataPanel className="bg-wfrp-table px-3 py-3 sm:px-4">
          <div className="flex items-end justify-between leading-none">
            <span className="text-[9px] font-bold uppercase tracking-tight text-wfrp-muted-text">
              Encumbrance
            </span>
            <span className="font-mono text-[10px] font-bold text-gray-200">
              {totalEncumbrance} / {carryCapacity}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-wfrp-border shadow-inner">
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
        </SheetDataPanel>

        {visibleSections.map((section) => {
            const isActiveDropTarget = inventoryDropTarget === section.id;
            const acceptsDrops = section.acceptsDrops !== false;
            const dropsToWorn = section.dropWorn === true;
            const dropsToCarried = section.dropCarried === true;
            const showsWallet =
              wallet.coinCount > 0 &&
              (wallet.containerId === null
                ? dropsToCarried
                : wallet.containerId === section.dropContainerId);
            const canDropHere = acceptsDrops && inventoryDrag
              ? canDropInventoryDrag(
                  inventoryDrag,
                  section.dropContainerId,
                  dropsToWorn,
                  dropsToCarried,
                )
              : false;

            return (
              <SheetDataSection
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
                className={`${
                  isActiveDropTarget
                    ? "bg-wfrp-gold/5 ring-1 ring-inset ring-wfrp-gold/50"
                    : canDropHere
                      ? "ring-1 ring-inset ring-wfrp-gold/20"
                      : ""
                }`}
                gridClassName={`${mobileInventoryGridClass} ${desktopInventoryGridClass}`}
                leadingLabels={[{ align: "center", label: "" }]}
                sectionLabel={(
                  <span className="flex min-w-0 items-center gap-2">
                    <span className="truncate">{section.title}</span>
                    {section.subtitle ? (
                      <span className="truncate font-mono text-[9px] font-bold uppercase tracking-wider text-wfrp-muted-text">
                        {section.subtitle}
                      </span>
                    ) : null}
                  </span>
                )}
                valueLabels={[
                  { className: "hidden md:block", label: "Type" },
                  { align: "right", label: "Qty" },
                  { align: "right", label: "Enc" },
                  { align: "right", className: "hidden md:block", label: "Value" },
                  { align: "center", label: "" },
                ]}
              >
                  {showsWallet && (
                    <SheetDataAccordionRow
                      draggable={wallet.isDraggable}
                      onDragStart={(event) => handleCoinDragStart(event as unknown as ReactDragEvent<HTMLDivElement>)}
                      onDragEnd={handleInventoryDragEnd}
                      className={`${wallet.isDragging ? "opacity-45" : ""} ${
                        wallet.isDraggable ? "cursor-grab active:cursor-grabbing" : ""
                      }`}
                      summaryClassName={`${mobileInventoryGridClass} md:grid ${desktopInventoryGridClass} md:gap-0`}
                      contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                      summary={(
                        <>
                          {renderDragHandle({
                            draggable: wallet.isDraggable,
                            label: "Move coins",
                          })}
                          <span className="wfrp-list-cell-strong flex min-w-0 items-center gap-1.5 text-left text-gray-200">
                            <span className="truncate">Coins</span>
                          </span>
                          <div className="hidden wfrp-list-cell-strong truncate md:block">Currency</div>
                          <div className="wfrp-list-cell-strong text-right font-mono">{wallet.coinCount}</div>
                          <div className="wfrp-list-cell-strong text-right font-mono">{wallet.encumbrance || "-"}</div>
                          <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">{wallet.value}</div>
                          <SheetDataDisclosureCell />
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
                        className={`${row.isDragging ? "opacity-45" : ""} ${
                          row.isDraggable ? "cursor-grab active:cursor-grabbing" : ""
                        }`}
                        summaryClassName={`${mobileInventoryGridClass} md:grid ${desktopInventoryGridClass} md:gap-0`}
                        contentClassName="px-10 pb-4 pt-1 md:col-span-full md:px-14 md:pb-4"
                        summary={(
                          <>
                            {renderDragHandle({
                              draggable: row.isDraggable,
                              label: `Move ${item.name}`,
                            })}
                            <span className="wfrp-list-cell-strong flex min-w-0 items-center gap-1.5 text-left text-gray-200">
                              <span className="truncate">{item.name}</span>
                            </span>

                            <div className="hidden wfrp-list-cell-strong truncate md:block">{item.type}</div>
                            <div className="wfrp-list-cell-strong text-right font-mono">{row.quantity}</div>
                            <div className="wfrp-list-cell-strong text-right font-mono">{row.encumbrance}</div>
                            <div className="hidden wfrp-list-cell-strong text-right font-mono md:block">{row.value}</div>
                            <SheetDataDisclosureCell />
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
                {section.itemRows.length === 0 && !showsWallet && section.id !== "carried" && (
                  <div className="px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-wfrp-muted-text">
                    {canDropHere ? "Drop here" : "Empty"}
                  </div>
                )}
              </SheetDataSection>
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
