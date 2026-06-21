import { cn } from "@/src/lib/utils";
import {
  mainTabButtonActiveClassName,
  mainTabButtonBaseClassName,
  mainTabButtonInactiveClassName,
} from "@/src/lib/tabStyles";
import { Button } from "./button";

type MainTabMenuOption<T extends string> = {
  id: T;
  label: string;
};

export function MainTabMenu<T extends string>({
  activeId,
  ariaLabel,
  className,
  onChange,
  options,
}: {
  activeId: T;
  ariaLabel: string;
  className?: string;
  onChange: (id: T) => void;
  options: readonly MainTabMenuOption<T>[];
}) {
  return (
    <nav aria-label={ariaLabel} className={cn("flex h-12 items-stretch gap-6", className)}>
      {options.map((option) => {
        const isActive = option.id === activeId;

        return (
          <Button
            key={option.id}
            name={option.label}
            variant="unstyled"
            onClick={() => onChange(option.id)}
            className={cn(
              mainTabButtonBaseClassName,
              isActive ? mainTabButtonActiveClassName : mainTabButtonInactiveClassName,
            )}
            aria-current={isActive ? "page" : undefined}
          >
            {isActive ? <span className="absolute inset-x-0 bottom-0 h-0.5 bg-wfrp-muted-text" aria-hidden="true" /> : null}
          </Button>
        );
      })}
    </nav>
  );
}
