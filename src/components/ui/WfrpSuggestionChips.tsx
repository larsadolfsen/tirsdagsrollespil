import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type WfrpSuggestionChipOption<TId extends string = string> = {
  id: TId;
  label: ReactNode;
};

type WfrpSuggestionChipsProps<TId extends string = string> = {
  className?: string;
  label: ReactNode;
  onToggle: (id: TId) => void;
  options: Array<WfrpSuggestionChipOption<TId>>;
  selectedIds: TId[];
};

export function WfrpSuggestionChips<TId extends string = string>({
  className,
  label,
  onToggle,
  options,
  selectedIds,
}: WfrpSuggestionChipsProps<TId>) {
  return (
    <div className={cn("border-b border-wfrp-border bg-[#242424] px-4 py-3", className)}>
      <div className="text-[10px] font-black uppercase tracking-widest text-wfrp-muted-text">
        {label}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = selectedIds.includes(option.id);

          return (
            <button
              key={option.id}
              type="button"
              className={cn(
                "group inline-flex h-12 min-w-[88px] items-center justify-center rounded focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/60",
              )}
              aria-pressed={isActive}
              onClick={() => onToggle(option.id)}
            >
              <span
                className={cn(
                  "inline-flex h-6 min-w-[88px] items-center justify-start overflow-hidden rounded border-2 text-[11px] font-bold uppercase transition-colors",
                  isActive
                    ? "border-[#3f3f3f] bg-[#3f3f3f] pr-3 text-gray-100 group-hover:border-[#484848] group-hover:bg-[#484848]"
                    : "border-wfrp-border bg-black/15 px-3 text-wfrp-muted-text group-hover:border-wfrp-border group-hover:bg-white/8 group-hover:text-gray-100",
                )}
              >
                {isActive ? (
                  <span className="inline-flex h-full shrink-0 items-center justify-center px-1">
                    <Check size={18} aria-hidden="true" />
                  </span>
                ) : null}
                <span>{option.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
