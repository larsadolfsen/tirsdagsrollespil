import { X } from "lucide-react";
import type { ReactNode } from "react";

export function Chip({
  children,
  onClose,
  closeLabel,
}: {
  children: ReactNode;
  onClose?: () => void;
  closeLabel?: string;
}) {
  return (
    <span className="group inline-flex items-center gap-1.5 rounded border border-white/10 bg-black/25 px-2 py-1 transition-colors hover:border-white/20">
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="-ml-0.5 flex h-3.5 w-3.5 items-center justify-center text-wfrp-muted-text transition-colors hover:text-gray-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
          aria-label={closeLabel}
        >
          <X size={10} />
        </button>
      ) : null}
      <span className="text-[10px] font-bold uppercase tracking-wider text-wfrp-muted-text transition-colors group-hover:text-gray-200">
        {children}
      </span>
    </span>
  );
}
