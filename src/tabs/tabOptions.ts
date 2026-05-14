import type { MainTab, MobileTabMenuTarget, TabOption } from "./tabTypes";

export const mainTabOptions: Array<TabOption<MainTab>> = [
  { id: "skills", label: "Skills" },
  { id: "actions", label: "Actions" },
  { id: "inventory", label: "Inventory" },
  { id: "spells", label: "Spells" },
  { id: "features", label: "Talents" },
  { id: "journal", label: "Journal" },
  { id: "career", label: "Advance" },
];

export const mobileTabMenuOptions: Array<TabOption<MobileTabMenuTarget>> = [
  { id: "characteristics", label: "Characteristics" },
  ...mainTabOptions,
];

export const mobilePageTitleByView: Record<MobileTabMenuTarget, string> = mobileTabMenuOptions.reduce(
  (titles, option) => ({ ...titles, [option.id]: option.label }),
  {} as Record<MobileTabMenuTarget, string>,
);
