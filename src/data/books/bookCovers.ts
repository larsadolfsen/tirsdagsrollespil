// Static image imports are resolved by Vite at build/dev time, so this module
// (like loadChapterContent.ts) must stay out of anything imported by Node-side tests.
import coreRulebookCover from "./core-rulebook/cover.png";
import windsOfMagicCover from "./winds-of-magic/cover.png";

export const bookCovers: Record<string, string> = {
  "core-rulebook": coreRulebookCover,
  "winds-of-magic": windsOfMagicCover,
};
