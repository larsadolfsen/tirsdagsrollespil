import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ScrollableTabStrip({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const element = stripRef.current;
    if (!element) return;

    const updateScrollState = () => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      setCanScrollLeft(element.scrollLeft > 4);
      setCanScrollRight(maxScrollLeft - element.scrollLeft > 4);
    };

    updateScrollState();
    element.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      element.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [children]);

  const scrollTabsLeft = () => {
    stripRef.current?.scrollBy({
      left: -Math.max(stripRef.current.clientWidth * 0.65, 160),
      behavior: "smooth",
    });
  };

  const scrollTabsRight = () => {
    stripRef.current?.scrollBy({
      left: Math.max(stripRef.current.clientWidth * 0.65, 160),
      behavior: "smooth",
    });
  };

  return (
    <div className="relative">
      <div ref={stripRef} className={`${className} pl-12 pr-12`}>
        {children}
      </div>
      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-14 bg-gradient-to-r from-wfrp-surface-subtle via-wfrp-surface-subtle/95 to-transparent" />
          <button
            onClick={scrollTabsLeft}
            className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded border border-white/10 bg-wfrp-tab-control/95 p-1.5 text-gray-300 shadow-lg transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            aria-label="Show previous tabs"
          >
            <ChevronLeft size={14} />
          </button>
        </>
      )}
      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-14 bg-gradient-to-l from-wfrp-surface-subtle via-wfrp-surface-subtle/95 to-transparent" />
          <button
            onClick={scrollTabsRight}
            className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded border border-white/10 bg-wfrp-tab-control/95 p-1.5 text-gray-300 shadow-lg transition-colors hover:border-white/20 hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/30"
            aria-label="Show more tabs"
          >
            <ChevronRight size={14} />
          </button>
        </>
      )}
    </div>
  );
}
