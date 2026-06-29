import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type SheetDataDefinition = {
  label: ReactNode;
  value: ReactNode;
  labelClassName?: string;
  valueClassName?: string;
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
      {items.map(({ label, value, labelClassName, valueClassName }, index) => (
        <div
          key={typeof label === "string" ? label : index}
          className="min-w-0 pl-4 indent-[-16px] text-[11px] leading-relaxed"
        >
          <dt className={cn("inline wfrp-list-cell-strong text-wfrp-muted-text", labelClassName)}>{label}: </dt>
          <dd className={cn("inline wfrp-sidebar-body", valueClassName)}>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
