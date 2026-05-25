export interface InventoryMenuState {
  id: string;
  mode: "move" | "drop";
  top: number;
  left: number;
}

export type InventoryDropTargetId = "carried" | string;

export type InventoryDragState =
  | {
      type: "item";
      itemId: string;
    }
  | {
      type: "coins";
    };
