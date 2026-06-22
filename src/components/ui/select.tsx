import type { OptionHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/src/lib/utils";

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn("wfrp-text flex min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-foreground shadow-sm transition-colors hover:border-input/80 focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>{children}</select>;
}
export const SelectGroup = ({ children }: { children?: ReactNode }) => <>{children}</>;
export const SelectValue = ({ placeholder }: { placeholder?: string }) => <option value="">{placeholder}</option>;
export const SelectTrigger = Select;
export const SelectContent = ({ children }: { children?: ReactNode }) => <>{children}</>;
export function SelectItem({ className, ...props }: OptionHTMLAttributes<HTMLOptionElement>) { return <option className={className} {...props} />; }
export function SelectLabel({ className, ...props }: OptionHTMLAttributes<HTMLOptionElement>) { return <option disabled className={cn("font-semibold", className)} {...props} />; }
export const SelectSeparator = () => null;
