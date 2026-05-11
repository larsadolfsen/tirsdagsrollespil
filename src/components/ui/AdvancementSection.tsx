import type { ReactNode } from "react";
import { PanelSectionHeader } from "./PanelSectionHeader";

export function AdvancementSection({
  title,
  meta,
  hideHeader = false,
  children,
}: {
  title: string;
  meta?: string;
  hideHeader?: boolean;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      {!hideHeader && <PanelSectionHeader title={title} meta={meta} />}
      {children}
    </section>
  );
}
