import {
  createContext,
  isValidElement,
  useContext,
  useId,
  useMemo,
  useState,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { WfrpStandardIcon } from "./WfrpStandardIcon";

interface DialogContextValue {
  descriptionId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  titleId: string;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(componentName: string) {
  const context = useContext(DialogContext);

  if (!context) {
    throw new Error(`${componentName} must be used within Dialog`);
  }

  return context;
}

export function Dialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const titleId = useId();
  const descriptionId = useId();
  const open = controlledOpen ?? uncontrolledOpen;
  const context = useMemo(
    () => ({
      descriptionId,
      open,
      setOpen: (nextOpen: boolean) => {
        setUncontrolledOpen(nextOpen);
        onOpenChange?.(nextOpen);
      },
      titleId,
    }),
    [descriptionId, onOpenChange, open, titleId],
  );

  return <DialogContext.Provider value={context}>{children}</DialogContext.Provider>;
}

export function DialogTrigger({ asChild, children, ...props }: HTMLAttributes<HTMLButtonElement> & { asChild?: boolean; children?: ReactNode }) {
  const context = useDialogContext("DialogTrigger");

  if (asChild && isValidElement(children)) {
    return <span onClick={() => context.setOpen(true)}>{children as ReactElement}</span>;
  }

  return (
    <button type="button" onClick={() => context.setOpen(true)} {...props}>
      {children}
    </button>
  );
}

export function DialogPortal({ children }: { children?: ReactNode }) {
  return <>{children}</>;
}

export function DialogOverlay({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("fixed inset-0 z-50 bg-overlay", className)} {...props} />;
}

export function DialogContent({ className, children, onKeyDown, ...props }: HTMLAttributes<HTMLDivElement>) {
  const context = useDialogContext("DialogContent");

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
    <DialogPortal>
      <DialogOverlay onClick={() => context.setOpen(false)} />
      <div
        aria-describedby={context.descriptionId}
        aria-labelledby={context.titleId}
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={cn(
          "fixed left-1/2 top-1/2 z-50 grid w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-lg border border-border bg-popover p-6 text-popover-foreground shadow-wfrp-popover",
          className,
        )}
        {...props}
      >
        {children}
        <WfrpStandardIcon
          className="absolute right-3 top-3"
          label="Close dialog"
          onClick={() => context.setOpen(false)}
          icon={<X />}
        />
      </div>
    </DialogPortal>
  );
}

export function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props} />;
}

export function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props} />;
}

export function DialogTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const context = useDialogContext("DialogTitle");

  return <h2 id={context.titleId} className={cn("wfrp-heading font-display tracking-wide text-foreground", className)} {...props} />;
}

export function DialogDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const context = useDialogContext("DialogDescription");

  return <p id={context.descriptionId} className={cn("wfrp-text text-muted-foreground", className)} {...props} />;
}

export function DialogClose(props: HTMLAttributes<HTMLButtonElement>) {
  const context = useDialogContext("DialogClose");

  return <button type="button" onClick={() => context.setOpen(false)} {...props} />;
}
