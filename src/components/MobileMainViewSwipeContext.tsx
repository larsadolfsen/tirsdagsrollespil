import { createContext, useContext } from "react";
import type { HTMLAttributes, ReactNode } from "react";

type MobileMainViewSwipeHandlers = Pick<
  HTMLAttributes<HTMLDivElement>,
  "onTouchCancel" | "onTouchEnd" | "onTouchStart"
>;

const MobileMainViewSwipeContext = createContext<MobileMainViewSwipeHandlers | null>(null);

export function MobileMainViewSwipeProvider({
  children,
  handlers,
}: {
  children: ReactNode;
  handlers: MobileMainViewSwipeHandlers;
}) {
  return (
    <MobileMainViewSwipeContext.Provider value={handlers}>
      {children}
    </MobileMainViewSwipeContext.Provider>
  );
}

export function useMobileMainViewSwipeHandlers() {
  return useContext(MobileMainViewSwipeContext);
}
