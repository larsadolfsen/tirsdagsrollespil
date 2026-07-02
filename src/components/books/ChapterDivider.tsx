import type { ReactNode } from "react";
import { Heading } from "../ui";

export function ChapterHeading({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <div className="mb-3 inline-block max-w-full border-b border-wfrp-red">
      <Heading id={id} level={1} variant="chapterH1">{children}</Heading>
    </div>
  );
}
