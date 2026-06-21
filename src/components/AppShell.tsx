import type { ReactNode } from "react";
import { Plus } from "lucide-react";
import { Button } from "./ui";

type MobileFloatingAction = {
  label: string;
  onClick: () => void;
};

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
      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 overflow-y-auto p-0">
          {children}
        </main>

        {mobileAddAction && (
          <Button
            variant="fab"
            onClick={mobileAddAction.onClick}
            aria-label={mobileAddAction.label}
          >
            <Plus aria-hidden="true" className="h-7 w-7" />
          </Button>
        )}

        {sidebars}
      </div>
    </div>
  );
}
