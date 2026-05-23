import type { ButtonHTMLAttributes, DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type DivProps = HTMLAttributes<HTMLDivElement>;

type SheetDataPanelProps = DivProps & {
  as?: "div" | "section";
};

type SheetDataHeaderCellProps = HTMLAttributes<HTMLSpanElement> & {
  align?: "left" | "center" | "right";
};

const rowClasses = "wfrp-table-row grid min-w-0 max-w-full items-center gap-2";

export function SheetDataPanel({ as: Component = "section", className, ...props }: SheetDataPanelProps) {
  return <Component className={cn("wfrp-subpanel-shell flex min-w-0 max-w-full flex-col overflow-hidden bg-card", className)} {...props} />;
}

export function SheetDataTable({ className, ...props }: DivProps) {
  return <div className={cn("min-w-0 max-w-full bg-card divide-y divide-white/5", className)} {...props} />;
}

export function SheetDataHeader({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "wfrp-subpanel-header grid min-w-0 max-w-full items-center gap-2 border-t border-white/5 bg-card",
        className,
      )}
      {...props}
    />
  );
}

export function SheetDataHeaderCell({ align = "left", className, ...props }: SheetDataHeaderCellProps) {
  return (
    <span
      className={cn(
        "wfrp-table-label min-w-0 truncate",
        align === "center" && "justify-self-center text-center",
        align === "left" && "justify-self-start text-left",
        align === "right" && "justify-self-end text-right",
        className,
      )}
      {...props}
    />
  );
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
  contentGridClassName,
  detailsClassName,
  summary,
  summaryClassName,
  ...props
}: DetailsHTMLAttributes<HTMLDetailsElement> & {
  contentClassName?: string;
  contentGridClassName?: string;
  detailsClassName?: string;
  summary: ReactNode;
  summaryClassName?: string;
}) {
  const content = <div className={cn("min-w-0 max-w-full", contentClassName)}>{children}</div>;

  return (
    <SheetDataRow className={cn("block group", className)}>
      <details className={cn("group/details min-w-0 max-w-full", detailsClassName)} {...props}>
        <summary
          className={cn(
            "grid min-h-11 min-w-0 max-w-full cursor-pointer list-none items-center gap-2 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 [&::-webkit-details-marker]:hidden",
            summaryClassName,
          )}
        >
          {summary}
        </summary>
        {contentGridClassName ? <div className={cn("grid min-w-0 max-w-full", contentGridClassName)}>{content}</div> : content}
      </details>
    </SheetDataRow>
  );
}

export function SheetDataAccordionDetails({
  children,
  className,
  description,
  descriptionFallback = "No details available.",
  rows = [],
}: {
  children?: ReactNode;
  className?: string;
  description?: ReactNode;
  descriptionFallback?: ReactNode;
  rows?: Array<{
    bordered?: boolean;
    label: string;
    value: ReactNode;
  }>;
}) {
  return (
    <div className={cn("flex min-w-0 max-w-full flex-col gap-2", className)}>
      <div className="min-w-0 max-w-full">
        <p className="max-w-full break-words text-[11px] font-bold leading-relaxed text-wfrp-muted-text md:max-w-3xl">
          {description || <span className="italic text-wfrp-muted-text">{descriptionFallback}</span>}
        </p>
      </div>

      {rows.length > 0 ? (
        <div className="inline-flex w-fit max-w-full min-w-0 flex-col gap-1 pt-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className={cn(
                "grid min-w-0 grid-cols-[minmax(7rem,max-content)_minmax(0,1fr)] items-baseline gap-3 text-[11px] font-bold text-wfrp-muted-text",
                row.bordered && "border-y border-white/10 py-1",
              )}
            >
              <span className="wfrp-list-cell-strong text-wfrp-muted-text">{row.label}</span>
              <span className="wfrp-sidebar-body min-w-0 text-right text-card-foreground">{row.value}</span>
            </div>
          ))}
        </div>
      ) : null}

      {children}
    </div>
  );
}

export function SheetEmptyState({ title, children, className }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/5 text-wfrp-muted-text", className)}>
      <span className="text-[9px] font-black uppercase tracking-widest">{title}</span>
      {children ? <p className="text-[10px] italic">{children}</p> : null}
    </div>
  );
}
