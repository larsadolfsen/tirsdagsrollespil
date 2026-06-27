import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type SheetDataDefinition = {
  label: ReactNode;
  value: ReactNode;
};

export function SheetDataDefinitionList({
  className,
  items,
  ...props
}: HTMLAttributes<HTMLDListElement> & {
  items: SheetDataDefinition[];
}) {
  return (
    <dl
      className={cn("flex min-w-0 flex-col gap-1 border-t border-white/10 pt-2", className)}
      {...props}
    >
      {items.map(({ label, value }, index) => (
        <div
          key={typeof label === "string" ? label : index}
          className="min-w-0 pl-4 indent-[-16px] text-[11px] leading-relaxed"
        >
          <dt className="inline wfrp-list-cell-strong text-wfrp-muted-text">{label}: </dt>
          <dd className="inline wfrp-sidebar-body text-card-foreground">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
