export type ExtractedHeading = {
  level: number;
  text: string;
  id: string;
};

function slugifyHeadingText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createHeadingSlugger() {
  const seen = new Map<string, number>();

  return (text: string): string => {
    const base = slugifyHeadingText(text) || "section";
    const count = seen.get(base) ?? 0;
    seen.set(base, count + 1);
    return count === 0 ? base : `${base}-${count}`;
  };
}

const headingLinePattern = /^(#{1,6})\s+(.+?)\s*$/;

export function extractHeadings(markdown: string): ExtractedHeading[] {
  const slugify = createHeadingSlugger();
  const headings: ExtractedHeading[] = [];

  for (const line of markdown.split("\n")) {
    const match = headingLinePattern.exec(line);
    if (!match) continue;

    const level = match[1].length;
    const text = match[2].trim();
    headings.push({ level, text, id: slugify(text) });
  }

  return headings;
}
