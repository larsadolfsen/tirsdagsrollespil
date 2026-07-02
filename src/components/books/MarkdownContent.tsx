import { useMemo, type ComponentProps, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import {
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from "../ui";
import type { ExtractedHeading } from "./headingSlug";

function nodeText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join("");
  if (typeof node === "object" && "props" in node) {
    return nodeText((node as { props?: { children?: ReactNode } }).props?.children);
  }
  return "";
}

export function MarkdownContent({
  content,
  headings,
}: {
  content: string;
  headings: ExtractedHeading[];
}) {
  // Look up ids by heading text (grouped in document order) rather than by
  // a shared render-call counter: React StrictMode double-invokes these
  // inline component functions during render, which would otherwise desync
  // a simple incrementing counter from the actual document order of
  // headings. Grouping by text and consuming one id per group, per render
  // pass, keeps each invocation of MarkdownContent self-consistent — only
  // the committed invocation's output is ever shown.
  const idQueuesByText = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const heading of headings) {
      const queue = map.get(heading.text);
      if (queue) {
        queue.push(heading.id);
      } else {
        map.set(heading.text, [heading.id]);
      }
    }
    return map;
  }, [headings]);

  const consumedCountByText = new Map<string, number>();
  const resolveHeadingId = (children: ReactNode): string | undefined => {
    const text = nodeText(children).trim();
    const queue = idQueuesByText.get(text);
    if (!queue) return undefined;
    const consumed = consumedCountByText.get(text) ?? 0;
    consumedCountByText.set(text, consumed + 1);
    return queue[consumed] ?? queue[queue.length - 1];
  };

  const components: ComponentProps<typeof ReactMarkdown>["components"] = {
    h1: ({ children }) => <Heading id={resolveHeadingId(children)} level={2} variant="subsection">{children}</Heading>,
    h2: ({ children }) => <Heading id={resolveHeadingId(children)} level={3} variant="subsection">{children}</Heading>,
    h3: ({ children }) => <Heading id={resolveHeadingId(children)} level={4} variant="subsection">{children}</Heading>,
    h4: ({ children }) => <Heading id={resolveHeadingId(children)} level={5} variant="subsection">{children}</Heading>,
    h5: ({ children }) => <Heading id={resolveHeadingId(children)} level={6} variant="subsection">{children}</Heading>,
    h6: ({ children }) => <Heading id={resolveHeadingId(children)} level={6} variant="subsection">{children}</Heading>,
    p: ({ children }) => <Text className="mb-3 last:mb-0">{children}</Text>,
    table: ({ children }) => <Table className="mb-3">{children}</Table>,
    thead: ({ children }) => <TableHeader>{children}</TableHeader>,
    tbody: ({ children }) => <TableBody>{children}</TableBody>,
    tr: ({ children }) => <TableRow>{children}</TableRow>,
    th: ({ children }) => <TableHead>{children}</TableHead>,
    td: ({ children }) => <TableCell className="align-top">{children}</TableCell>,
    ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 wfrp-text text-gray-200">{children}</ul>,
    ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 wfrp-text text-gray-200">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
  };

  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
