export type ActionCategory = "all" | "magic" | "melee" | "ranged" | "other";
export type MainTab = "skills" | "actions" | "inventory" | "spells" | "features" | "journal" | "career";
export type MobileMainView = MainTab | "characteristics";
export type JournalSubtab = "sessions" | "npcs" | "background";
export type SkillSubtab = "all" | "advanced" | "basic";
export type SpellSubtab = "all" | "petty" | "arcane" | `school:${string}`;
export type InventorySubtab = "all" | "worn" | "carried" | `container:${string}`;
export type CareerSubtab = "experience" | "characteristics" | "careers" | "skills" | "talents";
export type CoinKey = "gc" | "s" | "d";

export type TabOption<T extends string> = {
  id: T;
  label: string;
};
