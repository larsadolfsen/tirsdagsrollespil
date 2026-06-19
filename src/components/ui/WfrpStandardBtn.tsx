import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type WfrpStandardBtnVariant = "unstyled" | "action" | "rollCta";
type WfrpStandardBtnSize = "default" | "sm";

type WfrpStandardBtnProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "name"> & {
  children?: ReactNode;
  hideOnMobile?: boolean;
  isDeactivated?: boolean;
  isGolden?: boolean;
  labelClassName?: string;
  leadingIcon?: ReactNode;
  name: ReactNode;
  nativeName?: string;
  size?: WfrpStandardBtnSize;
  trailingIcon?: ReactNode;
  variant?: WfrpStandardBtnVariant;
};

const variantClassNames: Record<WfrpStandardBtnVariant, string | undefined> = {
  unstyled: undefined,
  action: "wfrp-action-btn",
  rollCta: "wfrp-roll-cta",
};

const sizeClassNames: Record<WfrpStandardBtnSize, string | undefined> = {
  default: undefined,
  sm: "h-7 px-3",
};

export function WfrpStandardBtn({
  children,
  className,
  disabled,
  hideOnMobile = false,
  isDeactivated = false,
  isGolden = false,
  labelClassName,
  leadingIcon,
  name,
  nativeName,
  size = "default",
  trailingIcon,
  type = "button",
  variant = "unstyled",
  style,
  ...props
}: WfrpStandardBtnProps) {
  const isDisabled = disabled || isDeactivated;

  return (
    <button
      type={type}
      name={nativeName}
      disabled={isDisabled}
      style={style}
      className={cn(
        "min-w-[88px]",
        variantClassNames[variant],
        sizeClassNames[size],
        hideOnMobile && "max-md:hidden",
        leadingIcon && "wfrp-standard-btn--has-leading-icon",
        isGolden && !isDeactivated && "wfrp-standard-btn--gold",
        isDeactivated && "wfrp-standard-btn--deactivated",
        className,
      )}
      {...props}
    >
      {leadingIcon ? (
        <span className="wfrp-standard-btn__leading-icon" aria-hidden="true">
          {leadingIcon}
        </span>
      ) : null}
      <span className={labelClassName}>{name}</span>
      {trailingIcon}
      {children}
    </button>
  );
}
