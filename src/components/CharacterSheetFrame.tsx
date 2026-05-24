import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHorizontalSwipePager } from "../hooks/useHorizontalSwipePager";

interface CharacterSheetFrameProps {
  children: ReactNode;
  desktopHeader: ReactNode;
  mobileHeader: ReactNode;
  onMobileNextView: () => void;
  onMobilePreviousView: () => void;
  mobileTitle: string;
}

function MobileTitlePager({
  onNext,
  onPrevious,
  title,
}: {
  onNext: () => void;
  onPrevious: () => void;
  title: string;
}) {
  const swipeHandlers = useHorizontalSwipePager({ onNext, onPrevious });

  return (
    <div
      className="grid grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 md:hidden"
      {...swipeHandlers}
    >
      <button
        type="button"
        onClick={onPrevious}
        className="flex h-10 w-10 items-center justify-center rounded border border-wfrp-border bg-wfrp-surface text-gray-300 shadow-sm transition-colors hover:border-wfrp-gold/50 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
        aria-label="Show previous character sheet tab"
      >
        <ChevronLeft size={18} />
      </button>
      <h1 className="min-w-0 text-center font-serif text-2xl font-bold leading-tight tracking-tight text-gray-100">
        {title}
      </h1>
      <button
        type="button"
        onClick={onNext}
        className="flex h-10 w-10 items-center justify-center rounded border border-wfrp-border bg-wfrp-surface text-gray-300 shadow-sm transition-colors hover:border-wfrp-gold/50 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50"
        aria-label="Show next character sheet tab"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

export function CharacterSheetFrame({
  children,
  desktopHeader,
  mobileHeader,
  onMobileNextView,
  onMobilePreviousView,
  mobileTitle,
}: CharacterSheetFrameProps) {
  return (
    <>
      <div className="hidden md:block">
        {desktopHeader}
      </div>

      {mobileHeader}

      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-4 md:gap-8">
        <MobileTitlePager
          onNext={onMobileNextView}
          onPrevious={onMobilePreviousView}
          title={mobileTitle}
        />

        {children}
      </div>
    </>
  );
}
