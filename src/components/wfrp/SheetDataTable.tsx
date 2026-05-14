import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";

type DivProps = HTMLAttributes<HTMLDivElement>;

type SheetDataPanelProps = DivProps & {
  as?: "div" | "section";
};

const rowClasses = "wfrp-table-row grid items-center gap-2";

export function SheetDataPanel({ as: Component = "section", className, ...props }: SheetDataPanelProps) {
  return <Component className={cn("wfrp-subpanel-shell flex flex-col", className)} {...props} />;
}

export function SheetDataTable({ className, ...props }: DivProps) {
  return <div className={cn("divide-y divide-white/5", className)} {...props} />;
}

export function SheetDataHeader({ className, ...props }: DivProps) {
  return <div className={cn("wfrp-subpanel-header grid items-center gap-2", className)} {...props} />;
}

export function SheetDataRow({ className, ...props }: DivProps) {
  return <div className={cn(rowClasses, className)} {...props} />;
}

export function SheetDataButtonRow({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        rowClasses,
        "w-full cursor-pointer text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        className,
      )}
      {...props}
    />
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
