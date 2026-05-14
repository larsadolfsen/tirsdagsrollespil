import type { HTMLAttributes } from "react";
import { cn } from "../../lib/utils";

type SurfaceElement = "article" | "div" | "section";

type SurfaceProps = HTMLAttributes<HTMLElement> & {
  as?: SurfaceElement;
};

export function Card({ as: Component = "div", className, ...props }: SurfaceProps) {
  return <Component className={cn("wfrp-card", className)} {...props} />;
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("wfrp-card-tab-header", className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("wfrp-card-tab-body", className)} {...props} />;
}

export function Panel({ as: Component = "section", className, ...props }: SurfaceProps) {
  return <Component className={cn("wfrp-subpanel-shell", className)} {...props} />;
}
