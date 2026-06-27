import {
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { cn } from "@/src/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdownContext(componentName: string) {
  const context = useContext(DropdownContext);

  if (!context) {
    throw new Error(`${componentName} must be used within DropdownMenu`);
  }

  return context;
}

export function DropdownMenu({ children }: { children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const context = useMemo(() => ({ open, setOpen }), [open]);

  return (
    <DropdownContext.Provider value={context}>
      <div className="relative inline-block">{children}</div>
    </DropdownContext.Provider>
  );
}

export function DropdownMenuTrigger({ asChild, children, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean; children?: ReactNode }) {
  const context = useDropdownContext("DropdownMenuTrigger");

  if (asChild && isValidElement(children)) {
    return <span onClick={() => context.setOpen(!context.open)}>{children as ReactElement}</span>;
  }

  return (
    <button type="button" aria-expanded={context.open} aria-haspopup="menu" onClick={() => context.setOpen(!context.open)} {...props}>
      {children}
    </button>
  );
}

export function DropdownMenuContent({ className, align = "start", onKeyDown, ...props }: HTMLAttributes<HTMLDivElement> & { align?: "start" | "center" | "end" }) {
  const context = useDropdownContext("DropdownMenuContent");

  if (!context.open) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);

    if (event.key === "Escape") {
      context.setOpen(false);
    }
  }

  return (
    <div
      role="menu"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={cn(
        "absolute z-50 mt-2 min-w-40 overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-wfrp-popover",
        align === "end" && "right-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuItem({ className, inset, onClick, ...props }: HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  const context = useDropdownContext("DropdownMenuItem");

  return (
    <div
      role="menuitem"
      tabIndex={0}
      onClick={(event) => {
        onClick?.(event);
        context.setOpen(false);
      }}
      className={cn(
        "wfrp-text relative flex min-h-9 cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuLabel({ className, inset, ...props }: HTMLAttributes<HTMLDivElement> & { inset?: boolean }) {
  return <div className={cn("wfrp-label px-2 py-1.5 text-muted-foreground", inset && "pl-8", className)} {...props} />;
}

export function DropdownMenuSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-1 my-1 h-px bg-border", className)} {...props} />;
}

export const DropdownMenuGroup = ({ children }: { children?: ReactNode }) => <>{children}</>;
export const DropdownMenuPortal = ({ children }: { children?: ReactNode }) => <>{children}</>;
export const DropdownMenuSub = ({ children }: { children?: ReactNode }) => <>{children}</>;
export const DropdownMenuRadioGroup = ({ children }: { children?: ReactNode }) => <>{children}</>;
export const DropdownMenuSubTrigger = DropdownMenuItem;
export const DropdownMenuSubContent = DropdownMenuContent;
export const DropdownMenuCheckboxItem = DropdownMenuItem;
export const DropdownMenuRadioItem = DropdownMenuItem;
export const DropdownMenuShortcut = ({ className, ...props }: HTMLAttributes<HTMLSpanElement>) => (
  <span className={cn("ml-auto wfrp-label opacity-60", className)} {...props} />
);
