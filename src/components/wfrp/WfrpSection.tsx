import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { Separator } from "@/src/components/ui/separator";
import { Heading } from "@/src/components/ui/Heading";

export interface WfrpSectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
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
          <Heading level={2} variant="sectionEditorial">{title}</Heading>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
      <Separator className="bg-wfrp-gold/20" />
      {children}
    </section>
  );
}
