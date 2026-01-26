"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsConfig } from "@/lib/docs-config";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, Home, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function DocsSidebar() {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  // Filter docs based on search query
  const filteredConfig = searchQuery
    ? docsConfig
        .map((section) => ({
          ...section,
          items: section.items.filter((item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((section) => section.items.length > 0)
    : docsConfig;

  return (
    <aside className="hidden md:block w-64 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
      <div className="sticky top-0 h-screen flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
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
        <ScrollArea className="flex-1 px-4 py-6">
          <nav className="space-y-6">
            {filteredConfig.length > 0 ? (
              filteredConfig.map((section) => (
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
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400 px-2">
                No results found for &quot;{searchQuery}&quot;
              </p>
            )}
          </nav>
        </ScrollArea>

        {/* Attribution */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
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
