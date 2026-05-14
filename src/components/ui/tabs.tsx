import { createContext, useContext, useMemo, type ButtonHTMLAttributes, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";

interface TabsContextValue { value?: string; onValueChange?: (value: string) => void }
const TabsContext = createContext<TabsContextValue>({});

export function Tabs({ value, defaultValue, onValueChange, className, ...props }: HTMLAttributes<HTMLDivElement> & { value?: string; defaultValue?: string; onValueChange?: (value: string) => void }) {
  const context = useMemo(() => ({ value: value ?? defaultValue, onValueChange }), [defaultValue, onValueChange, value]);
  return <TabsContext.Provider value={context}><div className={cn("w-full", className)} {...props} /></TabsContext.Provider>;
}
export function TabsList({ className, ...props }: HTMLAttributes<HTMLDivElement>) { return <div role="tablist" className={cn("inline-flex min-h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)} {...props} />; }
export function TabsTrigger({ value, className, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { value: string }) {
  const context = useContext(TabsContext); const active = context.value === value;
  return <button type="button" role="tab" aria-selected={active} data-state={active ? "active" : "inactive"} onClick={(event) => { props.onClick?.(event); context.onValueChange?.(value); }} className={cn("inline-flex min-h-9 items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-xs font-bold uppercase tracking-widest ring-offset-background transition-all hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow", className)} {...props} />;
}
export function TabsContent({ value, className, children, ...props }: HTMLAttributes<HTMLDivElement> & { value: string; children?: ReactNode }) {
  const context = useContext(TabsContext); if (context.value !== value) return null;
  return <div role="tabpanel" data-state="active" className={cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)} {...props}>{children}</div>;
}
