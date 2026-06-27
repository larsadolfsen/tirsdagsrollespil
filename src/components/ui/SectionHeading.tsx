import type { ComponentPropsWithoutRef } from "react";
import { Heading } from "./Heading";

export type SectionHeadingProps = Omit<ComponentPropsWithoutRef<"h2">, "className" | "style">;

export function SectionHeading(props: SectionHeadingProps) {
  return <Heading level={2} variant="section" {...props} />;
}
