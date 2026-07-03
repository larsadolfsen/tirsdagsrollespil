import { useMemo } from "react";
import { Text } from "../ui";
import type { ExtractedHeading } from "./headingSlug";
import { LibraryNavList } from "./LibraryNavList";
import { useScrollSpy } from "./useScrollSpy";

export function ChapterTableOfContents({
  headings,
  title,
  showTitle = false,
  onSelect,
}: {
  headings: ExtractedHeading[];
  title: string;
  showTitle?: boolean;
  onSelect?: () => void;
}) {
  const sections = useMemo(() => headings.filter((heading) => heading.level === 2), [headings]);
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
  const activeId = useScrollSpy(sectionIds);

  if (sections.length < 2) return null;

  return (
    <>
      {showTitle ? (
        <Text as="span" variant="bodyStrongMuted" className="wfrp-label mb-1">
          {title}
        </Text>
      ) : null}
      <LibraryNavList
        ariaLabel="Chapter contents"
        items={sections.map((section) => ({
          id: section.id,
          label: section.text,
          isActive: section.id === activeId,
          href: `#${section.id}`,
          onClick: onSelect,
        }))}
      />
    </>
  );
}
