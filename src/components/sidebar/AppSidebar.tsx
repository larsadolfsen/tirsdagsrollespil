import type { ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { SubtabActionButton } from "../ui/SubtabActionButton";

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
  overlayUntil?: "mobile" | "desktop";
  side?: "left" | "right";
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
  overlayUntil = "mobile",
  side = "right",
  sidebarRef,
  title,
  titleId,
  trapFocus = false,
}: AppSidebarProps) {
  const internalSidebarRef = useRef<HTMLElement | null>(null);
  const resolvedSidebarRef = sidebarRef ?? internalSidebarRef;
  const [usesModalBehavior, setUsesModalBehavior] = useState(false);
  const usesDesktopOverlay = overlayUntil === "desktop";
  const overlayMaxWidth = usesDesktopOverlay ? 1279 : 767;
  const sideClassName =
    side === "left"
      ? usesDesktopOverlay
        ? "left-0 border-r xl:order-first"
        : "left-0 border-r md:order-first"
      : "right-0 border-l";
  const closedOffset = side === "left" ? "-100%" : "100%";
  const shellClassName = usesDesktopOverlay
    ? "fixed top-0 z-50 flex h-screen min-h-screen w-[min(400px,calc(100vw-48px))] max-w-[400px] flex-col overflow-hidden border-wfrp-border bg-[#202020] shadow-2xl shadow-black/60 xl:relative xl:left-auto xl:right-auto xl:top-auto xl:z-auto xl:h-auto xl:min-h-[calc(100vh-0.25rem)] xl:shrink-0 xl:self-stretch"
    : "fixed top-0 z-50 flex h-screen min-h-screen w-[min(400px,calc(100vw-48px))] max-w-[400px] flex-col overflow-hidden border-wfrp-border bg-[#202020] shadow-2xl shadow-black/60 md:relative md:left-auto md:right-auto md:top-auto md:z-auto md:h-auto md:min-h-[calc(100vh-0.25rem)] md:shrink-0 md:self-stretch";
  const overlayClassName = usesDesktopOverlay
    ? "fixed inset-0 z-40 cursor-default bg-black/50 xl:hidden"
    : "fixed inset-0 z-40 cursor-default bg-black/50 md:hidden";

  useFocusTrap(resolvedSidebarRef, isOpen && trapFocus && usesModalBehavior, onClose);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const isOverlayViewport = () => window.innerWidth <= overlayMaxWidth;
    const updateBodyOverflow = () => {
      const shouldUseModalBehavior = isOverlayViewport();
      setUsesModalBehavior(shouldUseModalBehavior);
      document.body.style.overflow = shouldUseModalBehavior ? "hidden" : previousOverflow;
    };

    updateBodyOverflow();
    window.addEventListener("resize", updateBodyOverflow);

    const handlePointerDown = (event: PointerEvent) => {
      if (
        closeOnOutsidePointerDown &&
        isOverlayViewport() &&
        !resolvedSidebarRef.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown, { capture: true });

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, { capture: true });
      window.removeEventListener("resize", updateBodyOverflow);
      document.body.style.overflow = previousOverflow;
      setUsesModalBehavior(false);
    };
  }, [closeOnOutsidePointerDown, isOpen, onClose, overlayMaxWidth, resolvedSidebarRef]);

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
            className={overlayClassName}
            onClick={closeOnOutsidePointerDown ? onClose : undefined}
            aria-label={closeLabel}
            tabIndex={-1}
          />
          <motion.aside
            ref={resolvedSidebarRef}
            key={motionKey}
            initial={{ opacity: 0, x: closedOffset }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: closedOffset }}
            transition={{ type: "spring", damping: 28, stiffness: 240 }}
            className={cn(
              shellClassName,
              sideClassName,
              className,
            )}
            role="dialog"
            aria-modal={usesModalBehavior}
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
              <SubtabActionButton
                className="[&_span]:bg-[#303030] [&_span]:text-gray-200 hover:[&_span]:bg-[#3a3a3a] hover:[&_span]:text-white"
                onClick={onClose}
                aria-label={closeLabel}
              >
                Close
              </SubtabActionButton>
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
