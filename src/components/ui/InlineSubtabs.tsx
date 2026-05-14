import { useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { ScrollableTabStrip } from "./ScrollableTabStrip";

type InlineSubtabOption<T extends string> = {
  id: T;
  label: string;
};

export function InlineSubtabs<T extends string>({
  options,
  activeId,
  onChange,
  trailingContent,
  ariaLabel = "Section tabs",
}: {
  options: InlineSubtabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  trailingContent?: ReactNode;
  ariaLabel?: string;
}) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    event.preventDefault();
    const nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? options.length - 1
          : event.key === "ArrowRight"
            ? (index + 1) % options.length
            : (index - 1 + options.length) % options.length;

    onChange(options[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex flex-col items-center gap-2 border-b border-white/5 bg-transparent md:flex-row md:bg-black/20">
      <div className="min-w-0 flex-1 self-stretch">
        <ScrollableTabStrip
          className="flex flex-wrap items-center justify-center gap-1.5 overflow-visible py-3 px-0 !px-0 sm:gap-2 md:flex-nowrap md:justify-start md:overflow-x-auto md:p-3 md:!px-3 lg:p-4 lg:!px-4 no-scrollbar"
          role="tablist"
          ariaLabel={ariaLabel}
        >
          {options.map((option, index) => {
            const isActive = activeId === option.id;

            return (
              <button
                key={option.id}
                ref={(element) => {
                  tabRefs.current[index] = element;
                }}
                role="tab"
                aria-selected={isActive}
                tabIndex={isActive ? 0 : -1}
                onKeyDown={(event) => onTabKeyDown(event, index)}
                onClick={() => onChange(option.id)}
                className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 sm:px-3 ${
                  isActive
                    ? "bg-wfrp-tab-active text-white shadow-lg"
                    : "bg-black/40 text-gray-400 hover:bg-wfrp-surface-raised hover:text-gray-200"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </ScrollableTabStrip>
      </div>
      {trailingContent ? (
        <div className="shrink-0 px-0 pb-3 md:pr-3 md:pb-0 lg:pr-4">
          {trailingContent}
        </div>
      ) : null}
    </div>
  );
}
