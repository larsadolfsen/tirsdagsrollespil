import type { BookMeta } from "./types";
import { coreRulebookMeta } from "./core-rulebook";
import { windsOfMagicMeta } from "./winds-of-magic";

export const bookCatalog: BookMeta[] = [coreRulebookMeta, windsOfMagicMeta];
