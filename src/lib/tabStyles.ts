export const tabFocusRingClassName =
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50";

export const mainTabButtonBaseClassName =
  "wfrp-label relative py-3.5 px-0.5 transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50";

export const mainTabButtonActiveClassName = "text-white";
export const mainTabButtonInactiveClassName = "text-[var(--color-wfrp-muted-text)] hover:text-white";
export const mainTabUnderlineClassName = "absolute bottom-0 left-0 right-0 h-0.5 bg-white";

export const inlineSubtabButtonBaseClassName =
  "wfrp-label group inline-flex h-12 cursor-pointer items-center justify-center bg-transparent p-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50";

export const inlineSubtabButtonActiveClassName = "bg-wfrp-gold text-primary-foreground";
export const inlineSubtabButtonInactiveClassName =
  "bg-white/10 text-[var(--color-wfrp-muted-text)] group-hover:bg-white/15 group-hover:text-gray-100";

export const mobileTabButtonBaseClassName =
  "wfrp-label mx-3 flex h-11 w-[calc(100%-1.5rem)] cursor-pointer items-center rounded border px-4 text-left tracking-wide text-[var(--color-wfrp-muted-text)] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50";

export const mobileTabButtonActiveClassName = "border-wfrp-border bg-white/10 hover:text-white";
export const mobileTabButtonInactiveClassName = "border-transparent hover:border-wfrp-border hover:bg-white/10 hover:text-white";
