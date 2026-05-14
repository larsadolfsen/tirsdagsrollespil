import { useRef } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Button } from "./button";
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
    <div className="flex items-center gap-2 border-b border-white/5 bg-transparent md:bg-black/20">
      <div className="min-w-0 flex-1">
        <ScrollableTabStrip
          className="flex flex-wrap items-center justify-center gap-2 overflow-visible py-3 pr-0 pl-0 !pr-0 !pl-0 md:flex-nowrap md:justify-start md:overflow-x-auto md:p-3 md:!pr-3 md:!pl-3 lg:p-4 lg:!pr-4 lg:!pl-4 no-scrollbar"
          role="tablist"
          ariaLabel={ariaLabel}
        >
          {options.map((option, index) => (
            <Button
              key={option.id}
              ref={(element) => {
                tabRefs.current[index] = element;
              }}
              role="tab"
              aria-selected={activeId === option.id}
              data-state={activeId === option.id ? "active" : "inactive"}
              tabIndex={activeId === option.id ? 0 : -1}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              onClick={() => onChange(option.id)}
              variant="tab"
              size="chip"
              className="text-[10px] font-black tracking-wider focus-visible:ring-white/30"
            >
              {option.label}
            </Button>
          ))}
        </ScrollableTabStrip>
      </div>
      {trailingContent ? (
        <div className="shrink-0 pr-0 md:pr-3 lg:pr-4">
          {trailingContent}
        </div>
      ) : null}
    </div>
  );
}
