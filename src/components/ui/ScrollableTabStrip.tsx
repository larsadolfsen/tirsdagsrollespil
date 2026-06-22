import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { WfrpStandardIcon } from "./WfrpStandardIcon";

export function ScrollableTabStrip({
  children,
  className,
  role,
  ariaLabel,
}: {
  children: ReactNode;
  className: string;
  role?: string;
  ariaLabel?: string;
}) {
  const stripRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  useEffect(() => {
    const element = stripRef.current;
    if (!element) return;

    const updateScrollState = () => {
      const maxScrollLeft = element.scrollWidth - element.clientWidth;
      setHasOverflow(maxScrollLeft > 4);
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
    <div className="relative min-w-0">
      <div
        ref={stripRef}
        className={`${className} !pl-0 md:!pl-3 lg:!pl-4 md:pr-12`}
        data-overflowing={hasOverflow ? "true" : "false"}
        role={role}
        aria-label={ariaLabel}
      >
        {children}
      </div>
      {canScrollLeft && (
        <>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-background via-background/85 to-transparent md:w-14 md:from-wfrp-surface-subtle md:via-wfrp-surface-subtle/95 md:to-transparent" />
          <WfrpStandardIcon
            onClick={scrollTabsLeft}
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 border-0 bg-gradient-to-l from-background/0 to-background text-gray-300 shadow-none hover:border-0 hover:from-background/0 hover:to-background hover:text-white focus-visible:ring-white/30 md:bg-none md:bg-wfrp-tab-control/95 md:shadow-lg md:hover:bg-wfrp-tab-control"
            label="Show previous tabs"
            icon={<ChevronLeft />}
          />
        </>
      )}
      {canScrollRight && (
        <>
          <div className="pointer-events-none absolute inset-y-0 right-[calc(-50vw+50%+0.5rem)] w-16 bg-gradient-to-l from-background via-background/85 to-transparent md:right-0 md:w-14 md:from-wfrp-surface-subtle md:via-wfrp-surface-subtle/95 md:to-transparent" />
          <WfrpStandardIcon
            onClick={scrollTabsRight}
            className="absolute right-[calc(-50vw+50%+0.5rem)] top-1/2 z-10 -translate-y-1/2 border-0 bg-gradient-to-r from-background/0 to-background text-gray-300 shadow-none hover:border-0 hover:from-background/0 hover:to-background hover:text-white focus-visible:ring-white/30 md:right-0 md:bg-none md:bg-wfrp-tab-control/95 md:shadow-lg md:hover:bg-wfrp-tab-control"
            label="Show more tabs"
            icon={<ChevronRight />}
          />
        </>
      )}
    </div>
  );
}
