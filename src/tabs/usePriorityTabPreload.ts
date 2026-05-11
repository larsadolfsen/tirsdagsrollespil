import { useEffect } from "react";
import { preloadPriorityTabs } from "./preloadTabs";

export function usePriorityTabPreload() {
  useEffect(() => {
    const preload = () => {
      void preloadPriorityTabs();
    };

    if ("requestIdleCallback" in window) {
      const idleCallbackId = window.requestIdleCallback(preload, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleCallbackId);
    }

    const timeoutId = window.setTimeout(preload, 800);
    return () => window.clearTimeout(timeoutId);
  }, []);
}
