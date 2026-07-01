// import.meta.glob is a Vite-only compile-time macro: it only works when this
// module is loaded through Vite (dev server or build), never under Node directly.
// Keep this file's usage out of anything imported by Node-side tests.
const chapterModules = import.meta.glob("./*/*.md", {
  query: "?raw",
  import: "default",
}) as Record<string, () => Promise<string>>;

export async function loadChapterContent(bookId: string, chapterId: string): Promise<string> {
  const path = `./${bookId}/${chapterId}.md`;
  const loader = chapterModules[path];

  if (!loader) {
    throw new Error(`No chapter content found for book "${bookId}", chapter "${chapterId}"`);
  }

  return loader();
}
