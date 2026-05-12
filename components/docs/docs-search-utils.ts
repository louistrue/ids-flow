import type { DocsSearchEntry } from "@/lib/docs-search";

export type DocsSearchHit = {
  /** Slug of the matched section; empty for the page-top chunk. */
  slug: string;
  /** Heading text; empty for the page-top chunk. */
  heading: string;
  /** Snippet of body content around the match, when matched in body only. */
  snippet?: string;
  /** True when the search term hit the heading text itself. */
  headingMatch: boolean;
};

export type DocsSearchPageResult = {
  href: string;
  pageTitle: string;
  section: string;
  hits: DocsSearchHit[];
};

/**
 * Build the deep-link URL for a search hit. We always carry the query along
 * in `?q=...` so the destination page can highlight the term, and we point
 * the fragment at the section slug so the browser scrolls there. Falls back
 * to `&` if the pageHref already has a query string.
 */
export function buildHitHref(
  pageHref: string,
  hit: DocsSearchHit,
  query: string,
): string {
  const sep = pageHref.includes("?") ? "&" : "?";
  const q = `${sep}q=${encodeURIComponent(query)}`;
  const frag = hit.slug ? `#${hit.slug}` : "";
  return `${pageHref}${q}${frag}`;
}

/**
 * Substring search across heading + content, returning one or more hits per
 * page (grouped so the UI can show "Page Title › Section heading" entries).
 * Sections within a page keep their original order; pages keep their
 * docs-config order.
 */
export function searchDocs(
  query: string,
  index: DocsSearchEntry[],
): DocsSearchPageResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const pageOrder: string[] = [];
  const byHref = new Map<string, DocsSearchPageResult>();

  for (const entry of index) {
    const inHeading = entry.heading.toLowerCase().includes(q);
    const inContent = entry.content.toLowerCase().includes(q);
    const inSection = entry.section.toLowerCase().includes(q);
    const inPageTitle = entry.pageTitle.toLowerCase().includes(q);
    if (!inHeading && !inContent && !inSection && !inPageTitle) continue;

    if (!byHref.has(entry.href)) {
      byHref.set(entry.href, {
        href: entry.href,
        pageTitle: entry.pageTitle,
        section: entry.section,
        hits: [],
      });
      pageOrder.push(entry.href);
    }

    const page = byHref.get(entry.href)!;
    if (inHeading || inContent) {
      // Real chunk-level hit: link straight to the heading.
      page.hits.push({
        slug: entry.slug,
        heading: entry.heading,
        snippet: inContent ? makeSnippet(entry.content, q) : undefined,
        headingMatch: inHeading,
      });
    } else if (page.hits.length === 0) {
      // Section name or page title matched, but this chunk's body didn't.
      // Add a single page-top fallback so the page appears in results once
      // — without duplicating it for every chunk on the page.
      page.hits.push({ slug: "", heading: "", headingMatch: false });
    }
  }

  return pageOrder.map((href) => byHref.get(href)!);
}

const SNIPPET_LENGTH = 140;

function makeSnippet(content: string, lowerQuery: string): string {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(lowerQuery);
  if (idx === -1) {
    return content.slice(0, SNIPPET_LENGTH) + (content.length > SNIPPET_LENGTH ? "…" : "");
  }
  const window = SNIPPET_LENGTH;
  const start = Math.max(0, idx - Math.floor(window / 3));
  const end = Math.min(content.length, start + window);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < content.length ? "…" : "";
  return prefix + content.slice(start, end) + suffix;
}
