import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { useMobileMainViewSwipeHandlers } from "../MobileMainViewSwipeContext";

type SubtabContentFrameProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  contentClassName?: string;
  subtabBar?: ReactNode;
  subtabBarClassName?: string;
};

export function SubtabContentFrame(props: SubtabContentFrameProps) {
  const {
    children,
    className,
    contentClassName,
    subtabBar,
    subtabBarClassName,
    ...rest
  } = props;
  const mobileMainViewSwipeHandlers = useMobileMainViewSwipeHandlers();

  return (
    <div
      className={cn("flex h-full min-h-0 min-w-0 flex-col bg-transparent", className)}
      {...rest}
    >
      {subtabBar ? (
        <div className={cn("shrink-0", subtabBarClassName)}>
          {subtabBar}
        </div>
      ) : null}
      <div
        {...(mobileMainViewSwipeHandlers ?? {})}
        className={cn(
          "min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-2 pb-2 sm:px-3 sm:pb-3 lg:px-4 lg:pb-4",
          subtabBar ? "pt-1" : "pt-4",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
