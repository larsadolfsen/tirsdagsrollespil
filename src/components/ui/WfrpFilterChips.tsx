import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type WfrpFilterChipOption<T extends string> = {
  id: T;
  label: string;
};

export function WfrpFilterChips<T extends string>({
  options,
  selectedIds,
  onChange,
  ariaLabel = "Filters",
}: {
  options: WfrpFilterChipOption<T>[];
  selectedIds: T[];
  onChange: (selectedIds: T[]) => void;
  ariaLabel?: string;
}) {
  const selectedIdSet = new Set(selectedIds);

  const toggleOption = (id: T) => {
    onChange(
      selectedIdSet.has(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={ariaLabel}>
      {options.map((option) => {
        const isSelected = selectedIdSet.has(option.id);

        return (
          <label key={option.id} className="group cursor-pointer">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleOption(option.id)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "wfrp-label inline-flex h-6 items-center justify-center rounded border leading-none transition-colors",
                "peer-focus-visible:outline-none peer-focus-visible:ring-1 peer-focus-visible:ring-wfrp-gold/60",
                isSelected
                  ? "border-transparent bg-wfrp-gold pl-1 pr-2 text-primary-foreground"
                  : "border-transparent bg-white/10 px-2 text-wfrp-muted-text group-hover:bg-white/15 group-hover:text-gray-100",
              )}
            >
              {isSelected && (
                <Check size={12} className="mr-1 shrink-0" aria-hidden="true" />
              )}
              {option.label}
            </span>
          </label>
        );
      })}
    </div>
  );
}
