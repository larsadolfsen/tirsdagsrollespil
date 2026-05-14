import type { ReactNode } from "react";
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
}: {
  options: InlineSubtabOption<T>[];
  activeId: T;
  onChange: (id: T) => void;
  trailingContent?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1 border-b border-white/5 bg-transparent md:flex-row md:items-center md:gap-2 md:bg-black/20">
      <div className="min-w-0 flex-1 self-stretch">
        <ScrollableTabStrip
          className="flex flex-wrap items-center justify-center gap-1.5 overflow-visible px-0 py-2 md:flex-nowrap md:justify-start md:gap-2 md:overflow-x-auto md:p-3 lg:p-4 no-scrollbar"
          edgePaddingClassName="px-1 md:pl-12 md:pr-12"
        >
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`min-h-8 rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 md:px-3 ${
                activeId === option.id
                  ? "bg-wfrp-tab-active text-white shadow-lg"
                  : "bg-black/40 text-gray-400 hover:bg-wfrp-surface-raised hover:text-gray-200"
              }`}
              aria-pressed={activeId === option.id}
            >
              {option.label}
            </button>
          ))}
        </ScrollableTabStrip>
      </div>
      {trailingContent ? (
        <div className="shrink-0 pb-2 md:pb-0 md:pr-3 lg:pr-4">
          {trailingContent}
        </div>
      ) : null}
    </div>
  );
}
