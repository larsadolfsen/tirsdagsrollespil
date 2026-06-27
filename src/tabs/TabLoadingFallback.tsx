export function TabLoadingFallback({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="p-4 wfrp-text text-wfrp-muted-text">
      {label}
    </div>
  );
}
