export const tabFocusRingClassName =
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50";

export const mainTabButtonBaseClassName =
  "relative py-3.5 px-0.5 text-[11px] font-bold uppercase tracking-widest transition-all cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50";

export const mainTabButtonActiveClassName = "text-white";
export const mainTabButtonInactiveClassName = "text-[var(--color-wfrp-muted-text)]";
export const mainTabUnderlineClassName = "absolute bottom-0 left-0 right-0 h-0.5 bg-wfrp-gold/70";

export const inlineSubtabButtonBaseClassName =
  "group inline-flex h-12 cursor-pointer items-center justify-center bg-transparent p-0 text-[11px] font-bold uppercase tracking-widest focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-wfrp-gold/50";

export const inlineSubtabButtonActiveClassName = "bg-wfrp-gold text-primary-foreground";
export const inlineSubtabButtonInactiveClassName = "bg-[#242424] text-[var(--color-wfrp-muted-text)]";

export const mobileTabButtonBaseClassName =
  "mx-3 flex h-11 w-[calc(100%-1.5rem)] items-center rounded border px-4 text-left text-[11px] font-bold uppercase tracking-widest transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-wfrp-gold/50";

export const mobileTabButtonActiveClassName = "border-wfrp-gold/50 bg-wfrp-gold/15 text-wfrp-gold";
export const mobileTabButtonInactiveClassName = "border-transparent text-wfrp-muted-text hover:border-wfrp-border hover:bg-wfrp-surface hover:text-wfrp-gold";
