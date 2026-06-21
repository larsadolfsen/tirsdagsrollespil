import type { ReactNode } from "react";
import {
  MobileFloatingActionButton,
  type MobileFloatingAction,
} from "./MobileFloatingActionButton";

interface AppShellProps {
  children: ReactNode;
  mobileAddAction: MobileFloatingAction | null;
  sidebars: ReactNode;
}

export function AppShell({
  children,
  mobileAddAction,
  sidebars,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-background text-wfrp-page-text font-sans selection:bg-wfrp-gold/40 flex flex-col">
      <div className="h-1 bg-wfrp-red w-full flex-shrink-0" />

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>

        {mobileAddAction && (
          <MobileFloatingActionButton
            onClick={mobileAddAction.onClick}
            label={mobileAddAction.label}
          />
        )}

        {sidebars}
      </div>
    </div>
  );
}
