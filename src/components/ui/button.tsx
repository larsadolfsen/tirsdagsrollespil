import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type ButtonVariant = "default" | "outline" | "ghost" | "tab" | "danger";
type ButtonSize = "default" | "sm" | "icon" | "chip";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-wfrp-border text-gray-300 hover:bg-wfrp-control-hover hover:text-white",
  outline: "border border-wfrp-border bg-wfrp-dark text-gray-300 shadow-sm hover:border-wfrp-gold/50 hover:text-wfrp-gold",
  ghost: "bg-transparent text-gray-400 hover:bg-wfrp-surface-raised hover:text-gray-200",
  tab: "bg-black/40 text-gray-400 hover:bg-wfrp-surface-raised hover:text-gray-200 data-[state=active]:bg-wfrp-tab-active data-[state=active]:text-white data-[state=active]:shadow-lg",
  danger: "border border-white/10 bg-black/20 text-gray-500 hover:border-white/20 hover:text-wfrp-red focus-visible:ring-wfrp-red/40",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-8 px-3 text-[10px]",
  sm: "h-7 px-2.5 text-[9px]",
  icon: "h-7 w-7 p-0",
  chip: "px-2 py-1 text-[10px]",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "default", size = "default", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex cursor-pointer items-center justify-center rounded font-bold uppercase tracking-widest transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      {...props}
    />
  );
});
