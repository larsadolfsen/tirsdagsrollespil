import { Suspense } from "react";
import type { ReactNode } from "react";
import { TabLoadingFallback } from "./TabLoadingFallback";

export function LazyTabPanel({ children }: { children: ReactNode }) {
  return <Suspense fallback={<TabLoadingFallback />}>{children}</Suspense>;
}
