export function TabLoadingFallback({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="p-4 text-sm text-gray-500">
      {label}
    </div>
  );
}
