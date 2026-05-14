import type { HTMLAttributes, KeyboardEvent, ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogTrigger,
  useDialogContext,
} from "./dialog";

export {
  Dialog as Sheet,
  DialogClose as SheetClose,
  DialogDescription as SheetDescription,
  DialogFooter as SheetFooter,
  DialogHeader as SheetHeader,
  DialogTitle as SheetTitle,
  DialogTrigger as SheetTrigger,
};

export function SheetPortal({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export const SheetOverlay = DialogOverlay;

export function SheetContent({
  side = "right",
  className,
  children,
  onKeyDown,
  ...props
}: HTMLAttributes<HTMLDivElement> & { side?: "top" | "right" | "bottom" | "left" }) {
  const context = useDialogContext("SheetContent");

  if (!context.open) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    onKeyDown?.(event);

    if (event.key === "Escape") {
      context.setOpen(false);
    }
  }

  const sideClasses = {
    top: "inset-x-0 top-0 h-auto border-b",
    right: "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l",
    bottom: "inset-x-0 bottom-0 h-auto border-t",
    left: "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r",
  }[side];

  return (
    <SheetPortal>
      <SheetOverlay onClick={() => context.setOpen(false)} />
      <div
        aria-describedby={context.descriptionId}
        aria-labelledby={context.titleId}
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn("fixed z-50 gap-4 border-border bg-sidebar p-6 text-sidebar-foreground shadow-wfrp-popover", sideClasses, className)}
        {...props}
      >
        {children}
        <Button aria-label="Close sheet" variant="ghost" size="icon" className="absolute right-4 top-4 h-8 w-8" onClick={() => context.setOpen(false)}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    </SheetPortal>
  );
}
