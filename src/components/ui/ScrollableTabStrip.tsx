import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { WfrpArrowButton } from "./WfrpArrowButton";

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
        <WfrpArrowButton
          direction="left"
          label="Show previous tabs"
          onClick={scrollTabsLeft}
          variant="scrollOverlay"
        />
      )}
      {canScrollRight && (
        <WfrpArrowButton
          direction="right"
          label="Show more tabs"
          onClick={scrollTabsRight}
          variant="scrollOverlay"
        />
      )}
    </div>
  );
}
