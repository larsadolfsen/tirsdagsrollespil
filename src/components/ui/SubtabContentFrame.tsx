import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type SubtabContentFrameProps = HTMLAttributes<HTMLDivElement> & {
  subtabBar: ReactNode;
  children: ReactNode;
  contentClassName?: string;
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

  return (
    <div
      className={cn("flex h-full min-h-0 min-w-0 flex-col bg-transparent", className)}
      {...rest}
    >
      <div className={cn("shrink-0", subtabBarClassName)}>
        {subtabBar}
      </div>
      <div
        className={cn(
          "min-h-0 min-w-0 flex-1 space-y-4 overflow-y-auto overflow-x-hidden px-2 pb-2 pt-1 sm:px-3 sm:pb-3 lg:px-4 lg:pb-4",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
