"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsConfig } from "@/lib/docs-config";
import { cn } from "@/lib/utils";
import { Menu, X, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export function MobileDocsNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();

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
    <div className="md:hidden">
      {/* Menu Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="gap-2"
      >
        <Menu className="h-4 w-4" />
        Menu
      </Button>

      {/* Mobile Overlay */}
      {isOpen && (
        <div className="md:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 z-[100]"
            onClick={() => setIsOpen(false)}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-slate-950 z-[101] shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800">
              {/* Header */}
              <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    <h2 className="font-semibold">Documentation</h2>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    aria-label="Close menu"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Back to Editor Button */}
                <Link
                  href="/"
                  className="flex items-center gap-2 px-3 py-2 mb-4 text-sm rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Editor
                </Link>

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
                                  onClick={() => setIsOpen(false)}
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
