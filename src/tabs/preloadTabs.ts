import type { MainTab } from "./tabTypes";

const tabPreloaders: Record<MainTab, () => Promise<unknown>> = {
  skills: () => import("./SkillsTab"),
  actions: () => import("./ActionsTab"),
  inventory: () => import("./InventoryTab"),
  spells: () => import("./SpellsTab"),
  features: () => import("./TalentsTab"),
  journal: () => import("./JournalTab"),
  dice: () => import("../features/dice/DiceLogSidebar"),
  career: () => import("./CareerTab"),
  books: () => import("./BooksTab"),
};

export function preloadTab(tab: MainTab) {
  return tabPreloaders[tab]();
}

export function preloadTabs(tabs: MainTab[]) {
  return Promise.all(tabs.map((tab) => preloadTab(tab)));
}

export function preloadPriorityTabs() {
  return preloadTabs(["skills", "actions", "inventory", "spells"]);
}
