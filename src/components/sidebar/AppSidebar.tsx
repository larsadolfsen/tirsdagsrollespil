import type { ReactNode, RefObject } from "react";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useFocusTrap } from "../../hooks/useFocusTrap";

type AppSidebarProps = {
  ariaLabelledBy?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  closeLabel?: string;
  closeOnOutsidePointerDown?: boolean;
  contentRef?: RefObject<HTMLDivElement | null>;
  eyebrow?: ReactNode;
  footer?: ReactNode;
  isOpen: boolean;
  motionKey: string;
  onClose: () => void;
  sidebarRef?: RefObject<HTMLElement | null>;
  title: ReactNode;
  titleId?: string;
  trapFocus?: boolean;
};

type AppSidebarSectionProps = {
  children: ReactNode;
  className?: string;
  heading?: ReactNode;
};

export function AppSidebar({
  ariaLabelledBy,
  children,
  className,
  contentClassName,
  closeLabel = "Close sidebar",
  closeOnOutsidePointerDown = false,
  contentRef,
  eyebrow,
  footer,
  isOpen,
  motionKey,
  onClose,
  sidebarRef,
  title,
  titleId,
  trapFocus = false,
}: AppSidebarProps) {
  const internalSidebarRef = useRef<HTMLElement | null>(null);
  const resolvedSidebarRef = sidebarRef ?? internalSidebarRef;

  useFocusTrap(resolvedSidebarRef, isOpen && trapFocus, onClose);

  useEffect(() => {
    if (!isOpen) return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const previousOverflow = document.body.style.overflow;
    const updateBodyOverflow = () => {
      document.body.style.overflow = mediaQuery.matches ? "hidden" : previousOverflow;
    };

    updateBodyOverflow();
    mediaQuery.addEventListener("change", updateBodyOverflow);

    const handlePointerDown = (event: PointerEvent) => {
      if (
        closeOnOutsidePointerDown &&
        !mediaQuery.matches &&
        !resolvedSidebarRef.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      mediaQuery.removeEventListener("change", updateBodyOverflow);
      document.body.style.overflow = previousOverflow;
    };
  }, [closeOnOutsidePointerDown, isOpen, onClose, resolvedSidebarRef]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          <motion.button
            key={`${motionKey}-overlay`}
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-40 cursor-default bg-black/50 md:hidden"
            onClick={closeOnOutsidePointerDown ? onClose : undefined}
            aria-label={closeLabel}
            tabIndex={-1}
          />
          <motion.aside
            ref={resolvedSidebarRef}
            key={motionKey}
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "min(400px, calc(100vw - 48px))" }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className={cn(
              "fixed right-0 top-0 z-50 flex h-full min-h-screen max-w-[400px] flex-col overflow-hidden border-l border-wfrp-border bg-[#202020] shadow-2xl shadow-black/60 md:relative md:right-auto md:top-auto md:z-auto md:shrink-0",
              className,
            )}
            role="dialog"
            aria-modal="true"
            aria-labelledby={ariaLabelledBy ?? titleId}
          >
            <header className="flex min-h-16 shrink-0 items-center justify-between gap-4 border-b border-wfrp-border bg-[#242424] px-4 py-3">
              <div className="min-w-0">
                {eyebrow ? (
                  <div className="mb-1 text-[9px] font-black uppercase tracking-widest text-wfrp-gold/70">
                    {eyebrow}
                  </div>
                ) : null}
                <h2 id={titleId} className="truncate text-sm font-black uppercase tracking-widest text-gray-100">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded border border-wfrp-border bg-black/15 text-wfrp-muted-text transition-colors hover:border-wfrp-gold/50 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
                aria-label={closeLabel}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </header>

            <div
              ref={contentRef}
              className={cn("min-h-0 flex-1 overflow-y-auto bg-black/10 p-4 no-scrollbar", contentClassName)}
            >
              {children}
            </div>

            {footer ? (
              <footer className="shrink-0 border-t border-wfrp-border bg-[#242424] p-4">
                {footer}
              </footer>
            ) : null}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export function AppSidebarSection({
  children,
  className,
  heading,
}: AppSidebarSectionProps) {
  return (
    <section className={cn("rounded border border-wfrp-border bg-card p-4", className)}>
      {heading ? (
        <h3 className="mb-3 text-[10px] font-black uppercase tracking-widest text-wfrp-muted-text">
          {heading}
        </h3>
      ) : null}
      {children}
    </section>
  );
}
