"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsConfig } from "@/lib/docs-config";
import type { DocsSearchEntry } from "@/lib/docs-search";
import { searchDocs } from "@/components/docs/docs-search-utils";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Home, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DocsSidebarProps {
  /** Server-built full-text search index passed down from the docs layout. */
  searchIndex: DocsSearchEntry[];
}

export function DocsSidebar({ searchIndex }: DocsSidebarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  const trimmed = searchQuery.trim();
  const isSearching = trimmed.length > 0;
  const results = useMemo(
    () => (isSearching ? searchDocs(trimmed, searchIndex) : []),
    [trimmed, searchIndex, isSearching]
  );

  return (
    <aside className="hidden md:block w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="sticky top-0 h-dvh flex flex-col overflow-hidden">
        {/* Header */}
        <div className="shrink-0 p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <h2 className="font-semibold text-lg">Documentation</h2>
          </div>
          <Button
            asChild
            variant="outline"
            size="sm"
            className="w-full justify-start mb-4"
          >
            <Link href="/">
              <Home className="h-4 w-4 mr-2" />
              Back to Editor
            </Link>
          </Button>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-9 text-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 min-h-0">
          <nav className="space-y-6 px-4 py-6 pb-8">
            {isSearching ? (
              results.length > 0 ? (
                results.map((section) => (
                  <div key={section.section}>
                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {section.section}
                    </h3>
                    <ul className="space-y-1">
                      {section.matches.map(({ entry, snippet }) => {
                        const isActive = pathname === entry.href;
                        return (
                          <li key={entry.href}>
                            <Link
                              href={entry.href}
                              className={cn(
                                "block px-2 py-1.5 text-sm rounded-md transition-colors",
                                isActive
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-medium"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                              )}
                            >
                              <div className="font-medium">{entry.title}</div>
                              {snippet ? (
                                <div className="mt-0.5 text-xs leading-snug text-slate-500 dark:text-slate-400 line-clamp-2">
                                  {highlight(snippet, trimmed)}
                                </div>
                              ) : null}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400 px-2">
                  No results found for &quot;{trimmed}&quot;
                </p>
              )
            ) : (
              docsConfig.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "block px-2 py-1.5 text-sm rounded-md transition-colors",
                              isActive
                                ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-medium"
                                : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}
                          >
                            {item.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))
            )}
          </nav>
        </ScrollArea>

        {/* Attribution */}
        <div className="shrink-0 p-4 border-t border-slate-200 dark:border-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            IDS is a{" "}
            <a
              href="https://www.buildingsmart.org/standards/bsi-standards/information-delivery-specification-ids/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              buildingSMART standard
            </a>
            . Documentation based on the{" "}
            <a
              href="https://github.com/buildingSMART/IDS"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              official IDS specification
            </a>
            .
          </p>
        </div>
      </div>
    </aside>
  );
}

/**
 * Wrap occurrences of the query in <mark> for the snippet preview.
 * Case-insensitive, preserves original casing in the snippet.
 */
function highlight(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const parts: React.ReactNode[] = [];
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  let i = 0;
  let cursor = 0;
  while (cursor < text.length) {
    const idx = lower.indexOf(q, cursor);
    if (idx === -1) {
      parts.push(text.slice(cursor));
      break;
    }
    if (idx > cursor) parts.push(text.slice(cursor, idx));
    parts.push(
      <mark
        key={i++}
        className="bg-yellow-200/70 dark:bg-yellow-500/30 text-slate-900 dark:text-slate-100 rounded-sm px-0.5"
      >
        {text.slice(idx, idx + q.length)}
      </mark>
    );
    cursor = idx + q.length;
  }
  return <>{parts}</>;
}
