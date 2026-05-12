import "server-only";
import GithubSlugger from "github-slugger";
import { loadMarkdownFile } from "./docs-loader";
import { docsConfig } from "./docs-config";

/**
 * One indexable chunk of a documentation page. We split each page into chunks
 * at `##` / `###` / … headings so a search hit can deep-link to the exact
 * section instead of dumping the user at the top of the page. The slug
 * matches what `rehype-slug` (and our `<h2 id="…">` rendering) emits, so the
 * fragment in `${href}#${slug}` lands on the right heading.
 */
export type DocsSearchEntry = {
  href: string;
  pageTitle: string;
  section: string;
  /** Heading text of the chunk; empty string for content before the first heading. */
  heading: string;
  /** Slug compatible with rehype-slug. Empty when there's no heading. */
  slug: string;
  /** Plain-text content of the chunk, with markdown stripped. */
  content: string;
};

/** Markdown → plain text. */
function stripMarkdown(md: string): string {
  return md
    // Fenced code: keep the inner content (drop fence + optional lang). IFC
    // identifiers and XML snippets in the docs commonly live in fenced blocks,
    // so this preserves them in the search index.
    .replace(/```\w*\n?([\s\S]*?)```/g, "$1")
    // Inline code: keep the text. Terms like `Pset_WallCommon` or `IfcBoolean`
    // appear almost exclusively in inline code spans in the IDS docs.
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Split a markdown document into one chunk per heading.
 *
 * The pre-heading prose (if any) becomes the first chunk with no heading and
 * no slug — clicking it just lands on the page top. Slugs are generated with
 * GithubSlugger (the same library rehype-slug uses), and each slugger
 * instance handles its own duplicate-suffix accounting so two `## Setup`
 * headings on the same page get `setup` and `setup-1` to match the rendered
 * DOM.
 *
 * Fenced code blocks are skipped while looking for heading lines so we don't
 * mistake a `#` inside a code sample for a section break.
 */
function splitMarkdownIntoChunks(md: string): Array<{ heading: string; slug: string; body: string }> {
  const lines = md.split(/\r?\n/);
  const slugger = new GithubSlugger();
  const chunks: Array<{ heading: string; slug: string; body: string[] }> = [
    { heading: "", slug: "", body: [] },
  ];
  let inFence = false;

  for (const line of lines) {
    if (line.startsWith("```")) {
      inFence = !inFence;
      chunks[chunks.length - 1].body.push(line);
      continue;
    }
    if (!inFence) {
      const match = /^(#{1,6})\s+(.+?)\s*$/.exec(line);
      if (match) {
        const heading = match[2].trim();
        chunks.push({ heading, slug: slugger.slug(heading), body: [] });
        continue;
      }
    }
    chunks[chunks.length - 1].body.push(line);
  }

  return chunks
    .map((c) => ({ heading: c.heading, slug: c.slug, body: stripMarkdown(c.body.join("\n")) }))
    .filter((c) => c.heading || c.body.length > 0);
}

/**
 * Build the full-text index. Called from the docs layout (Server Component)
 * so the result is computed at request time and serialised into the client
 * sidebar as a prop.
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
      if (!raw) continue;

      const chunks = splitMarkdownIntoChunks(raw);
      for (const chunk of chunks) {
        entries.push({
          href: item.href,
          pageTitle: item.title,
          section: section.title,
          heading: chunk.heading,
          slug: chunk.slug,
          content: chunk.body,
        });
      }
    }
  }
  return entries;
}
