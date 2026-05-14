import type { LabelHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-xs font-black uppercase leading-none tracking-widest text-muted-foreground peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props} />;
}
