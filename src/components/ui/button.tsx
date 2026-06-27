import type { ButtonHTMLAttributes, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { inlineSubtabButtonActiveClassName, inlineSubtabButtonInactiveClassName } from "@/src/lib/tabStyles";

type StandardButtonVariant = "default" | "destructive" | "secondary" | "ghost" | "link";
type WfrpButtonVariant = "unstyled" | "fab" | "wfrpIcon" | "subtabAction";
type ButtonVariant = StandardButtonVariant | WfrpButtonVariant;

const standardVariantClasses: Record<StandardButtonVariant, string> = {
  default: "text-wfrp-dice-text before:bg-wfrp-dice-bg hover:before:bg-wfrp-dice-hover-bg hover:text-wfrp-dice-text",
  destructive: "text-white/80 before:bg-destructive hover:before:bg-destructive/90 hover:text-white",
  secondary: "text-wfrp-muted-text before:bg-wfrp-tab-active hover:text-white hover:before:bg-wfrp-control-hover",
  ghost: "hover:before:bg-accent hover:text-accent-foreground",
  link: "text-primary underline-offset-4 hover:underline",
};

const wfrpVariantClasses: Record<WfrpButtonVariant, string | undefined> = {
  unstyled: undefined,
  fab: "fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-wfrp-gold/70 bg-wfrp-gold p-0 text-black shadow-xl shadow-black/50 transition-colors hover:border-wfrp-gold hover:bg-[#d1ad65] active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wfrp-gold/60 xl:hidden",
  wfrpIcon: "wfrp-standard-icon",
  subtabAction: "group inline-flex cursor-pointer items-center justify-center bg-transparent p-0 font-semibold tracking-[0.12em] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50 disabled:cursor-default",
};

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "name"> {
  children?: ReactNode;
  desktopLabel?: ReactNode;
  hideOnMobile?: boolean;
  isDeactivated?: boolean;
  isGolden?: boolean;
  isActive?: boolean;
  labelClassName?: string;
  leadingIcon?: ReactNode;
  loading?: boolean;
  loadingLabel?: string;
  name?: ReactNode;
  nativeName?: string;
  trailingIcon?: ReactNode;
  variant?: ButtonVariant;
}

function isWfrpVariant(variant: ButtonVariant): variant is WfrpButtonVariant {
  return variant === "unstyled" || variant === "fab" || variant === "wfrpIcon" || variant === "subtabAction";
}

export function buttonVariants({ variant = "default", className }: { variant?: ButtonVariant; className?: string } = {}) {
  if (isWfrpVariant(variant)) {
    return cn(wfrpVariantClasses[variant], className);
  }

  return cn(
    "wfrp-label group relative isolate inline-flex h-12 items-center justify-center gap-1 whitespace-nowrap bg-transparent px-3 before:absolute before:inset-x-0 before:top-1/2 before:-z-10 before:h-6 before:-translate-y-1/2 before:rounded before:shadow-sm before:transition-all active:before:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-default disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    standardVariantClasses[variant],
    className,
  );
}

export function Button({
  children,
  className,
  desktopLabel,
  disabled,
  hideOnMobile = false,
  isDeactivated = false,
  isGolden = false,
  isActive = false,
  labelClassName,
  leadingIcon,
  loading = false,
  loadingLabel = "Loading",
  name,
  nativeName,
  trailingIcon,
  type = "button",
  variant = "default",
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isDeactivated || loading;
  const wfrp = isWfrpVariant(variant);
  const standard = !wfrp;
  const label = loading ? loadingLabel : name;

  return (
    <button
      type={type}
      name={nativeName}
      aria-busy={loading || undefined}
      disabled={isDisabled}
      className={cn(
        buttonVariants({ variant }),
        "cursor-pointer disabled:cursor-default",
        hideOnMobile && variant !== "fab" && "max-xl:hidden",
        wfrp && !!leadingIcon && variant !== "wfrpIcon" && "wfrp-standard-btn--has-leading-icon",
        variant === "wfrpIcon" && !!desktopLabel && "sm:flex-col",
        wfrp && isGolden && !isDeactivated && "wfrp-standard-btn--gold",
        wfrp && isDeactivated && "wfrp-standard-btn--deactivated",
        standard && isGolden && !isDeactivated && "!text-primary-foreground before:!bg-wfrp-gold hover:before:!bg-[#d1ad65] hover:!text-primary-foreground",
        standard && isDeactivated && "cursor-default opacity-20 before:!bg-[#3f3f3f] !text-[#d0d0d0] active:before:scale-100",
        className,
        variant !== "fab" && "!h-12",
      )}
      {...props}
    >
      {standard ? (
        <>
          {loading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : leadingIcon ? (
            <span className="wfrp-standard-btn__leading-icon" aria-hidden="true">{leadingIcon}</span>
          ) : null}
          {label !== undefined ? (labelClassName ? <span className={labelClassName}>{label}</span> : label) : null}
          {!loading ? children : null}
          {!loading ? trailingIcon : null}
        </>
      ) : variant === "subtabAction" ? (
        <span className={cn(
          "wfrp-label inline-flex !h-6 items-center justify-center whitespace-nowrap rounded px-3 transition-all group-active:scale-95",
          isActive ? `${inlineSubtabButtonActiveClassName} group-hover:bg-[#d1ad65]` : inlineSubtabButtonInactiveClassName,
        )}>{children}</span>
      ) : (
        <>
          {loading ? <LoaderCircle aria-hidden="true" className="animate-spin" /> : leadingIcon ? (
            <span className={variant === "wfrpIcon" ? "wfrp-standard-icon__glyph" : "wfrp-standard-btn__leading-icon"} aria-hidden="true">{leadingIcon}</span>
          ) : null}
          {label !== undefined ? (labelClassName ? <span className={labelClassName}>{label}</span> : label) : null}
          {!loading ? children : null}
          {!loading ? trailingIcon : null}
        </>
      )}
      {!loading && variant === "wfrpIcon" && desktopLabel ? (
        <span className="wfrp-standard-icon__label" aria-hidden="true">{desktopLabel}</span>
      ) : null}
    </button>
  );
}
