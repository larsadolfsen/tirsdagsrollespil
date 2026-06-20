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
    <div
      className="flex w-full items-center gap-2 bg-transparent pt-1"
      onTouchCancel={(event) => event.stopPropagation()}
      onTouchEnd={(event) => event.stopPropagation()}
      onTouchStart={(event) => event.stopPropagation()}
    >
      <div className="min-w-0 flex-1 self-stretch">
        <ScrollableTabStrip
          className="flex w-full min-w-max flex-nowrap items-center justify-center overflow-x-auto px-0 py-0 !px-0 md:flex-nowrap md:overflow-x-auto md:py-0 lg:w-max lg:min-w-0 lg:justify-start no-scrollbar"
        >
          <div
            className="inline-flex items-center"
            role="tablist"
            aria-label={ariaLabel}
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
                  )}
                >
                  <span
                    className={cn(
                      "inline-flex h-6 items-center justify-center px-3 transition-all group-active:scale-95 sm:px-4",
                      index === 0 && "rounded-l",
                      index === options.length - 1 && "rounded-r",
                      index < options.length - 1 && "border-r border-card",
                      isActive ? inlineSubtabButtonActiveClassName : inlineSubtabButtonInactiveClassName,
                    )}
                  >
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </ScrollableTabStrip>
      </div>
      {trailingContent ? (
        <div className="ml-auto flex h-12 shrink-0 items-center justify-end pr-2 sm:pr-3 lg:pr-4">
          {trailingContent}
        </div>
      ) : null}
    </div>
  );
}
