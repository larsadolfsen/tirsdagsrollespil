import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/src/lib/utils";

export type TextVariant =
  | "body"
  | "bodyMuted"
  | "bodyStrong"
  | "bodyStrongMuted"
  | "serifTitle";

const variantClasses: Record<TextVariant, string> = {
  body: "wfrp-text text-gray-200",
  bodyMuted: "wfrp-text text-wfrp-muted-text",
  bodyStrong: "wfrp-text-strong text-gray-200",
  bodyStrongMuted: "wfrp-text-strong text-wfrp-muted-text",
  serifTitle: "font-serif text-base font-semibold text-gray-200",
};

type AsProp<T extends ElementType> = { as?: T };

type TextProps<T extends ElementType = "p"> = AsProp<T> & {
  variant?: TextVariant;
  truncate?: boolean;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, "style">;

export function Text<T extends ElementType = "p">({
  as,
  variant = "body",
  truncate = false,
  className,
  ...props
}: TextProps<T>) {
  const Tag = (as ?? "p") as ElementType;

  return (
    <Tag
      className={cn(variantClasses[variant], truncate && "truncate", className)}
      {...props}
    />
  );
}
