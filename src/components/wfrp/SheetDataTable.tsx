import type { ButtonHTMLAttributes, DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type DivProps = HTMLAttributes<HTMLDivElement>;

type SheetDataPanelProps = DivProps & {
  as?: "div" | "section";
};

const rowClasses = "wfrp-table-row grid items-center gap-2";

export function SheetDataPanel({ as: Component = "section", className, ...props }: SheetDataPanelProps) {
  return <Component className={cn("wfrp-subpanel-shell flex flex-col bg-card", className)} {...props} />;
}

export function SheetDataTable({ className, ...props }: DivProps) {
  return <div className={cn("bg-card divide-y divide-white/5", className)} {...props} />;
}

export function SheetDataHeader({ className, ...props }: DivProps) {
  return <div className={cn("wfrp-subpanel-header grid items-center gap-2 bg-card", className)} {...props} />;
}

export function SheetDataRow({ className, ...props }: DivProps) {
  return <div className={cn(rowClasses, "bg-card", className)} {...props} />;
}

export function SheetDataButtonRow({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        rowClasses,
        "w-full cursor-pointer bg-card text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
  );
}

export function SheetDataAccordionRow({
  children,
  className,
  contentClassName,
  detailsClassName,
  summary,
  summaryClassName,
  ...props
}: DetailsHTMLAttributes<HTMLDetailsElement> & {
  contentClassName?: string;
  detailsClassName?: string;
  summary: ReactNode;
  summaryClassName?: string;
}) {
  return (
    <SheetDataRow className={cn("block group", className)}>
      <details className={cn("group/details", detailsClassName)} {...props}>
        <summary
          className={cn(
            "grid min-h-11 cursor-pointer list-none items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 [&::-webkit-details-marker]:hidden",
            summaryClassName,
          )}
        >
          {summary}
        </summary>
        <div className={contentClassName}>{children}</div>
      </details>
    </SheetDataRow>
  );
}

export function SheetDataAccordionDetails({
  description,
  descriptionFallback = "No description available.",
  rows = [],
}: {
  description?: ReactNode;
  descriptionFallback?: ReactNode;
  rows?: Array<{
    bordered?: boolean;
    label: string;
    value: ReactNode;
  }>;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div>
        <p className="max-w-3xl text-[11px] font-bold leading-relaxed text-gray-400">
          {description || <span className="italic text-gray-500">{descriptionFallback}</span>}
        </p>
      </div>

      {rows.length > 0 ? (
        <div className="inline-flex w-fit max-w-full flex-col gap-1 pt-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className={cn(
                "grid grid-cols-[minmax(7rem,max-content)_minmax(0,1fr)] items-baseline gap-3 text-[11px] font-bold text-gray-400",
                row.bordered && "border-y border-white/10 py-1",
              )}
            >
              <span className="wfrp-list-cell-strong text-gray-500">{row.label}</span>
              <span className="wfrp-sidebar-body text-right text-gray-300">{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function SheetEmptyState({ title, children, className }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/5 text-gray-700", className)}>
      <span className="text-[9px] font-black uppercase tracking-widest">{title}</span>
      {children ? <p className="text-[10px] italic">{children}</p> : null}
    </div>
  );
}
