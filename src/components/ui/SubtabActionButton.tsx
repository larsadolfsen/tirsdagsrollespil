import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import {
  inlineSubtabButtonActiveClassName,
  inlineSubtabButtonInactiveClassName,
} from "@/src/lib/tabStyles";

type SubtabActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  isActive?: boolean;
  hideOnMobile?: boolean;
};

export function SubtabActionButton({
  children,
  className,
  hideOnMobile,
  isActive,
  type = "button",
  ...props
}: SubtabActionButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "group inline-flex h-12 cursor-pointer items-center justify-center bg-transparent p-0 font-black tracking-[0.12em] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 disabled:cursor-not-allowed disabled:opacity-40",
        hideOnMobile && "max-md:hidden",
        className,
      )}
      {...props}
    >
      <span
        className={cn(
          "inline-flex h-6 items-center justify-center whitespace-nowrap rounded px-3 text-[9px] font-bold uppercase tracking-widest transition-all group-active:scale-95",
          isActive ? inlineSubtabButtonActiveClassName : inlineSubtabButtonInactiveClassName,
        )}
      >
        {children}
      </span>
    </button>
  );
}
