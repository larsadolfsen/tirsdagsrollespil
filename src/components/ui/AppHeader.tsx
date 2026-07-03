import type { ReactNode } from "react";
import { Menu } from "lucide-react";
import { Button } from "./button";

export interface AppHeaderProps {
  /** Visual portrait content — image or initial-letter fallback. Display-only. */
  portrait: ReactNode;
  /** If provided, portrait is wrapped in a button and this is called on click. */
  onPortraitClick?: () => void;
  /** Name + subtitle area. Use AppHeaderIdentity for consistent typography. */
  identity: ReactNode;
  /** Rendered as hidden on mobile (sm:flex). Tabs, icon buttons, links, etc. */
  desktopActions?: ReactNode;
  /**
   * Rendered before the portrait, desktop-only (hidden sm:flex).
   * Use for the GM sessions sidebar toggle button.
   */
  leadingDesktopActions?: ReactNode;
  /** Called when the mobile hamburger button is tapped. */
  onMobileMenuOpen: () => void;
}

export function AppHeader({
  portrait,
  onPortraitClick,
  identity,
  desktopActions,
  leadingDesktopActions,
  onMobileMenuOpen,
}: AppHeaderProps) {
  return (
    <section className="flex h-14 max-h-14 items-center gap-3 overflow-visible border-b border-t-4 border-wfrp-border border-b-white/30 border-t-wfrp-red bg-background px-3 py-1">
      {leadingDesktopActions && (
        <div className="hidden shrink-0 sm:flex">
          {leadingDesktopActions}
        </div>
      )}

      {onPortraitClick ? (
        <button
          type="button"
          onClick={onPortraitClick}
          className="wfrp-character-portrait-button h-10 w-10 shrink-0 sm:h-12 sm:w-12"
        >
          {portrait}
        </button>
      ) : (
        <div className="wfrp-character-portrait-control h-10 w-10 shrink-0 sm:h-12 sm:w-12">
          {portrait}
        </div>
      )}

      <div className="min-w-0 flex-1">
        {identity}
      </div>

      {desktopActions && (
        <div className="hidden h-12 items-stretch sm:flex">
          {desktopActions}
        </div>
      )}

      <Button
        variant="wfrpIcon"
        onClick={onMobileMenuOpen}
        aria-label="Open menu"
        aria-haspopup="dialog"
        leadingIcon={<Menu />}
        className="shrink-0 sm:hidden"
      />
    </section>
  );
}

export interface AppHeaderIdentityProps {
  name: string;
  subtitle?: string;
}

export function AppHeaderIdentity({ name, subtitle }: AppHeaderIdentityProps) {
  return (
    <div className="flex max-h-12 min-w-0 flex-col justify-center overflow-hidden">
      <span className="block truncate font-serif text-base font-semibold leading-tight tracking-tight text-gray-100 sm:text-xl">
        {name}
      </span>
      {subtitle && (
        <span className="block truncate text-[9px] font-semibold uppercase text-wfrp-muted-text sm:text-[10px]">
          {subtitle}
        </span>
      )}
    </div>
  );
}
