import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/src/lib/utils";

export type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type HeadingVariant =
  | "page"
  | "pageCompact"
  | "pageDisplay"
  | "pageSmall"
  | "section"
  | "sectionDisplay"
  | "sectionEditorial"
  | "sectionProminent"
  | "subsection"
  | "chapterH1"
  | "chapterH2"
  | "chapterH3"
  | "chapterH4"
  | "chapterH5"
  | "chapterH6"
  | "panel"
  | "panelStrong"
  | "sidebar"
  | "sidebarLarge"
  | "sidebarLabel"
  | "sidebarPage"
  | "sidebarItem"
  | "sidebarItemActive"
  | "item"
  | "roll"
  | "rollMuted"
  | "card"
  | "component"
  | "visuallyHidden";

const variantClasses: Record<HeadingVariant, string> = {
  page: "font-serif text-2xl font-semibold leading-tight tracking-tight text-gray-100",
  pageCompact: "font-serif text-base font-semibold leading-tight tracking-tight text-gray-100 sm:text-xl",
  pageDisplay: "font-serif text-3xl font-semibold leading-tight text-gray-100",
  pageSmall: "font-serif text-xl font-semibold leading-tight tracking-tight text-gray-100",
  section: "wfrp-heading font-serif text-gray-100",
  sectionDisplay: "font-serif text-3xl font-semibold leading-tight text-gray-100",
  sectionEditorial: "font-display text-lg font-semibold leading-tight tracking-wide text-gray-100",
  sectionProminent: "font-serif text-2xl font-semibold leading-tight text-gray-100",
  subsection: "font-serif text-lg font-semibold leading-tight text-gray-100",
  chapterH1: "font-serif text-[45px] font-normal leading-[52px] tracking-normal text-gray-100 pt-0",
  chapterH2: "font-serif text-[36px] font-normal leading-[44px] tracking-normal text-gray-100 pt-[22px]",
  chapterH3: "font-serif text-[28px] font-normal leading-[36px] tracking-normal text-gray-100 pt-[18px]",
  chapterH4: "font-sans text-[22px] font-normal leading-[28px] tracking-normal text-gray-100 pt-[14px]",
  chapterH5: "font-sans text-[16px] font-medium leading-[24px] tracking-normal text-gray-100 pt-3",
  chapterH6: "font-sans text-[14px] font-medium leading-[20px] tracking-normal text-gray-100 pt-2.5",
  panel: "wfrp-label flex items-center gap-2 text-wfrp-muted-text",
  panelStrong: "wfrp-label flex items-center gap-2 text-gray-100",
  sidebar: "wfrp-sidebar-title",
  sidebarLarge: "wfrp-sidebar-title text-xl",
  sidebarLabel: "text-sm font-semibold leading-tight uppercase tracking-widest text-gray-100",
  sidebarPage: "font-serif text-xl font-semibold leading-tight tracking-tight text-gray-100",
  sidebarItem: "wfrp-heading text-[11px] uppercase tracking-tight text-white/60",
  sidebarItemActive: "wfrp-heading text-[11px] uppercase tracking-tight text-gray-100",
  item: "wfrp-text-strong text-gray-100",
  roll: "wfrp-text-strong font-serif uppercase tracking-tight text-gray-100",
  rollMuted: "wfrp-text-strong font-serif uppercase tracking-tight text-white/50",
  card: "wfrp-landing-card-title",
  component: "wfrp-heading font-display tracking-wide text-foreground",
  visuallyHidden: "sr-only",
};

type NativeHeadingProps = Omit<ComponentPropsWithoutRef<"h2">, "className" | "style">;

export interface HeadingProps extends NativeHeadingProps {
  level: HeadingLevel;
  variant: HeadingVariant;
  align?: "left" | "center" | "right";
  truncate?: boolean;
}

export function Heading({
  level,
  variant,
  align,
  truncate = false,
  ...props
}: HeadingProps) {
  const Tag = `h${level}` as const;

  return (
    <Tag
      className={cn(
        variantClasses[variant],
        align === "left" && "text-left",
        align === "center" && "text-center",
        align === "right" && "text-right",
        truncate && "truncate",
      )}
      {...props}
    />
  );
}
