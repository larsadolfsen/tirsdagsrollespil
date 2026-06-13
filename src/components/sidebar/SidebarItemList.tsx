import type { ReactNode } from "react";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { SubtabActionButton } from "../ui/SubtabActionButton";

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
  id: string;
  isMarked?: boolean;
  name: ReactNode;
};

type SidebarItemListProps = {
  className?: string;
  emptyMessage?: ReactNode;
  items: SidebarListItem[];
  title?: ReactNode;
};

export function SidebarItemList({
  className,
  emptyMessage = "No items available.",
  items,
  title,
}: SidebarItemListProps) {
  const [openItemId, setOpenItemId] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <p className={cn("rounded border border-dashed border-wfrp-border bg-black/15 p-3 text-xs font-semibold text-wfrp-muted-text", className)}>
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={cn("flex flex-col overflow-hidden rounded border border-wfrp-border bg-transparent pb-4", className)}>
      {title ? (
        <div className="border-b border-wfrp-border bg-wfrp-table px-4 py-2 text-[10px] font-black uppercase tracking-widest text-wfrp-muted-text">
          {title}
        </div>
      ) : null}
      {items.map((item, index) => {
        const isOpen = openItemId === item.id;

        return (
          <div
            key={item.id}
            className={cn(
              "cursor-pointer border-b border-wfrp-border last:border-b-0",
              index % 2 === 0 ? "bg-card" : "bg-wfrp-table",
            )}
          >
            <button
              type="button"
              className={cn(
                "flex w-full cursor-pointer justify-between gap-3 px-4 text-left text-sm font-semibold leading-6 text-gray-200 transition-colors hover:bg-transparent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50",
                isOpen ? "min-h-10 items-start pb-1 pt-3" : "min-h-12 items-center py-2",
              )}
              aria-expanded={isOpen}
              onClick={() => setOpenItemId((current) => (current === item.id ? null : item.id))}
            >
              <span className="flex min-w-0 flex-1 items-center gap-2">
                <span className="min-w-0 truncate">{item.name}</span>
                {item.isMarked ? (
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full bg-wfrp-gold"
                    aria-label="Already bought"
                  />
                ) : null}
              </span>
              <ChevronDown
                size={16}
                className={cn(
                  "mt-1 shrink-0 text-wfrp-muted-text transition-transform",
                  isOpen && "rotate-180 text-wfrp-gold",
                )}
                aria-hidden="true"
              />
            </button>
            {isOpen ? (
              <div
                className={cn(
                  "px-4 pt-0 text-xs font-semibold leading-relaxed text-wfrp-muted-text",
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
                        className="grid min-w-0 grid-cols-[minmax(5rem,max-content)_minmax(0,1fr)] items-baseline gap-3 text-[11px] font-bold text-wfrp-muted-text"
                      >
                        <span className="text-wfrp-muted-text">{detail.label}</span>
                        <span className="min-w-0 text-left text-gray-100">{detail.value}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
                {item.actions?.length ? (
                  <div className="mt-0 flex flex-wrap gap-2">
                    {item.actions.map((action) => (
                      <SubtabActionButton
                        key={String(action.label)}
                        className={action.className}
                        disabled={action.disabled}
                        isActive={action.isActive}
                        onClick={action.onClick}
                      >
                        {action.label}
                      </SubtabActionButton>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
