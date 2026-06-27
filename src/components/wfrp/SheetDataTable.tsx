import { useState } from "react";
import type { ButtonHTMLAttributes, DetailsHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type DivProps = HTMLAttributes<HTMLDivElement>;

type SheetDataPanelProps = DivProps & {
  as?: "div" | "section";
};

type SheetDataHeaderCellProps = HTMLAttributes<HTMLSpanElement> & {
  align?: "left" | "center" | "right";
};

const rowClasses = "wfrp-table-row grid min-w-0 max-w-full items-center gap-0";

function renderMarkedDescription(description: ReactNode, fallback: ReactNode) {
  if (typeof description !== "string") {
    return description || <span className="italic text-wfrp-muted-text">{fallback}</span>;
  }

  const blocks = description
    .trim()
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  if (blocks.length === 0) {
    return <span className="italic text-wfrp-muted-text">{fallback}</span>;
  }

  return blocks.map((block, index) => {
    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const isBulletList = lines.every((line) => line.startsWith("* "));

    if (isBulletList) {
      return (
        <ul key={index} className="list-disc space-y-1 pl-4">
          {lines.map((line) => (
            <li key={line}>{line.slice(2)}</li>
          ))}
        </ul>
      );
    }

    return <p key={index}>{lines.join(" ")}</p>;
  });
}

export function SheetDataPanel({ as: Component = "section", className, ...props }: SheetDataPanelProps) {
  return <Component className={cn("wfrp-subpanel-shell flex min-w-0 max-w-full flex-col overflow-hidden bg-card", className)} {...props} />;
}

export function SheetDataTable({ className, ...props }: DivProps) {
  return <div className={cn("min-w-0 max-w-full bg-card divide-y divide-white/5", className)} {...props} />;
}

export function SheetDataSection({
  children,
  className,
  gridClassName,
  headerClassName,
  leadingLabels = [],
  sectionLabelClassName,
  sectionLabel,
  valueLabels,
  ...props
}: DivProps & {
  children: ReactNode;
  className?: string;
  gridClassName: string;
  headerClassName?: string;
  leadingLabels?: Array<{
    align?: "left" | "center" | "right";
    className?: string;
    key?: string;
    label: ReactNode;
  }>;
  sectionLabelClassName?: string;
  sectionLabel: ReactNode;
  valueLabels: Array<{
    align?: "left" | "center" | "right";
    className?: string;
    key?: string;
    label: ReactNode;
  }>;
}) {
  return (
    <SheetDataPanel className={className} {...props}>
      <SheetDataHeader className={cn(gridClassName, "gap-0", headerClassName)}>
        {leadingLabels.map(({ align, className: valueClassName, key, label }) => (
          <SheetDataHeaderCell
            key={key ?? String(label)}
            align={align}
            className={valueClassName}
          >
            {label}
          </SheetDataHeaderCell>
        ))}
        <SheetDataHeaderCell className={sectionLabelClassName}>{sectionLabel}</SheetDataHeaderCell>
        {valueLabels.map(({ align, className: valueClassName, key, label }) => (
          <SheetDataHeaderCell
            key={key ?? String(label)}
            align={align}
            className={valueClassName}
          >
            {label}
          </SheetDataHeaderCell>
        ))}
      </SheetDataHeader>

      <SheetDataTable>{children}</SheetDataTable>
    </SheetDataPanel>
  );
}

export function SheetDataHeader({ className, ...props }: DivProps) {
  return (
    <div
      className={cn(
        "wfrp-subpanel-header grid min-w-0 max-w-full items-center gap-0 border-t border-white/5 bg-wfrp-table",
        className,
      )}
      {...props}
    />
  );
}

export function SheetDataHeaderCell({ align = "left", className, ...props }: SheetDataHeaderCellProps) {
  const isDisclosureLabel = typeof props.children === "string" && props.children.toLowerCase() === "more";

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
      aria-hidden={isDisclosureLabel ? true : props["aria-hidden"]}
    >
      {isDisclosureLabel ? "" : props.children}
    </span>
  );
}

export function SheetDataRow({ className, ...props }: DivProps) {
  return <div className={cn(rowClasses, "bg-card even:bg-wfrp-table", className)} {...props} />;
}

export function SheetDataButtonRow({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        rowClasses,
        "w-full cursor-pointer bg-card text-left transition-colors even:bg-wfrp-table hover:bg-wfrp-control-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
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
}: DivProps & {
  contentClassName?: string;
  contentGridClassName?: string;
  detailsClassName?: string;
  summary: ReactNode;
  summaryClassName?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const content = (
    <div
      className={cn(
        "min-w-0 max-w-full px-3 pb-4 pt-1 text-left md:px-4 md:pb-4",
        contentClassName,
      )}
    >
      {children}
    </div>
  );

  return (
    <SheetDataRow className={cn("wfrp-data-accordion-row block group", className)}>
      <div
        data-open={isOpen ? "true" : "false"}
        className={cn("group/details min-w-0 max-w-full", detailsClassName)}
        {...props}
      >
        <div
          role="button"
          tabIndex={0}
          aria-expanded={isOpen}
          aria-label="Toggle row details"
          onClick={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest("button, a, input, select, textarea")) {
              return;
            }
            setIsOpen((current) => !current);
          }}
          onKeyDown={(event) => {
            if (event.key !== "Enter" && event.key !== " ") return;
            event.preventDefault();
            setIsOpen((current) => !current);
          }}
          className={cn(
            "wfrp-data-accordion-summary grid min-w-0 max-w-full cursor-pointer list-none items-center gap-0 transition-colors hover:bg-wfrp-control-hover focus-visible:bg-wfrp-control-hover focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/40 [&::-webkit-details-marker]:hidden",
            summaryClassName,
          )}
        >
          {summary}
        </div>
        {isOpen
          ? contentGridClassName
            ? <div className={cn("grid min-w-0 max-w-full", contentGridClassName)}>{content}</div>
            : content
          : null}
      </div>
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
    valueClassName?: string;
  }>;
}) {
  return (
    <div className={cn("flex min-w-0 max-w-full flex-col gap-2", className)}>
      <div className="min-w-0 max-w-full border-b border-white/10 pb-3">
        <div className="flex max-w-full flex-col gap-2 break-words wfrp-text-strong text-wfrp-muted-text md:max-w-3xl">
          {renderMarkedDescription(description, descriptionFallback)}
        </div>
      </div>

      {rows.length > 0 ? (
        <div className="min-w-0 max-w-full border-b border-white/10 pb-3">
          <div className="inline-flex w-fit max-w-full min-w-0 flex-col gap-1 pt-2">
            {rows.map((row) => (
              <div
                key={row.label}
                className={cn(
                  "grid min-w-0 grid-cols-[minmax(7rem,max-content)_minmax(0,1fr)] items-baseline gap-3 wfrp-text-strong text-wfrp-muted-text",
                  row.bordered && "border-y border-white/10 py-1",
                )}
              >
                <span className="wfrp-list-cell-strong text-wfrp-muted-text">{row.label}</span>
                <span className={cn("wfrp-sidebar-body min-w-0 text-left text-card-foreground", row.valueClassName)}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {children}
    </div>
  );
}

export function SheetEmptyState({ title, children, className }: { title: string; children?: ReactNode; className?: string }) {
  return (
    <div className={cn("flex min-h-48 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-white/5 text-wfrp-muted-text", className)}>
      <span className="wfrp-label">{title}</span>
      {children ? <p className="wfrp-text italic">{children}</p> : null}
    </div>
  );
}
