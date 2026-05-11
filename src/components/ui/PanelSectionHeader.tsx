export function PanelSectionHeader({
  title,
  meta,
}: {
  title: string;
  meta?: string;
}) {
  return (
    <div className="wfrp-section-head">
      <h3 className="wfrp-panel-title">{title}</h3>
      {meta ? <span className="wfrp-section-meta">{meta}</span> : null}
    </div>
  );
}
