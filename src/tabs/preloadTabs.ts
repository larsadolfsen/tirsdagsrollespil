import type { MainTab } from "./tabTypes";

const tabPreloaders: Record<MainTab, () => Promise<unknown>> = {
  skills: () => import("./SkillsTab"),
  actions: () => import("./ActionsTab"),
  inventory: () => import("./InventoryTab"),
  spells: () => import("./SpellsTab"),
  features: () => import("./TalentsTab"),
  background: () => import("./BackgroundTab"),
  notes: () => import("./NotesTab"),
  career: () => import("./CareerTab"),
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
