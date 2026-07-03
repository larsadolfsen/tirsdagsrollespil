import { useEffect, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function BottomSheetPaper({
  children,
  className,
  isPullable = false,
  onDismiss,
}: {
  children: ReactNode;
  className?: string;
  isPullable?: boolean;
  onDismiss?: () => void;
}) {
  useEffect(() => {
    if (!onDismiss) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [onDismiss]);

  return (
    <>
      {onDismiss ? (
        <div
          className="fixed inset-0 z-[39] bg-black/60"
          onClick={onDismiss}
          aria-hidden="true"
        />
      ) : null}
      <div
        data-bottom-sheet-paper="true"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 mx-auto w-full",
          !onDismiss && "max-w-[1199px] px-4",
          className,
        )}
      >
        <div
          className={cn(
            "border border-b-0 border-wfrp-border bg-card rounded-t-[28px] shadow-[0_-18px_36px_rgba(0,0,0,0.45)]",
            onDismiss
              ? "flex flex-col max-h-[50dvh] overflow-hidden px-5 pb-5 pt-4"
              : "mx-auto max-w-md px-5 pb-5 pt-4",
          )}
        >
          {isPullable ? (
            <div className="mx-auto mb-5 h-1 w-8 shrink-0 rounded-full bg-wfrp-muted-text/70" aria-hidden="true" />
          ) : null}
          {onDismiss ? (
            <div className="flex w-full flex-col flex-1 min-h-0 supports-[padding:max(0px)]:pb-[max(0px,env(safe-area-inset-bottom))]">
              {children}
            </div>
          ) : (
            <div className="flex w-full justify-end gap-2 supports-[padding:max(0px)]:pb-[max(0px,env(safe-area-inset-bottom))]">
              {children}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
