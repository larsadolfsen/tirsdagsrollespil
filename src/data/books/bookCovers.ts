// Static image imports are resolved by Vite at build/dev time, so this module
// (like loadChapterContent.ts) must stay out of anything imported by Node-side tests.
import coreRulebookCover from "./core-rulebook/cover.png";

export const bookCovers: Record<string, string> = {
  "core-rulebook": coreRulebookCover,
};
