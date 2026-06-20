import type { ButtonHTMLAttributes } from "react";
import { Plus } from "lucide-react";
import { cn } from "../lib/utils";

export type MobileFloatingAction = {
  label: string;
  onClick: () => void;
};

type MobileFloatingActionButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  label: string;
};

export function MobileFloatingActionButton({
  className,
  label,
  type = "button",
  ...props
}: MobileFloatingActionButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cn(
        "fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-wfrp-gold/70 bg-wfrp-gold p-0 text-black shadow-xl shadow-black/50 transition-colors hover:border-wfrp-gold hover:bg-[#d1ad65] active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wfrp-gold/60 md:hidden",
        className,
      )}
      {...props}
    >
      <Plus aria-hidden="true" className="h-7 w-7" />
    </button>
  );
}
