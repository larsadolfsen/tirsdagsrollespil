import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type StandardButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "name"> & {
  children?: ReactNode;
  isDeactivated?: boolean;
  isGolden?: boolean;
  labelClassName?: string;
  leadingIcon?: ReactNode;
  name: ReactNode;
  nativeName?: string;
  trailingIcon?: ReactNode;
};

export function StandardButton({
  children,
  className,
  disabled,
  isDeactivated = false,
  isGolden = false,
  labelClassName,
  leadingIcon,
  name,
  nativeName,
  trailingIcon,
  type = "button",
  ...props
}: StandardButtonProps) {
  const isDisabled = disabled || isDeactivated;

  return (
    <button
      type={type}
      name={nativeName}
      disabled={isDisabled}
      className={cn(
        isGolden && !isDeactivated && "border-wfrp-gold/70 bg-wfrp-gold text-primary-foreground hover:bg-[#d1ad65]",
        isDeactivated && "cursor-not-allowed border-wfrp-border bg-wfrp-surface text-gray-500",
        className,
      )}
      {...props}
    >
      {leadingIcon}
      <span className={labelClassName}>{name}</span>
      {trailingIcon}
      {children}
    </button>
  );
}
