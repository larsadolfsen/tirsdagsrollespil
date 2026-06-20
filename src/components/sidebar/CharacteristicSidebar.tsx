import { useMemo } from "react";
import { AppSidebar } from "./AppSidebar";
import { SidebarItemList } from "./SidebarItemList";

type CharacteristicSidebarItem = {
  advances: number;
  initial: number;
  key: string;
  label: string;
  pendingAdvances: number;
  value: number;
};

export function CharacteristicSidebar({
  characteristics,
  careerCharacteristicKeys,
  getCharacteristicDescription,
  getNextAdvanceCost,
  isOpen,
  onClose,
  pendingAvailableXp,
  purchaseCharacteristicAdvance,
  removePendingCharacteristicAdvance,
}: {
  characteristics: CharacteristicSidebarItem[];
  careerCharacteristicKeys: string[];
  getCharacteristicDescription: (key: string) => string;
  getNextAdvanceCost: (currentAdvances: number) => number;
  isOpen: boolean;
  onClose: () => void;
  pendingAvailableXp: number;
  purchaseCharacteristicAdvance: (characteristicKey: string) => void;
  removePendingCharacteristicAdvance: (characteristicKey: string) => void;
}) {
  const careerCharacteristicKeySet = useMemo(
    () => new Set(careerCharacteristicKeys),
    [careerCharacteristicKeys],
  );
  const characteristicItems = characteristics.map((characteristic) => {
    const totalAdvances = characteristic.advances + characteristic.pendingAdvances;
    const totalValue = characteristic.initial + totalAdvances;
    const nextCost = getNextAdvanceCost(totalAdvances);
    const isCareerCharacteristic = careerCharacteristicKeySet.has(characteristic.key);
    const canPurchase = isCareerCharacteristic && pendingAvailableXp >= nextCost;

    return {
      actions: [
        ...(characteristic.pendingAdvances > 0 ? [{
          className: "[&_span]:bg-[#4a4a4a] [&_span]:text-wfrp-muted-text hover:[&_span]:bg-[#555555]",
          label: "-1",
          onClick: () => removePendingCharacteristicAdvance(characteristic.key),
        }] : []),
        {
          disabled: !canPurchase,
          isActive: canPurchase,
          label: `Increase for ${nextCost} XP`,
          onClick: () => purchaseCharacteristicAdvance(characteristic.key),
        },
      ],
      description: getCharacteristicDescription(characteristic.key),
      details: [
        { label: "Score", value: totalValue },
        {
          label: "Advances",
          value: characteristic.pendingAdvances > 0
            ? `${characteristic.advances} +${characteristic.pendingAdvances}`
            : characteristic.advances,
        },
        { label: "Cost", value: `${nextCost} XP` },
        { label: "Career", value: isCareerCharacteristic ? "Yes" : "No" },
      ],
      id: characteristic.key,
      markerVariant: totalAdvances > 0 ? "gold" as const : isCareerCharacteristic ? "gray" as const : undefined,
      meta: (
        <span className="grid w-24 grid-cols-[3rem_2.5rem] items-center justify-end gap-2 text-right">
          <span>{characteristic.key}</span>
          <span>{totalAdvances > 0 ? `+${totalAdvances}` : "-"}</span>
        </span>
      ),
      name: characteristic.label,
    };
  });

  return (
    <AppSidebar
      isOpen={isOpen}
      motionKey="characteristic-sidebar"
      onClose={onClose}
      overlayUntil="desktop"
      side="right"
      title="Advance Characteristic"
      titleId="characteristic-sidebar-title"
      closeLabel="Close characteristic sidebar"
      contentClassName="!p-0"
      trapFocus
      closeOnOutsidePointerDown
    >
      <SidebarItemList
        className="!rounded-none !border-0"
        headerMeta={(
          <span className="grid w-24 grid-cols-[3rem_2.5rem] items-center justify-end gap-2 text-right">
            <span>CHAR.</span>
            <span>ADV.</span>
          </span>
        )}
        items={characteristicItems}
        title="Characteristic"
        emptyMessage="No characteristics available."
      />
    </AppSidebar>
  );
}
