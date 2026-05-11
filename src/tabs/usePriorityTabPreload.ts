import { useEffect } from "react";
import { preloadPriorityTabs } from "./preloadTabs";

let hasScheduledPriorityTabPreload = false;

export function usePriorityTabPreload() {
  useEffect(() => {
    if (hasScheduledPriorityTabPreload) {
      return;
    }

    hasScheduledPriorityTabPreload = true;

    const preload = () => {
      void preloadPriorityTabs().catch(() => {
        hasScheduledPriorityTabPreload = false;
      });
    };

    if ("requestIdleCallback" in window) {
      const idleCallbackId = window.requestIdleCallback(preload, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleCallbackId);
    }

    const timeoutId = window.setTimeout(preload, 800);
    return () => window.clearTimeout(timeoutId);
  }, []);
}
