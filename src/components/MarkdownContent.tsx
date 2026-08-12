import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const components: Components = {
  h1: ({ children }) => (
    <h2 className="font-display mt-10 text-2xl font-extrabold tracking-tight text-ink first:mt-0">
      {children}
    </h2>
  ),
  h2: ({ children }) => (
    <h2 className="font-display mt-10 text-xl font-extrabold tracking-tight text-ink first:mt-0 md:text-2xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="font-display mt-8 text-lg font-extrabold tracking-tight text-ink first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="mt-6 text-base font-bold text-ink first:mt-0">{children}</h4>
  ),
  p: ({ children }) => (
    <p className="mt-4 text-base leading-relaxed text-ink-muted first:mt-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-ink">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-ink-muted">{children}</em>,
  ul: ({ children }) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-ink-muted">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-base leading-relaxed text-ink-muted">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ href, children }) => (
    <a
      href={href}
      className="font-semibold text-trust underline-offset-2 hover:underline"
      {...(href?.startsWith("http")
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="mt-6 border-l-4 border-amber pl-4 text-ink-muted italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-border" />,
  code: ({ children, className }) => {
    const isBlock = Boolean(className);
    if (isBlock) {
      return (
        <code className="block overflow-x-auto rounded-lg bg-surface-sunken p-4 text-sm text-ink">
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-surface-sunken px-1.5 py-0.5 text-sm text-ink">
        {children}
      </code>
    );
  },
  pre: ({ children }) => <pre className="mt-4 overflow-x-auto">{children}</pre>,
  table: ({ children }) => (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-border bg-surface-sunken px-3 py-2 font-semibold text-ink">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-border px-3 py-2 text-ink-muted">{children}</td>
  ),
};

type Props = {
  children: string;
  className?: string;
};

/**
 * Renders CMS markdown (headings, bold, lists, links) with site typography.
 * Server-compatible — no client hooks.
 */
export function MarkdownContent({ children, className }: Props) {
  return (
    <div className={className} data-testid="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
