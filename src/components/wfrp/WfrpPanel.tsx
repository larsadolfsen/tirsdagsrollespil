import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/src/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";

export interface WfrpPanelProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  title?: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
  children?: ReactNode;
}

export function WfrpPanel({ title, description, actions, className, children, ...props }: WfrpPanelProps) {
  return (
    <Card className={cn("border-wfrp-border bg-card shadow-lg", className)} {...props}>
      {(title || description || actions) && (
        <CardHeader className="flex-row items-start justify-between gap-4 border-b border-border bg-wfrp-surface-subtle">
          <div className="space-y-1">
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </CardHeader>
      )}
      <CardContent className={cn((title || description || actions) ? "p-4" : "p-3 lg:p-4")}>{children}</CardContent>
    </Card>
  );
}
