"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <div
      ref={containerRef}
      className="prose prose-slate dark:prose-invert max-w-none [&_mark.docs-hit]:bg-yellow-200/80 dark:[&_mark.docs-hit]:bg-yellow-500/30 [&_mark.docs-hit]:text-slate-900 dark:[&_mark.docs-hit]:text-slate-100 [&_mark.docs-hit]:rounded-sm [&_mark.docs-hit]:px-0.5"
    >
      {/*
        useSearchParams() forces the closest segment to bail out of static
        prerendering, so we tuck it behind a Suspense boundary that renders
        nothing until hydration. The page itself can still be statically
        prerendered; only the highlighter runs on the client.
      */}
      <Suspense fallback={null}>
        <SearchHighlighter containerRef={containerRef} content={content} />
      </Suspense>
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
                'integration-guide.md': '/docs/integration-guide',
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
          // Lists with proper styling
          ul: ({ node, ...props }) => (
            <ul
              className="list-disc pl-6 my-4 space-y-2"
              {...props}
            />
          ),
          ol: ({ node, ...props }) => (
            <ol
              className="list-decimal pl-6 my-4 space-y-2"
              {...props}
            />
          ),
          li: ({ node, ...props }) => (
            <li
              className="text-slate-700 dark:text-slate-300"
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

// ---------- Search-term highlighting (in-place, post-render) ----------

const HIGHLIGHT_CLASS = "docs-hit";
// Avoid touching inline elements that would corrupt visually (code samples
// keep their syntax highlighting; pre/code spans are skipped). Headings are
// included so the destination anchor flashes the term visibly.
const SKIP_SELECTOR = "pre, code, mark, script, style";

/**
 * Reads `?q=` from the URL and wraps matches in the prose container in
 * <mark.docs-hit>. Tucked behind Suspense in the parent so useSearchParams
 * doesn't bail the page out of static prerendering.
 */
function SearchHighlighter({
  containerRef,
  content,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  content: string;
}) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;
    clearHighlights(root);
    if (query.length > 0) highlightTextNodes(root, query);
    return () => {
      // On unmount or query change, strip any marks we added so subsequent
      // navigations don't leave stale highlights from the previous page.
      if (root) clearHighlights(root);
    };
  }, [query, content, containerRef]);

  return null;
}

function clearHighlights(root: HTMLElement) {
  const marks = root.querySelectorAll<HTMLElement>(`mark.${HIGHLIGHT_CLASS}`);
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (!parent) return;
    while (mark.firstChild) parent.insertBefore(mark.firstChild, mark);
    parent.removeChild(mark);
    parent.normalize();
  });
}

function highlightTextNodes(root: HTMLElement, query: string) {
  const q = query.toLowerCase();
  if (!q) return;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (parent.closest(SKIP_SELECTOR)) return NodeFilter.FILTER_REJECT;
      const text = node.nodeValue ?? "";
      if (!text || !text.toLowerCase().includes(q)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });
  // Collect first so we don't mutate while iterating.
  const targets: Text[] = [];
  let current = walker.nextNode();
  while (current) {
    targets.push(current as Text);
    current = walker.nextNode();
  }

  for (const textNode of targets) {
    const text = textNode.nodeValue ?? "";
    const lower = text.toLowerCase();
    const frag = document.createDocumentFragment();
    let cursor = 0;
    while (cursor < text.length) {
      const idx = lower.indexOf(q, cursor);
      if (idx === -1) {
        frag.appendChild(document.createTextNode(text.slice(cursor)));
        break;
      }
      if (idx > cursor) {
        frag.appendChild(document.createTextNode(text.slice(cursor, idx)));
      }
      const mark = document.createElement("mark");
      mark.className = HIGHLIGHT_CLASS;
      mark.textContent = text.slice(idx, idx + q.length);
      frag.appendChild(mark);
      cursor = idx + q.length;
    }
    textNode.parentNode?.replaceChild(frag, textNode);
  }
}
