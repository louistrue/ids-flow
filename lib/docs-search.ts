import "server-only";
import { loadMarkdownFile } from "./docs-loader";
import { docsConfig } from "./docs-config";

export type DocsSearchEntry = {
  href: string;
  title: string;
  section: string;
  /** Plain-text content used for matching + snippet extraction. */
  content: string;
};

/**
 * Markdown → plain text. Strips fence blocks, links, headings markers,
 * inline code, emphasis, and image syntax so the search index and snippet
 * extraction work on readable prose.
 */
function stripMarkdown(md: string): string {
  return md
    // Fenced code blocks
    .replace(/```[\s\S]*?```/g, " ")
    // Inline code
    .replace(/`[^`]*`/g, " ")
    // Images: ![alt](src) → alt
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    // Links: [text](href) → text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    // Heading markers
    .replace(/^#{1,6}\s+/gm, "")
    // Bold / italic markers
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    // HTML tags
    .replace(/<[^>]+>/g, " ")
    // Collapse whitespace
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Server-side: read every docs-config entry's content (either the backing
 * markdown file or its inline `searchableText`) and produce a search index
 * the sidebar can do full-text matching against. Called from the docs
 * layout (Server Component) so the result is computed once at request
 * time and serialised down to the client sidebar as a prop.
 */
export async function buildDocsSearchIndex(): Promise<DocsSearchEntry[]> {
  const entries: DocsSearchEntry[] = [];
  for (const section of docsConfig) {
    for (const item of section.items) {
      let raw = "";
      if (item.mdFile) {
        raw = (await loadMarkdownFile(item.mdFile)) || "";
      } else if (item.searchableText) {
        raw = item.searchableText;
      }
      entries.push({
        href: item.href,
        title: item.title,
        section: section.title,
        content: stripMarkdown(raw),
      });
    }
  }
  return entries;
}
