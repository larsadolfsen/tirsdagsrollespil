import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { Separator } from "@/src/components/ui/separator";

export interface WfrpSectionProps extends HTMLAttributes<HTMLElement> {
  eyebrow?: ReactNode;
  title: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function WfrpSection({ eyebrow, title, actions, className, children, ...props }: WfrpSectionProps) {
  return (
    <section className={cn("space-y-3", className)} {...props}>
      <div className="flex items-center justify-between gap-4">
        <div>
          {eyebrow && <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>}
          <h2 className="font-display text-lg font-semibold tracking-wide text-foreground">{title}</h2>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <Separator className="bg-wfrp-gold/20" />
      {children}
    </section>
  );
}
