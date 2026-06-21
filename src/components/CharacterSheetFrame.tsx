import type { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useHorizontalSwipePager } from "../hooks/useHorizontalSwipePager";
import { WfrpStandardIcon } from "./ui";

interface CharacterSheetFrameProps {
  children: ReactNode;
  desktopHeader: ReactNode;
  mobileHeader: ReactNode;
  onMobileNextView: () => void;
  onMobilePreviousView: () => void;
  mobileTitleAction?: ReactNode;
  mobileTitle: string;
}

function MobileTitlePager({
  action,
  onNext,
  onPrevious,
  title,
}: {
  action?: ReactNode;
  onNext: () => void;
  onPrevious: () => void;
  title: string;
}) {
  const swipeHandlers = useHorizontalSwipePager({ onNext, onPrevious });

  return (
    <div
      className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-2 md:hidden"
      {...swipeHandlers}
    >
      <WfrpStandardIcon
        onClick={onPrevious}
        className="border-transparent bg-transparent text-gray-300 shadow-none hover:border-transparent hover:bg-transparent hover:text-white"
        label="Show previous character sheet tab"
        icon={<ChevronLeft />}
      />
      <h1 className="min-w-0 text-center font-serif text-2xl font-bold leading-tight tracking-tight text-gray-100">
        {title}
      </h1>
      {action ?? (
        <WfrpStandardIcon
          onClick={onNext}
          className="border-transparent bg-transparent text-gray-300 shadow-none hover:border-transparent hover:bg-transparent hover:text-white"
          label="Show next character sheet tab"
          icon={<ChevronRight />}
        />
      )}
    </div>
  );
}

export function CharacterSheetFrame({
  children,
  desktopHeader,
  mobileHeader,
  onMobileNextView,
  onMobilePreviousView,
  mobileTitleAction,
  mobileTitle,
}: CharacterSheetFrameProps) {
  const mobileContentSwipeHandlers = useHorizontalSwipePager({
    onNext: onMobileNextView,
    onPrevious: onMobilePreviousView,
  });

  return (
    <>
      <div className="hidden md:block">
        {desktopHeader}
      </div>

      {mobileHeader}

      <div className="mx-auto flex w-full max-w-[1199px] flex-col gap-4 px-4 py-4 md:gap-8">
        <MobileTitlePager
          action={mobileTitleAction}
          onNext={onMobileNextView}
          onPrevious={onMobilePreviousView}
          title={mobileTitle}
        />

        <div
          className="flex min-h-[calc(100dvh-9rem)] flex-col md:contents"
          {...mobileContentSwipeHandlers}
        >
          {children}
        </div>
      </div>
    </>
  );
}
