import type { Ruleset } from "../../types";
import { wfrp4eRuleset } from "./wfrp4e";

export const rulesets: Ruleset[] = [wfrp4eRuleset];

export const rulesetById = Object.fromEntries(
  rulesets.map((ruleset) => [ruleset.id, ruleset]),
);
