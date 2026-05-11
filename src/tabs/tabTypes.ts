export type ActionCategory = "all" | "melee" | "ranged" | "other";
export type MainTab = "skills" | "actions" | "inventory" | "spells" | "features" | "background" | "notes" | "career";
export type MobileTabMenuTarget = MainTab | "characteristics";
export type SkillSubtab = "all" | "trained" | "advanced" | "basic";
export type SpellSubtab = "all" | "petty" | "arcane" | `school:${string}`;
export type InventorySubtab = "all" | "worn" | "carried" | `container:${string}`;
export type CareerSubtab = "all" | "careers" | "characteristics" | "skills" | "talents";
export type CoinKey = "gc" | "s" | "d";

export type TabOption<T extends string> = {
  id: T;
  label: string;
};
