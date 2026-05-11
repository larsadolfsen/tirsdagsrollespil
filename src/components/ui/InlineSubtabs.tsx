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
    <div className="flex items-center gap-2 border-b border-white/5 bg-black/20">
      <div className="min-w-0 flex-1">
        <ScrollableTabStrip className="flex items-center justify-start gap-2 py-3 pr-3 pl-0 !pl-0 md:p-3 md:!pl-3 lg:p-4 lg:!pl-4 overflow-x-auto no-scrollbar">
          {options.map((option) => (
            <button
              key={option.id}
              onClick={() => onChange(option.id)}
              className={`px-3 py-1 rounded text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30 ${
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
        <div className="shrink-0 pr-3 lg:pr-4">
          {trailingContent}
        </div>
      ) : null}
    </div>
  );
}
