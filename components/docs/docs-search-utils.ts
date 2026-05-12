import type { DocsSearchEntry } from "@/lib/docs-search";

export type DocsSearchMatch = {
  entry: DocsSearchEntry;
  /** Snippet of content around the match, only set when matched in content. */
  snippet?: string;
};

export type DocsSearchSectionResult = {
  section: string;
  matches: DocsSearchMatch[];
};

/**
 * Simple case-insensitive substring search across title and stripped content.
 * Section name is also searched so typing the section ("Using the Editor")
 * surfaces every page inside it.
 *
 * Returns one bucket per section in the order they first appear in the index,
 * so the rendered results follow the same top-to-bottom layout as the unfiltered
 * sidebar.
 */
export function searchDocs(
  query: string,
  index: DocsSearchEntry[]
): DocsSearchSectionResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const order: string[] = [];
  const bySection = new Map<string, DocsSearchMatch[]>();

  for (const entry of index) {
    const lowerTitle = entry.title.toLowerCase();
    const lowerSection = entry.section.toLowerCase();
    const lowerContent = entry.content.toLowerCase();
    const titleMatch = lowerTitle.includes(q);
    const sectionMatch = lowerSection.includes(q);
    const contentMatch = lowerContent.includes(q);
    if (!titleMatch && !sectionMatch && !contentMatch) continue;

    const snippet =
      contentMatch && !titleMatch ? makeSnippet(entry.content, q) : undefined;

    if (!bySection.has(entry.section)) {
      bySection.set(entry.section, []);
      order.push(entry.section);
    }
    bySection.get(entry.section)!.push({ entry, snippet });
  }

  return order.map((section) => ({
    section,
    matches: bySection.get(section)!,
  }));
}

const SNIPPET_LENGTH = 140;

function makeSnippet(content: string, lowerQuery: string): string {
  const lower = content.toLowerCase();
  const idx = lower.indexOf(lowerQuery);
  if (idx === -1) {
    return content.slice(0, SNIPPET_LENGTH) + (content.length > SNIPPET_LENGTH ? "…" : "");
  }
  // Center the snippet around the match, biased to keep it readable.
  const window = SNIPPET_LENGTH;
  const start = Math.max(0, idx - Math.floor(window / 3));
  const end = Math.min(content.length, start + window);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < content.length ? "…" : "";
  return prefix + content.slice(start, end) + suffix;
}
