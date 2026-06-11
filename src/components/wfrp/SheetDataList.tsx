import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";
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

export function SheetDataResponsiveListRow({
  className,
  desktopClassName,
  desktopContent,
  detailsClassName,
  mobileDetails,
  mobileSummary,
  summaryClassName,
  ...props
}: DivProps & {
  desktopClassName?: string;
  desktopContent: ReactNode;
  detailsClassName?: string;
  mobileDetails: SheetDataMobileDetailField[];
  mobileSummary: ReactNode;
  summaryClassName?: string;
}) {
  return (
    <SheetDataListRow className={cn("border-0 group md:flex md:min-w-[700px]", className)} {...props}>
      <details className={cn("group/details md:hidden", detailsClassName)}>
        <summary
          className={cn(
            "grid min-h-11 cursor-pointer list-none items-center gap-2 [&::-webkit-details-marker]:hidden",
            summaryClassName,
          )}
        >
          {mobileSummary}
        </summary>
        <SheetDataMobileDetails fields={mobileDetails} />
      </details>

      <div
        className={cn(
          "hidden flex-1 items-center md:grid",
          desktopClassName,
        )}
      >
        {desktopContent}
      </div>
    </SheetDataListRow>
  );
}

export function SheetDataDesktopCell({
  align = "left",
  children,
  className,
  fontMono = false,
  truncate = false,
}: {
  align?: "left" | "center" | "right";
  children: ReactNode;
  className?: string;
  fontMono?: boolean;
  truncate?: boolean;
}) {
  return (
    <div
      className={cn(
        "hidden wfrp-list-cell-strong md:block",
        align === "center" && "text-center",
        align === "right" && "text-right",
        fontMono && "font-mono",
        truncate && "truncate",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function SheetDataInfoButton({
  children = "Info",
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "min-h-8 rounded border border-white/10 px-2 text-[10px] font-black uppercase tracking-wider text-gray-300 hover:border-wfrp-gold/40 hover:text-wfrp-gold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 md:hidden",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function SheetDataDisclosureChevron({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-12 min-h-12 w-12 min-w-12 items-center justify-center justify-self-end rounded text-wfrp-muted-text transition-colors hover:text-wfrp-gold",
        className,
      )}
      aria-hidden="true"
    >
      <ChevronDown
        size={14}
        className="transition-transform group-open/details:rotate-180 group-data-[open=true]/details:rotate-180"
      />
    </span>
  );
}

export function SheetDataDisclosureCell({ className }: { className?: string }) {
  return <SheetDataDisclosureChevron className={cn("md:inline-flex", className)} />;
}

export function SheetDataRollCell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("wfrp-roll-cell flex", className)}>
      {children}
    </div>
  );
}

export function SheetRowActionButton({
  children,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        "wfrp-stepper-btn wfrp-stepper-btn--value focus-visible:ring-wfrp-gold/50",
        className,
      )}
      {...props}
    >
      <span className="wfrp-stepper-btn__inner">{children}</span>
    </button>
  );
}
