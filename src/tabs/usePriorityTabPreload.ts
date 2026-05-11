import { useEffect } from "react";
import { preloadPriorityTabs } from "./preloadTabs";

let hasScheduledPriorityTabPreload = false;

type IdleCallbackWindow = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

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

    const browserWindow = window as IdleCallbackWindow;

    if (browserWindow.requestIdleCallback) {
      const idleCallbackId = browserWindow.requestIdleCallback(preload, { timeout: 1500 });
      return () => browserWindow.cancelIdleCallback?.(idleCallbackId);
    }

    const timeoutId = browserWindow.setTimeout(preload, 800);
    return () => browserWindow.clearTimeout(timeoutId);
  }, []);
}
