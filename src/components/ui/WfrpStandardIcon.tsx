import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type WfrpStandardIconProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label" | "children"> & {
  desktopLabel?: ReactNode;
  icon: ReactNode;
  label: string;
};

export function WfrpStandardIcon({
  className,
  desktopLabel,
  disabled,
  icon,
  label,
  type = "button",
  ...props
}: WfrpStandardIconProps) {
  return (
    <button
      type={type}
      disabled={disabled}
      aria-label={label}
      className={cn("wfrp-standard-icon", desktopLabel && "sm:flex-col", className)}
      {...props}
    >
      <span aria-hidden="true" className="wfrp-standard-icon__glyph">
        {icon}
      </span>
      {desktopLabel ? (
        <span className="wfrp-standard-icon__label" aria-hidden="true">
          {desktopLabel}
        </span>
      ) : null}
    </button>
  );
}
