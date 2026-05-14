import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { SheetDataRow, SheetDataTable } from "./SheetDataTable";

type DivProps = HTMLAttributes<HTMLDivElement>;

export type SheetDataMobileDetailField = {
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
};

export function SheetDataList({ className, ...props }: DivProps) {
  return <SheetDataTable className={cn("flex flex-col", className)} {...props} />;
}

export function SheetDataListRow({ className, ...props }: DivProps) {
  return <SheetDataRow className={cn("block border-b border-wfrp-border last:border-0", className)} {...props} />;
}

export function SheetDataMobileDetails({
  fields,
  className,
}: {
  fields: SheetDataMobileDetailField[];
  className?: string;
}) {
  return (
    <div className={cn("mt-2 grid grid-cols-2 gap-2 rounded border border-white/5 bg-black/20 p-2 md:hidden", className)}>
      {fields.map((field) => (
        <div key={field.label} className={field.className}>
          <div className="wfrp-table-label">{field.label}</div>
          <div className={cn("wfrp-list-cell-strong", field.valueClassName)}>{field.value}</div>
        </div>
      ))}
    </div>
  );
}

export function SheetRowActionButton({
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "wfrp-stepper-btn inline-flex h-5 min-w-12 items-center justify-center px-1.5 py-0 focus-visible:ring-wfrp-gold/50",
        className,
      )}
      {...props}
    />
  );
}
