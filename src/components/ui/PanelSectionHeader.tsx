import { Heading } from "./Heading";

export function PanelSectionHeader({
  title,
  meta,
}: {
  title: string;
  meta?: string;
}) {
  return (
    <div className="wfrp-section-head">
      <Heading level={3} variant="panel">{title}</Heading>
      {meta ? <span className="wfrp-section-meta">{meta}</span> : null}
    </div>
  );
}
