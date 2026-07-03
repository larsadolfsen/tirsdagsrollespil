import { useEffect, useRef, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function BottomSheetPaper({
  children,
  className,
  isPullable = false,
  onDismiss,
  isOpen,
}: {
  children: ReactNode;
  className?: string;
  isPullable?: boolean;
  onDismiss?: () => void;
  isOpen?: boolean;
}) {
  const isModal = onDismiss !== undefined;
  const isAnimated = isOpen !== undefined;
  const isVisible = !isAnimated || isOpen;

  const sheetRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Animate imperatively: setTimeout lets the browser paint the "before" state first
  useEffect(() => {
    if (!isAnimated) return;
    const sheet = sheetRef.current;
    const overlay = overlayRef.current;
    if (!sheet) return;

    clearTimeout(timerRef.current);

    if (isOpen) {
      sheet.style.transform = "translateY(100%)";
      if (overlay) overlay.style.opacity = "0";
      timerRef.current = setTimeout(() => {
        sheet.style.transform = "translateY(0)";
        if (overlay) overlay.style.opacity = "1";
      }, 16);
    } else {
      sheet.style.transform = "translateY(100%)";
      if (overlay) overlay.style.opacity = "0";
    }

    return () => clearTimeout(timerRef.current);
  }, [isOpen, isAnimated]);

  // Scroll lock
  useEffect(() => {
    if (!isModal || !isVisible) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [isModal, isVisible]);

  return (
    <>
      {isModal ? (
        <div
          ref={overlayRef}
          className={cn(
            "fixed inset-0 z-[39] bg-black/60",
            isAnimated && !isOpen && "pointer-events-none",
          )}
          style={isAnimated ? {
            opacity: 0,
            transition: "opacity 0.3s ease-out",
          } : undefined}
          onClick={isVisible ? onDismiss : undefined}
          aria-hidden="true"
        />
      ) : null}
      <div
        ref={sheetRef}
        data-bottom-sheet-paper="true"
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 mx-auto w-full",
          !isModal && "max-w-[1199px] px-4",
          className,
        )}
        style={isAnimated ? {
          transform: "translateY(100%)",
          transition: "transform 0.3s ease-out",
        } : undefined}
      >
        <div
          className={cn(
            "border border-b-0 border-wfrp-border bg-card rounded-t-[28px] shadow-[0_-18px_36px_rgba(0,0,0,0.45)]",
            isModal
              ? "flex flex-col h-[50dvh] overflow-hidden px-5 pb-5 pt-4"
              : "mx-auto max-w-md px-5 pb-5 pt-4",
          )}
        >
          {isPullable ? (
            <div className="mx-auto mb-5 h-1 w-8 shrink-0 rounded-full bg-wfrp-muted-text/70" aria-hidden="true" />
          ) : null}
          {isModal ? (
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
