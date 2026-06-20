import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { WfrpStandardIcon } from "./ui";

interface AppShellProps {
  children: ReactNode;
  mobileAddAction: {
    label: string;
    onClick: () => void;
  } | null;
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
          <WfrpStandardIcon
            onClick={mobileAddAction.onClick}
            className="fixed bottom-6 right-4 z-40 border border-wfrp-gold/70 bg-wfrp-gold text-black shadow-xl shadow-black/50 hover:border-wfrp-gold focus-visible:ring-2 focus-visible:ring-wfrp-gold/60 md:hidden"
            label={mobileAddAction.label}
            icon={<Plus />}
          />
        )}

        {sidebars}
      </div>
    </div>
  );
}