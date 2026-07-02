import type { ReactNode } from "react";
import { Heading } from "../ui";

export function ChapterHeading({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <div className="mb-3 flex max-w-full justify-center border-b-2 border-wfrp-red text-center sm:inline-block sm:justify-normal sm:text-left">
      <Heading id={id} level={1} variant="chapterH1">{children}</Heading>
    </div>
  );
}
