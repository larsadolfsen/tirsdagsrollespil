import type { ReactNode } from "react";

interface CharacterSheetFrameProps {
  children: ReactNode;
  desktopHeader: ReactNode;
  mobileHeader: ReactNode;
  mobileTitle: string;
}

export function CharacterSheetFrame({
  children,
  desktopHeader,
  mobileHeader,
  mobileTitle,
}: CharacterSheetFrameProps) {
  return (
    <>
      <div className="hidden md:block">
        {desktopHeader}
      </div>

      {mobileHeader}

      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-4 px-4 py-4 md:gap-8">
        <h1 className="text-center font-serif text-2xl font-bold leading-tight tracking-tight text-gray-100 md:hidden">
          {mobileTitle}
        </h1>

        {children}
      </div>
    </>
  );
}
