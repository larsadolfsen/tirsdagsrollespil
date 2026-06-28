import { Check, type LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type WfrpFilterChipOption<T extends string> = {
  id: T;
  label: string;
  icon?: LucideIcon;
  imageUrl?: string;
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
        const Icon = option.icon;
        const hasLeadingDecoration = isSelected || !!Icon || !!option.imageUrl;

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
                "wfrp-label relative isolate inline-flex h-6 items-center justify-center overflow-hidden rounded-full border-2 leading-none transition-[border-color,color] duration-200 ease-out",
                "peer-focus-visible:outline-none peer-focus-visible:ring-1 peer-focus-visible:ring-wfrp-gold/60",
                isSelected
                  ? "border-wfrp-gold bg-wfrp-gold pr-2 text-primary-foreground"
                  : cn(
                      "border-white/20 bg-transparent text-wfrp-muted-text before:pointer-events-none before:absolute before:inset-0 before:-z-10 before:rounded-full before:bg-white/10 before:opacity-0 before:transition-opacity before:duration-200 before:ease-out group-hover:border-wfrp-gold group-hover:text-gray-100 group-hover:before:opacity-100",
                    ),
                hasLeadingDecoration ? "pl-0" : "pl-2",
              )}
            >
              {option.imageUrl !== undefined ? (
                <span
                  className={cn(
                    "mr-1 h-4 w-4 shrink-0 rounded-full overflow-hidden flex-none transition-colors duration-200",
                    option.imageUrl
                      ? "ml-[2px] bg-white/20"
                      : isSelected
                        ? "-ml-[5px] bg-[var(--color-wfrp-gold)]"
                        : "-ml-[5px] bg-white/20 group-hover:bg-[var(--color-wfrp-gold)]",
                  )}
                >
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt=""
                      aria-hidden="true"
                      className="h-full w-full object-cover"
                    />
                  )}
                </span>
              ) : isSelected ? (
                <Check size={12} className="mr-1 shrink-0" aria-hidden="true" />
              ) : Icon ? (
                <Icon size={12} className="mr-1 shrink-0" aria-hidden="true" />
              ) : null}
              <span className="translate-y-px pr-2">{option.label}</span>
            </span>
          </label>
        );
      })}
    </div>
  );
}
