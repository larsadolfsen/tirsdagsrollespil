import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { WfrpStandardIcon } from "./WfrpStandardIcon";

type WfrpArrowDirection = "left" | "right";
type WfrpArrowVariant = "plain" | "scrollOverlay";

const overlayEdgeClasses: Record<WfrpArrowDirection, string> = {
  left: "left-0",
  right: "-right-4 md:right-0",
};

const overlayFadeClasses: Record<WfrpArrowDirection, string> = {
  left: "bg-gradient-to-r from-background via-background/85 to-transparent md:from-wfrp-surface-subtle md:via-wfrp-surface-subtle/95 md:to-transparent",
  right: "bg-gradient-to-l from-background via-background/85 to-transparent md:from-wfrp-surface-subtle md:via-wfrp-surface-subtle/95 md:to-transparent",
};

const overlayButtonGradientClasses: Record<WfrpArrowDirection, string> = {
  left: "bg-gradient-to-l from-background/0 to-background hover:from-background/0 hover:to-background",
  right: "bg-gradient-to-r from-background/0 to-background hover:from-background/0 hover:to-background",
};

export function WfrpArrowButton({
  direction,
  label,
  onClick,
  variant = "plain",
}: {
  direction: WfrpArrowDirection;
  label: string;
  onClick: () => void;
  variant?: WfrpArrowVariant;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  if (variant === "scrollOverlay") {
    return (
      <>
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 w-12 md:w-14",
            overlayEdgeClasses[direction],
            overlayFadeClasses[direction],
          )}
        />
        <WfrpStandardIcon
          onClick={onClick}
          className={cn(
            "absolute top-1/2 z-10 -translate-y-1/2 border-0 text-gray-300 shadow-none hover:border-0 hover:text-white focus-visible:ring-white/30 md:bg-none md:bg-wfrp-tab-control/95 md:shadow-lg md:hover:bg-wfrp-tab-control",
            overlayEdgeClasses[direction],
            overlayButtonGradientClasses[direction],
          )}
          label={label}
          icon={<Icon />}
        />
      </>
    );
  }

  return (
    <WfrpStandardIcon
      onClick={onClick}
      className="border-transparent bg-transparent text-gray-300 shadow-none hover:border-transparent hover:bg-transparent hover:text-white"
      label={label}
      icon={<Icon />}
    />
  );
}
