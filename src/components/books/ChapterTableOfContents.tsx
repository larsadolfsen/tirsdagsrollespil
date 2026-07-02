import { useMemo } from "react";
import { cn } from "@/src/lib/utils";
import { Text } from "../ui";
import type { ExtractedHeading } from "./headingSlug";
import { useScrollSpy } from "./useScrollSpy";

export function ChapterTableOfContents({
  headings,
  title,
  onSelect,
}: {
  headings: ExtractedHeading[];
  title: string;
  onSelect?: () => void;
}) {
  const sections = useMemo(() => headings.filter((heading) => heading.level === 2), [headings]);
  const sectionIds = useMemo(() => sections.map((section) => section.id), [sections]);
  const activeId = useScrollSpy(sectionIds);

  if (sections.length < 2) return null;

  return (
    <nav aria-label="Chapter contents" className="flex flex-col gap-1">
      <Text as="span" variant="bodyStrongMuted" className="wfrp-label mb-1">
        {title}
      </Text>
      {sections.map((section) => {
        const isActive = section.id === activeId;

        return (
          <a
            key={section.id}
            href={`#${section.id}`}
            onClick={onSelect}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded px-2 py-1.5 text-sm text-gray-300 transition-colors",
              "hover:bg-wfrp-control-hover hover:text-gray-100",
              isActive && "bg-wfrp-control-hover text-gray-100",
            )}
          >
            {section.text}
          </a>
        );
      })}
    </nav>
  );
}
