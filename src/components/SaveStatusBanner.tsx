import { useEffect, useState } from "react";
import { subscribeToSaveStatus } from "../data/persistence";

/**
 * Surfaces durable-save failures. A character save is a fire-and-forget request
 * to the server; when it fails (HTTP error or network problem) this banner tells
 * the user their latest changes were not persisted, instead of the app silently
 * pretending the save succeeded. A later successful save clears it.
 */
export function SaveStatusBanner() {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    return subscribeToSaveStatus((message) => {
      setHasError(message.type === "error");
    });
  }, []);

  if (!hasError) return null;

  // The outer wrapper lets clicks pass through (pointer-events-none) so the
  // toast never blocks the controls beneath it; only the card itself is
  // interactive.
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex justify-center p-3">
      <div
        role="alert"
        className="pointer-events-auto flex max-w-md items-center gap-3 rounded-lg bg-red-900/95 px-4 py-2 text-sm text-red-50 shadow-lg"
      >
        <span>
          Couldn&rsquo;t save your latest changes to the server &mdash; they may be lost. The next change will try again.
        </span>
        <button
          type="button"
          onClick={() => setHasError(false)}
          aria-label="Dismiss save error"
          className="shrink-0 rounded border border-red-200/40 px-2 py-0.5 text-xs font-medium hover:bg-red-800"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
