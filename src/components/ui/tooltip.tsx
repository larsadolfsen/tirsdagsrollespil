import { createContext, useContext, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";

const TooltipContext = createContext(false);
export function TooltipProvider({ children }: { children?: ReactNode }) { return <>{children}</>; }
export function Tooltip({ children }: { children?: ReactNode }) { return <TooltipContext.Provider value={true}><span className="group/tooltip relative inline-flex">{children}</span></TooltipContext.Provider>; }
export function TooltipTrigger({ children }: { children?: ReactNode }) { useContext(TooltipContext); return <>{children}</>; }
export function TooltipContent({ className, sideOffset = 4, ...props }: HTMLAttributes<HTMLDivElement> & { sideOffset?: number }) { return <div role="tooltip" style={{ marginTop: sideOffset }} className={cn("pointer-events-none absolute left-1/2 top-full z-50 w-max max-w-64 -translate-x-1/2 rounded-md border border-border bg-popover px-3 py-1.5 text-xs text-popover-foreground opacity-0 shadow-wfrp-popover transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100", className)} {...props} />; }
