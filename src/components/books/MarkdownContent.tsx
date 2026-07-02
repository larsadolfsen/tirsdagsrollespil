import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
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

const components: ComponentProps<typeof ReactMarkdown>["components"] = {
  h1: ({ children }) => <Heading level={2} variant="subsection">{children}</Heading>,
  h2: ({ children }) => <Heading level={3} variant="subsection">{children}</Heading>,
  h3: ({ children }) => <Heading level={4} variant="subsection">{children}</Heading>,
  h4: ({ children }) => <Heading level={5} variant="subsection">{children}</Heading>,
  h5: ({ children }) => <Heading level={6} variant="subsection">{children}</Heading>,
  h6: ({ children }) => <Heading level={6} variant="subsection">{children}</Heading>,
  p: ({ children }) => <Text className="mb-3 last:mb-0">{children}</Text>,
  table: ({ children }) => <Table className="mb-3">{children}</Table>,
  thead: ({ children }) => <TableHeader>{children}</TableHeader>,
  tbody: ({ children }) => <TableBody>{children}</TableBody>,
  tr: ({ children }) => <TableRow>{children}</TableRow>,
  th: ({ children }) => <TableHead>{children}</TableHead>,
  td: ({ children }) => <TableCell>{children}</TableCell>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-5 wfrp-text text-gray-200">{children}</ul>,
  ol: ({ children }) => <ol className="mb-3 list-decimal space-y-1 pl-5 wfrp-text text-gray-200">{children}</ol>,
  li: ({ children }) => <li>{children}</li>,
};

export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {content}
    </ReactMarkdown>
  );
}
