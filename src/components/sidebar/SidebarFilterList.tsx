import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { cn } from "../../lib/utils";

const FILTER_BUTTON_BASE_WIDTH = 36;
const FILTER_BUTTON_CHARACTER_WIDTH = 9;
const FILTER_MORE_BUTTON_WIDTH = 88;

export type SidebarFilterOption<TId extends string = string> = {
  id: TId;
  label: string;
  shortLabel?: string;
};

type SidebarFilterListProps<TId extends string = string> = {
  ariaLabel: string;
  label: string;
  onChange: (id: TId) => void;
  options: Array<SidebarFilterOption<TId>>;
  value: TId;
};

export function SidebarFilterList<TId extends string = string>({
  ariaLabel,
  label,
  onChange,
  options,
  value,
}: SidebarFilterListProps<TId>) {
  const [promotedOptionIds, setPromotedOptionIds] = useState<TId[]>([]);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [rowWidth, setRowWidth] = useState(0);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const rowShellRef = useRef<HTMLDivElement | null>(null);
  const pinnedOption = options[0];
  const secondaryOptions = useMemo(() => options.slice(1), [options]);

  useEffect(() => {
    if (!isMoreOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (!moreRef.current?.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [isMoreOpen]);

  useLayoutEffect(() => {
    const rowShell = rowShellRef.current;
    if (!rowShell) return;

    const updateRowWidth = () => setRowWidth(rowShell.clientWidth);
    updateRowWidth();

    const observer = new ResizeObserver(updateRowWidth);
    observer.observe(rowShell);

    return () => observer.disconnect();
  }, []);

  const orderedSecondaryOptionIds = useMemo(() => {
    const optionIdSet = new Set(secondaryOptions.map((option) => option.id));
    const newestPromotedOptions = promotedOptionIds.filter((optionId) => optionIdSet.has(optionId));
    const defaultOptions = secondaryOptions
      .map((option) => option.id)
      .filter((optionId) => !newestPromotedOptions.includes(optionId));

    return [...newestPromotedOptions, ...defaultOptions];
  }, [promotedOptionIds, secondaryOptions]);

  const maxVisibleSecondaryOptions = useMemo(() => {
    if (orderedSecondaryOptionIds.length <= 1 || !rowWidth) return 2;

    const orderedOptions = orderedSecondaryOptionIds
      .map((optionId) => options.find((option) => option.id === optionId))
      .filter((option): option is SidebarFilterOption<TId> => Boolean(option));
    const hasOverflowWithTwo = orderedSecondaryOptionIds.length > 2;
    const estimatedTwoOptionWidth = [pinnedOption, ...orderedOptions.slice(0, 2)]
      .filter((option): option is SidebarFilterOption<TId> => Boolean(option))
      .reduce(
        (totalWidth, option) =>
          totalWidth + FILTER_BUTTON_BASE_WIDTH + (option.shortLabel ?? option.label).length * FILTER_BUTTON_CHARACTER_WIDTH,
        0,
      ) +
      (hasOverflowWithTwo ? FILTER_MORE_BUTTON_WIDTH : 0);

    return estimatedTwoOptionWidth > rowWidth ? 1 : 2;
  }, [options, orderedSecondaryOptionIds, pinnedOption, rowWidth]);

  const visibleSecondaryOptions = useMemo(() => {
    return orderedSecondaryOptionIds.slice(0, maxVisibleSecondaryOptions);
  }, [maxVisibleSecondaryOptions, orderedSecondaryOptionIds]);

  const visibleOptionIds = useMemo(
    () => [
      ...(pinnedOption ? [pinnedOption.id] : []),
      ...visibleSecondaryOptions,
    ],
    [pinnedOption, visibleSecondaryOptions],
  );
  const visibleOptions = visibleOptionIds
    .map((optionId) => options.find((option) => option.id === optionId))
    .filter((option): option is SidebarFilterOption<TId> => Boolean(option));
  const overflowOptions = secondaryOptions
    .filter((option) => !visibleOptionIds.includes(option.id))
    .sort((firstOption, secondOption) => firstOption.label.localeCompare(secondOption.label));

  const selectVisibleOption = (optionId: TId) => {
    onChange(optionId);
  };

  const selectDropdownOption = (optionId: TId) => {
    onChange(optionId);

    if (pinnedOption?.id === optionId) return;

    setPromotedOptionIds((currentOptionIds) => [
      optionId,
      ...currentOptionIds.filter((currentOptionId) => currentOptionId !== optionId),
    ].slice(0, 2));
  };

  const visibleSegmentCount = visibleOptions.length + (overflowOptions.length ? 1 : 0);

  const renderOptionButton = (option: SidebarFilterOption<TId>, index: number) => {
    const isActive = value === option.id;

    return (
      <motion.button
        key={option.id}
        layout="position"
        initial={{ opacity: 0, x: -12 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        type="button"
        role="tab"
        aria-selected={isActive}
        onClick={() => selectVisibleOption(option.id)}
        tabIndex={isActive ? 0 : -1}
        className="group inline-flex h-12 shrink-0 cursor-pointer items-center justify-center bg-transparent p-0 text-[11px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50"
      >
        <span
          className={cn(
            "inline-flex h-6 items-center justify-center px-3 transition-all group-active:scale-95 sm:px-4",
            index === 0 && "rounded-l",
            index === visibleSegmentCount - 1 && "rounded-r",
            index < visibleSegmentCount - 1 && "border-r border-card",
            isActive
              ? "bg-wfrp-gold text-primary-foreground"
              : "bg-[#303030] text-wfrp-muted-text group-hover:bg-white/10",
          )}
        >
          {option.shortLabel ?? option.label}
        </span>
      </motion.button>
    );
  };

  return (
    <div className={cn("relative", isMoreOpen ? "z-50" : "z-10")}>
      <div className="text-[10px] font-black uppercase tracking-widest text-wfrp-muted-text">
        {label}
      </div>
      <div ref={rowShellRef} className="min-w-0 max-w-full">
        <div className="relative inline-flex min-w-0 max-w-full items-center justify-start" role="tablist" aria-label={ariaLabel}>
          <AnimatePresence initial={false}>
            {visibleOptions.map((option, index) => renderOptionButton(option, index))}
          </AnimatePresence>
          {overflowOptions.length ? (
            <div ref={moreRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsMoreOpen((isOpen) => !isOpen)}
                className="group inline-flex h-12 cursor-pointer items-center justify-center bg-transparent p-0 text-[11px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50"
                aria-expanded={isMoreOpen}
                aria-label={`Show more ${label.toLowerCase()} filters`}
              >
                <span className="inline-flex h-6 items-center justify-center gap-1 rounded-r bg-[#303030] px-3 text-wfrp-muted-text transition-all group-hover:bg-white/10 group-active:scale-95 sm:px-4">
                  More
                  <ChevronDown
                    size={13}
                    className={cn("transition-transform", isMoreOpen && "rotate-180")}
                    aria-hidden="true"
                  />
                </span>
              </button>
              {isMoreOpen ? (
                <div className="absolute left-0 top-10 z-50 max-h-72 min-w-56 overflow-y-auto rounded border border-wfrp-border bg-wfrp-popover p-1 shadow-xl shadow-black/40 no-scrollbar">
                  {overflowOptions.map((option) => {
                    const isActive = value === option.id;

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => {
                          selectDropdownOption(option.id);
                          setIsMoreOpen(false);
                        }}
                        className={cn(
                          "flex h-8 w-full items-center whitespace-nowrap rounded px-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors",
                          isActive ? "bg-wfrp-gold/10 text-wfrp-gold" : "text-wfrp-muted-text hover:bg-white/10",
                        )}
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
