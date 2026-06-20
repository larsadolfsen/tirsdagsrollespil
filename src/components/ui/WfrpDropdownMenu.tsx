import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/utils";

type WfrpDropdownMenuContentProps = HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "end";
};

export function WfrpDropdownMenuContent({
  align = "start",
  className,
  ...props
}: WfrpDropdownMenuContentProps) {
  return (
    <div
      role="menu"
      className={cn(
        "absolute top-[calc(100%+0.5rem)] z-30 min-w-44 overflow-hidden rounded-md border border-wfrp-border bg-wfrp-popover shadow-wfrp-popover",
        align === "end" && "right-0",
        className,
      )}
      {...props}
    />
  );
}

export function WfrpDropdownMenuLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "border-b border-wfrp-border-muted px-3 py-2 text-[9px] font-bold uppercase tracking-[0.24em] text-wfrp-muted-text",
        className,
      )}
      {...props}
    />
  );
}

export function WfrpDropdownMenuGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-0", className)} {...props} />;
}

export function WfrpDropdownMenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("border-t border-wfrp-border-muted", className)} {...props} />;
}

type WfrpDropdownMenuItemProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
};

export function WfrpDropdownMenuItem({
  active = false,
  children,
  className,
  leadingIcon,
  trailingIcon,
  type = "button",
  ...props
}: WfrpDropdownMenuItemProps) {
  return (
    <button
      type={type}
      className={cn(
        "flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-left text-[12px] font-bold tracking-wide text-[var(--color-wfrp-muted-text)] transition-colors hover:bg-wfrp-surface-raised hover:text-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50",
        active && "bg-[var(--color-wfrp-dice-bg)] text-white hover:text-white",
        className,
      )}
      role={props.role ?? "menuitem"}
      {...props}
    >
      {leadingIcon ? <span className="flex shrink-0 items-center">{leadingIcon}</span> : null}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailingIcon ? <span className="ml-3 flex h-4 w-4 shrink-0 items-center justify-center">{trailingIcon}</span> : null}
    </button>
  );
}
