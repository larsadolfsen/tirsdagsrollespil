import type { ComponentProps } from "react";
import { cn } from "@/src/lib/utils";
import { Badge } from "@/src/components/ui/badge";

type Tone = "neutral" | "gold" | "danger" | "success";
const tones: Record<Tone, string> = {
  neutral: "border-border bg-secondary text-secondary-foreground",
  gold: "border-wfrp-gold/40 bg-wfrp-gold-surface text-wfrp-gold",
  danger: "border-destructive/50 bg-destructive/20 text-destructive-foreground",
  success: "border-wfrp-aqua/40 bg-wfrp-aqua/10 text-wfrp-aqua",
};

export function WfrpStatusBadge({ tone = "neutral", className, ...props }: ComponentProps<typeof Badge> & { tone?: Tone }) {
  return <Badge variant="outline" className={cn(tones[tone], className)} {...props} />;
}
