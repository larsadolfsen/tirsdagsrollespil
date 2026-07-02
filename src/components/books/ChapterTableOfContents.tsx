import { Text } from "../ui";
import type { ExtractedHeading } from "./headingSlug";

export function ChapterTableOfContents({
  headings,
  onSelect,
}: {
  headings: ExtractedHeading[];
  onSelect?: () => void;
}) {
  const sections = headings.filter((heading) => heading.level === 1);

  if (sections.length < 2) return null;

  return (
    <nav aria-label="Chapter contents" className="flex flex-col gap-1">
      <Text as="span" variant="bodyStrongMuted" className="wfrp-label mb-1">
        Contents
      </Text>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          onClick={onSelect}
          className="rounded px-2 py-1.5 text-sm text-gray-300 hover:bg-wfrp-surface-raised hover:text-gray-100"
        >
          {section.text}
        </a>
      ))}
    </nav>
  );
}
