import {
  createContext,
  isValidElement,
  useContext,
  useMemo,
  useState,
  useRef,
  useEffect,
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
  const containerRef = useRef<HTMLDivElement | null>(null);
  const context = useMemo(() => ({ open, setOpen }), [open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={context}>
      <div ref={containerRef} className="relative inline-block">{children}</div>
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

export function DropdownMenuContent({
  className,
  align = "start",
  offset = "default",
  onKeyDown,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  align?: "start" | "center" | "end";
  offset?: "default" | "overlap";
}) {
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
        "absolute z-50 min-w-40 overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-wfrp-popover",
        offset === "default" && "-mt-2",
        offset === "overlap" && "-mt-1",
        align === "end" && "right-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        className,
      )}
      {...props}
    />
  );
}

export function DropdownMenuItem({
  className,
  inset,
  variant = "default",
  onClick,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  inset?: boolean;
  variant?: "default" | "destructive";
}) {
  const context = useDropdownContext("DropdownMenuItem");

  return (
    <div
      role="menuitem"
      tabIndex={0}
      data-variant={variant}
      onClick={(event) => {
        onClick?.(event);
        context.setOpen(false);
      }}
      className={cn(
        "wfrp-text relative flex min-h-9 w-full cursor-pointer select-none items-center px-3 py-1.5 outline-none transition-colors hover:bg-wfrp-control-hover hover:text-white focus:bg-wfrp-control-hover focus:text-white data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
        inset && "pl-8",
        variant === "destructive" && "text-white hover:!text-red-300 focus:!text-red-300",
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
  return <div className={cn("h-px bg-border", className)} {...props} />;
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
