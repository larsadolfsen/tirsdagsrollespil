import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "../ui";

export type SidebarListItem = {
  actions?: Array<{
    className?: string;
    disabled?: boolean;
    isActive?: boolean;
    label: ReactNode;
    onClick: () => void;
  }>;
  description?: ReactNode;
  details?: Array<{
    label: ReactNode;
    value: ReactNode;
  }>;
  extra?: ReactNode;
  id: string;
  isMarked?: boolean;
  markerVariant?: "gold" | "gray";
  meta?: ReactNode;
  name: ReactNode;
};

export type SidebarItemProps = {
  index?: number;
  isOpen?: boolean;
  isSelected?: boolean;
  item: SidebarListItem;
  itemClassName?: string;
  onClick: (item: SidebarListItem) => void;
  variant?: "disclosure" | "select";
};

export function SidebarItem({
  index = 0,
  isOpen = false,
  isSelected = false,
  item,
  itemClassName,
  onClick,
  variant = "disclosure",
}: SidebarItemProps) {
  const markerVariant = item.markerVariant ?? (item.isMarked ? "gold" : null);
  const isDisclosure = variant === "disclosure";

  return (
    <div
      className={cn(
        "cursor-pointer border-b border-wfrp-border last:border-b-0",
        index % 2 === 0 ? "bg-card" : "bg-background",
      )}
    >
      <button
        type="button"
        className={cn(
          "flex w-full cursor-pointer justify-between gap-3 px-4 text-left wfrp-text-strong leading-6 text-wfrp-muted-text transition-colors hover:bg-wfrp-surface-raised hover:text-white focus-visible:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50",
          isOpen ? "min-h-10 items-start pb-1 pt-3" : "min-h-12 items-center py-2",
          isSelected && "text-wfrp-gold",
          itemClassName,
        )}
        aria-current={isSelected ? "page" : undefined}
        aria-expanded={isDisclosure ? isOpen : undefined}
        onClick={() => onClick(item)}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2">
          <span className="min-w-0 flex-1 truncate">{item.name}</span>
          {markerVariant ? (
            <span
              className={cn(
                "h-1.5 w-1.5 shrink-0 rounded-full",
                markerVariant === "gold" ? "bg-wfrp-gold" : "bg-wfrp-muted-text",
              )}
              aria-label={markerVariant === "gold" ? "Has advances" : "Career skill"}
            />
          ) : null}
          {item.meta ? (
            <span className="wfrp-label ml-auto shrink-0 text-wfrp-muted-text">
              {item.meta}
            </span>
          ) : null}
        </span>
        {isDisclosure ? (
          <ChevronDown
            size={16}
            className={cn(
              "mt-1 shrink-0 text-wfrp-muted-text transition-transform",
              isOpen && "rotate-180 text-wfrp-gold",
            )}
            aria-hidden="true"
          />
        ) : null}
      </button>
      {isDisclosure && isOpen ? (
        <div
          className={cn(
            "px-4 pt-0 wfrp-text-strong text-wfrp-muted-text",
            item.actions?.length ? "pb-0" : "pb-4",
          )}
        >
          <div>
            {item.description || <span className="italic">No description available.</span>}
          </div>
          {item.details?.length ? (
            <div className="mt-3 inline-flex w-fit max-w-full min-w-0 flex-col gap-1">
              {item.details.map((detail) => (
                <div
                  key={String(detail.label)}
                  className="grid min-w-0 grid-cols-[minmax(5rem,max-content)_minmax(0,1fr)] items-baseline gap-3 wfrp-text-strong text-wfrp-muted-text"
                >
                  <span className="text-wfrp-muted-text">{detail.label}</span>
                  <span className="min-w-0 text-left text-wfrp-muted-text">{detail.value}</span>
                </div>
              ))}
            </div>
          ) : null}
          {item.actions?.length ? (
            <div className="mt-0 flex flex-wrap gap-2">
              {item.actions.map((action) => (
                <Button
                  variant="subtabAction"
                  key={String(action.label)}
                  className={action.className}
                  disabled={action.disabled}
                  isActive={action.isActive}
                  onClick={action.onClick}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          ) : null}
          {item.extra ? (
            <div className="mt-2 text-sm font-semibold text-wfrp-gold">
              {item.extra}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

type SidebarItemListProps = {
  className?: string;
  emptyMessage?: ReactNode;
  headerMeta?: ReactNode;
  itemClassName?: string;
  items: SidebarListItem[];
  onItemSelect?: (item: SidebarListItem) => void;
  selectedItemId?: string | null;
  title?: ReactNode;
};

export function SidebarItemList({
  className,
  emptyMessage = "No items available.",
  headerMeta,
  itemClassName,
  items,
  onItemSelect,
  selectedItemId,
  title,
}: SidebarItemListProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className={cn("rounded border border-dashed border-wfrp-border bg-black/15 p-3 wfrp-text-strong text-wfrp-muted-text", className)}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col overflow-hidden rounded border border-wfrp-border bg-transparent pb-4", className)}>
      {title ? (
        <div className="wfrp-label flex items-center gap-3 border-b border-wfrp-border bg-wfrp-table px-4 py-2 text-wfrp-muted-text">
          <span className="min-w-0 flex-1">{title}</span>
          {headerMeta ? (
            <span className="mr-[28px] shrink-0 text-right">
              {headerMeta}
            </span>
          ) : null}
        </div>
      ) : null}
      {items.map((item, index) => {
        const isSelectable = Boolean(onItemSelect);

        return (
          <SidebarItem
            key={item.id}
            index={index}
            item={item}
            itemClassName={itemClassName}
            variant={isSelectable ? "select" : "disclosure"}
            isOpen={!isSelectable && openItemId === item.id}
            isSelected={isSelectable && selectedItemId === item.id}
            onClick={(clickedItem) => {
              if (onItemSelect) {
                onItemSelect(clickedItem);
                return;
              }

              setOpenItemId((current) => (current === clickedItem.id ? null : clickedItem.id));
            }}
          />
        );
      })}
    </div>
  );
}
