import { lazy, Suspense } from "react";
import type { MainTab } from "./tabTypes";
import { TabLoadingFallback } from "./TabLoadingFallback";

const SkillsTab = lazy(() => import("./SkillsTab").then((module) => ({ default: module.SkillsTab })));
const ActionsTab = lazy(() => import("./ActionsTab").then((module) => ({ default: module.ActionsTab })));
const InventoryTab = lazy(() => import("./InventoryTab").then((module) => ({ default: module.InventoryTab })));
const SpellsTab = lazy(() => import("./SpellsTab").then((module) => ({ default: module.SpellsTab })));
const TalentsTab = lazy(() => import("./TalentsTab").then((module) => ({ default: module.TalentsTab })));
const BackgroundTab = lazy(() => import("./BackgroundTab").then((module) => ({ default: module.BackgroundTab })));
const NotesTab = lazy(() => import("./NotesTab").then((module) => ({ default: module.NotesTab })));
const CareerTab = lazy(() => import("./CareerTab").then((module) => ({ default: module.CareerTab })));

export function LazyTabPanel({ activeTab }: { activeTab: MainTab }) {
  return (
    <Suspense fallback={<TabLoadingFallback />}>
      {activeTab === "skills" && <SkillsTab />}
      {activeTab === "actions" && <ActionsTab />}
      {activeTab === "inventory" && <InventoryTab />}
      {activeTab === "spells" && <SpellsTab />}
      {activeTab === "features" && <TalentsTab />}
      {activeTab === "background" && <BackgroundTab />}
      {activeTab === "notes" && <NotesTab />}
      {activeTab === "career" && <CareerTab />}
    </Suspense>
  );
}
