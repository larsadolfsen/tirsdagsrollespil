import { useMemo, type ComponentProps, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";
import { visit } from "unist-util-visit";
import type { Element } from "hast";
import {
  Heading,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  Text,
} from "../ui";
import { ChapterHeading } from "./ChapterDivider";
import type { ExtractedHeading } from "./headingSlug";

// react-markdown drops the deprecated HTML `align` attribute that remark-gfm
// puts on table cells, so convert it to an inline `text-align` style before
// it reaches the renderer.
function rehypeTableAlignToStyle() {
  return (tree: Element) => {
    visit(tree, "element", (node: Element) => {
      if ((node.tagName === "th" || node.tagName === "td") && typeof node.properties.align === "string") {
        node.properties.style = `text-align: ${node.properties.align}`;
        delete node.properties.align;
      }
    });
  };
}

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
    h1: ({ children }) => <ChapterHeading id={resolveHeadingId(children)}>{children}</ChapterHeading>,
    h2: ({ children }) => <Heading id={resolveHeadingId(children)} level={2} variant="chapterH2">{children}</Heading>,
    h3: ({ children }) => <Heading id={resolveHeadingId(children)} level={3} variant="chapterH3">{children}</Heading>,
    h4: ({ children }) => <Heading id={resolveHeadingId(children)} level={4} variant="chapterH4">{children}</Heading>,
    h5: ({ children }) => <Heading id={resolveHeadingId(children)} level={5} variant="chapterH5">{children}</Heading>,
    h6: ({ children }) => <Heading id={resolveHeadingId(children)} level={6} variant="chapterH6">{children}</Heading>,
    p: ({ children }) => <Text className="mb-3 max-w-[620px] text-base last:mb-0">{children}</Text>,
    table: ({ children }) => <Table className="mb-3">{children}</Table>,
    thead: ({ children }) => <TableHeader>{children}</TableHeader>,
    tbody: ({ children }) => <TableBody className="[&>tr:nth-child(odd)]:bg-card">{children}</TableBody>,
    tr: ({ children }) => <tr className="border-b border-border transition-colors">{children}</tr>,
    th: ({ children, style }) => <TableHead style={style}>{children}</TableHead>,
    td: ({ children, style }) => <TableCell className="align-top" style={style}>{children}</TableCell>,
    ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 wfrp-text text-gray-200">{children}</ul>,
    ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 wfrp-text text-gray-200">{children}</ol>,
    li: ({ children }) => <li>{children}</li>,
  };

  return (
    <div className="min-w-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeRaw, rehypeTableAlignToStyle]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
