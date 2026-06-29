import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { Separator } from "@/src/components/ui/separator";
import { Heading } from "@/src/components/ui/Heading";

export interface WfrpSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  showDivider?: boolean;
  dividerPosition?: "before" | "after";
  dividerClassName?: string;
  className?: string;
  children?: ReactNode;
}

export function WfrpSection({
  eyebrow,
  title,
  actions,
  showDivider = true,
  dividerPosition = "after",
  dividerClassName,
  className,
  children,
  ...props
}: WfrpSectionProps) {
  const divider = showDivider
    ? <Separator className={dividerClassName ?? "bg-wfrp-gold/20"} />
    : null;

  return (
    <section className={cn("space-y-3", className)} {...props}>
      {dividerPosition === "before" && divider}
      <div className="flex items-center justify-between gap-4">
        <div>
          {eyebrow && <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>}
          <Heading level={2} variant="sectionEditorial">{title}</Heading>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      {dividerPosition === "after" && divider}
      {children}
    </section>
  );
}
