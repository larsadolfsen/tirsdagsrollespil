import type { MouseEventHandler, ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/src/lib/utils";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";
type ButtonType = "button" | "submit" | "reset";

const variantClasses: Record<ButtonVariant, string> = {
  default: "bg-primary text-primary-foreground shadow hover:bg-primary/90 active:bg-primary/80",
  destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80",
  outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
  secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70",
  ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80",
  link: "text-primary underline-offset-4 hover:underline",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "h-10 px-4 py-2",
  sm: "h-9 rounded-md px-3",
  lg: "h-11 rounded-md px-8",
  icon: "h-10 w-10",
};

export interface ButtonProps {
  "aria-expanded"?: boolean;
  "aria-haspopup"?: boolean | "dialog" | "grid" | "listbox" | "menu" | "tree";
  "aria-label"?: string;
  "data-state"?: string;
  children?: ReactNode;
  className?: string;
  disabled?: boolean;
  id?: string;
  loading?: boolean;
  loadingLabel?: string;
  name?: string;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  size?: ButtonSize;
  title?: string;
  type?: ButtonType;
  value?: string | number | readonly string[];
  variant?: ButtonVariant;
}

export function buttonVariants({ variant = "default", size = "default", className }: { variant?: ButtonVariant; size?: ButtonSize; className?: string } = {}) {
  return cn(
    "inline-flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-bold uppercase tracking-widest transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

export function Button({ children, className, disabled, loading = false, loadingLabel = "Loading", size, type = "button", variant, ...props }: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button type={type} aria-busy={loading || undefined} disabled={isDisabled} className={buttonVariants({ variant, size, className })} {...props}>
      {loading && <LoaderCircle aria-hidden="true" className="animate-spin" />}
      <span className={cn(size === "icon" && loading ? "sr-only" : undefined)}>{loading ? loadingLabel : children}</span>
    </button>
  );
}
