import type { ReactNode, RefObject } from "react";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { cn } from "@/src/lib/utils";
import { useFocusTrap } from "../../hooks/useFocusTrap";
import { WfrpStandardIcon } from "../ui";

type WfrpSidebarProps = {
  ariaLabelledBy?: string;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  icon?: ReactNode;
  isOpen: boolean;
  kicker?: ReactNode;
  motionKey: string;
  onClose: () => void;
  closeLabel?: string;
  title: ReactNode;
  titleId?: string;
  sidebarRef?: RefObject<HTMLElement | null>;
  contentRef?: RefObject<HTMLDivElement | null>;
  trapFocus?: boolean;
  closeOnOutsidePointerDown?: boolean;
};

export function WfrpSidebar({
  ariaLabelledBy,
  children,
  className,
  contentClassName,
  icon,
  isOpen,
  kicker,
  motionKey,
  onClose,
  closeLabel = "Close sidebar",
  title,
  titleId,
  sidebarRef,
  contentRef,
  trapFocus = false,
  closeOnOutsidePointerDown = false,
}: WfrpSidebarProps) {
  const internalSidebarRef = useRef<HTMLElement | null>(null);
  const resolvedSidebarRef = sidebarRef ?? internalSidebarRef;
  const [usesModalBehavior, setUsesModalBehavior] = useState(false);

  useFocusTrap(resolvedSidebarRef, isOpen && trapFocus && usesModalBehavior, onClose);

  useEffect(() => {
    if (!isOpen) return;

    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const updateModalBehavior = () => {
      setUsesModalBehavior(mediaQuery.matches);
    };

    updateModalBehavior();
    mediaQuery.addEventListener("change", updateModalBehavior);

    const handlePointerDown = (event: PointerEvent) => {
      if (
        closeOnOutsidePointerDown &&
        mediaQuery.matches &&
        !resolvedSidebarRef.current?.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      mediaQuery.removeEventListener("change", updateModalBehavior);
      setUsesModalBehavior(false);
    };
  }, [closeOnOutsidePointerDown, isOpen, onClose, resolvedSidebarRef]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.aside
          ref={resolvedSidebarRef}
          key={motionKey}
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className={cn("wfrp-sidebar-shell", className)}
          role="dialog"
          aria-modal={usesModalBehavior}
          aria-labelledby={ariaLabelledBy ?? titleId}
        >
          <div className="wfrp-sidebar-header shrink-0 p-3">
            <div className="flex items-center gap-3">
              {icon ? (
                <div className="flex h-9 w-9 items-center justify-center rounded border border-wfrp-gold/30 bg-black/20 text-wfrp-gold">
                  {icon}
                </div>
              ) : null}
              <div className="flex flex-col">
                <h2 id={titleId} className="wfrp-sidebar-title text-sm uppercase tracking-widest text-wfrp-gold">
                  {title}
                </h2>
                {kicker ? <span className="wfrp-sidebar-kicker">{kicker}</span> : null}
              </div>
            </div>
            <WfrpStandardIcon
              onClick={onClose}
              label={closeLabel}
              icon={<X />}
            />
          </div>

          <div
            ref={contentRef}
            className={cn("min-h-0 flex-1 overflow-y-auto bg-black/10 no-scrollbar", contentClassName)}
          >
            {children}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
