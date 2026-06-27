import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function BottomSheetPaper({
  children,
  className,
  isPullable = false,
}: {
  children: ReactNode;
  className?: string;
  isPullable?: boolean;
}) {
  return (
    <div
      data-bottom-sheet-paper="true"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[1199px] px-4",
        className,
      )}
    >
      <div className="mx-auto max-w-md rounded-t-[28px] border border-b-0 border-wfrp-border bg-card px-5 pb-5 pt-4 shadow-[0_-18px_36px_rgba(0,0,0,0.45)]">
        {isPullable ? (
          <div className="mx-auto mb-5 h-1 w-8 rounded-full bg-wfrp-muted-text/70" aria-hidden="true" />
        ) : null}
        <div className="flex w-full justify-end gap-2 supports-[padding:max(0px)]:pb-[max(0px,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>
  );
}
