"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import rehypeSlug from "rehype-slug";
import "highlight.js/styles/github-dark.css";
import { MermaidDiagram } from "./mermaid-diagram";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSlug, rehypeHighlight]}
        components={{
          // Custom rendering for links to make them open in new tabs if external
          a: ({ node, ...props }) => {
            let href = props.href || "";
            const isExternal = href.startsWith("http");

            // Transform markdown file links to proper doc routes
            if (!isExternal && href.endsWith('.md')) {
              // Map markdown files to their doc routes
              const mdToRoute: Record<string, string> = {
                'specifications.md': '/docs/specifications',
                'ids-metadata.md': '/docs/metadata',
                'restrictions.md': '/docs/restrictions',
                'entity-facet.md': '/docs/facets/entity',
                'property-facet.md': '/docs/facets/property',
                'attribute-facet.md': '/docs/facets/attribute',
                'classification-facet.md': '/docs/facets/classification',
                'material-facet.md': '/docs/facets/material',
                'partof-facet.md': '/docs/facets/partof',
                'developer-guide.md': '/docs/developer-guide',
              };

              // Extract filename from href
              const filename = href.split('/').pop() || '';
              if (mdToRoute[filename]) {
                href = mdToRoute[filename];
              }
            }

            return (
              <a
                {...props}
                href={href}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                className="text-blue-600 dark:text-blue-400 hover:underline"
              />
            );
          },
          // Custom rendering for code blocks
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || "");
            const isInline = !match;
            const language = match ? match[1] : null;

            // Handle mermaid diagrams - break out of prose constraints
            if (language === "mermaid") {
              const chart = String(children).replace(/\n$/, "");
              return (
                <div className="not-prose">
                  <MermaidDiagram chart={chart} />
                </div>
              );
            }

            if (isInline) {
              return (
                <code
                  className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          // Custom table styling
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-6">
              <table
                className="min-w-full divide-y divide-slate-200 dark:divide-slate-700"
                {...props}
              />
            </div>
          ),
          th: ({ node, ...props }) => (
            <th
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-left text-sm font-semibold"
              {...props}
            />
          ),
          td: ({ node, ...props }) => (
            <td
              className="px-4 py-2 border-t border-slate-200 dark:border-slate-700 text-sm"
              {...props}
            />
          ),
          // Heading anchors
          h1: ({ node, ...props }) => (
            <h1 className="text-4xl font-bold mt-8 mb-4 scroll-mt-20" {...props} />
          ),
          h2: ({ node, ...props }) => (
            <h2 className="text-3xl font-bold mt-8 mb-4 scroll-mt-20" {...props} />
          ),
          h3: ({ node, ...props }) => (
            <h3 className="text-2xl font-semibold mt-6 mb-3 scroll-mt-20" {...props} />
          ),
          h4: ({ node, ...props }) => (
            <h4 className="text-xl font-semibold mt-4 mb-2 scroll-mt-20" {...props} />
          ),
          // Images
          img: ({ node, ...props }) => (
            <img
              className="rounded-lg shadow-md my-6 max-w-full h-auto"
              {...props}
              alt={props.alt || ""}
            />
          ),
          // Blockquotes
          blockquote: ({ node, ...props }) => (
            <blockquote
              className="border-l-4 border-blue-500 pl-4 italic my-4 text-slate-600 dark:text-slate-400"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
