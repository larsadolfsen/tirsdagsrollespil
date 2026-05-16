import { useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { inlineSubtabButtonActiveClassName, inlineSubtabButtonBaseClassName, inlineSubtabButtonInactiveClassName } from "@/src/lib/tabStyles";
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
    <div className="flex flex-col items-stretch gap-2 bg-wfrp-bg/50 md:flex-row md:items-start">
      <div className="min-w-0 flex-1 self-stretch">
        <ScrollableTabStrip
          className="flex w-full min-w-max flex-nowrap items-center justify-center gap-1.5 overflow-x-auto px-0 pb-3 pt-0 !px-0 sm:gap-2 md:flex-nowrap md:overflow-x-auto md:pb-3 md:pt-0 lg:w-max lg:min-w-0 lg:justify-start no-scrollbar"
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
                className={cn(
                  inlineSubtabButtonBaseClassName,
                  isActive ? inlineSubtabButtonActiveClassName : inlineSubtabButtonInactiveClassName,
                )}
              >
                {option.label}
              </button>
            );
          })}
        </ScrollableTabStrip>
      </div>
      {trailingContent ? (
        <div className="shrink-0 bg-wfrp-bg/50 px-0 pb-3 md:pb-3 md:pr-0">
          {trailingContent}
        </div>
      ) : null}
    </div>
  );
}
