import type { ReactNode } from "react";
import { useHorizontalSwipePager } from "../hooks/useHorizontalSwipePager";
import { Heading, WfrpArrowButton } from "./ui";

interface CharacterSheetFrameProps {
  breadcrumbs: ReactNode;
  children: ReactNode;
  desktopHeader: ReactNode;
  hideMobileNavigation?: boolean;
  mobileHeader: ReactNode;
  onMobileNextView: () => void;
  onMobilePreviousView: () => void;
  mobileTitleAction?: ReactNode;
  mobileTitle: string;
}

function MobileTitlePager({
  action,
  hideNavigation = false,
  onNext,
  onPrevious,
  title,
}: {
  action?: ReactNode;
  hideNavigation?: boolean;
  onNext: () => void;
  onPrevious: () => void;
  title: string;
}) {
  const swipeHandlers = useHorizontalSwipePager({ onNext, onPrevious });

  if (hideNavigation) {
    return (
      <div className="md:hidden">
        <Heading level={1} variant="page" align="center">
          {title}
        </Heading>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-center gap-2 md:hidden"
      {...swipeHandlers}
    >
      <WfrpArrowButton
        direction="left"
        onClick={onPrevious}
        label="Show previous character sheet tab"
      />
      <div className="min-w-0">
        <Heading level={1} variant="page" align="center">
          {title}
        </Heading>
      </div>
      {action ?? (
        <WfrpArrowButton
          direction="right"
          onClick={onNext}
          label="Show next character sheet tab"
        />
      )}
    </div>
  );
}

export function CharacterSheetFrame({
  breadcrumbs,
  children,
  desktopHeader,
  hideMobileNavigation = false,
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
        {breadcrumbs}

        <MobileTitlePager
          action={mobileTitleAction}
          hideNavigation={hideMobileNavigation}
          onNext={onMobileNextView}
          onPrevious={onMobilePreviousView}
          title={mobileTitle}
        />

        <div
          className="flex min-h-[calc(100dvh-9rem)] flex-col md:contents"
          {...(hideMobileNavigation ? {} : mobileContentSwipeHandlers)}
        >
          {children}
        </div>
      </div>
    </>
  );
}
