export function TabLoadingFallback({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="p-4 text-sm text-wfrp-muted-text">
      {label}
    </div>
  );
}
