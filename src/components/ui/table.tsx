import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) { return <div className="relative w-full overflow-auto"><table className={cn("w-full caption-bottom wfrp-text", className)} {...props} /></div>; }
export function TableHeader({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) { return <thead className={cn("[&_tr]:border-b", className)} {...props} />; }
export function TableBody({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) { return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />; }
export function TableFooter({ className, ...props }: HTMLAttributes<HTMLTableSectionElement>) { return <tfoot className={cn("border-t bg-muted/50 font-semibold", className)} {...props} />; }
export function TableRow({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) { return <tr className={cn("border-b border-border transition-colors odd:bg-transparent even:bg-muted/10 hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props} />; }
export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) { return <th className={cn("wfrp-label h-10 px-2 text-left align-middle text-muted-foreground", className)} {...props} />; }
export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) { return <td className={cn("p-2 align-middle", className)} {...props} />; }
export function TableCaption({ className, ...props }: HTMLAttributes<HTMLTableCaptionElement>) { return <caption className={cn("mt-4 wfrp-text text-muted-foreground", className)} {...props} />; }
