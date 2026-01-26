"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { docsConfig } from "@/lib/docs-config";
import { cn } from "@/lib/utils";
import { Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function MobileDocsNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();

  // Track if component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      // Store current scroll position
      const scrollY = window.scrollY;
      const originalStyle = {
        overflow: document.body.style.overflow,
        position: document.body.style.position,
        top: document.body.style.top,
        width: document.body.style.width,
      };

      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';

      return () => {
        // Restore original styles
        document.body.style.overflow = originalStyle.overflow;
        document.body.style.position = originalStyle.position;
        document.body.style.top = originalStyle.top;
        document.body.style.width = originalStyle.width;
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

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

  const modalContent = isOpen && mounted ? (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 z-[9999]"
        onClick={() => setIsOpen(false)}
        style={{ touchAction: 'none' }}
      />

      {/* Bottom Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[10000] bg-white dark:bg-slate-950 rounded-t-2xl shadow-2xl"
        style={{
          maxHeight: '85vh',
          animation: 'slideUp 0.3s ease-out',
          display: 'flex',
          flexDirection: 'column',
          touchAction: 'pan-y'
        }}
      >
        <style jsx>{`
          @keyframes slideUp {
            from {
              transform: translateY(100%);
            }
            to {
              transform: translateY(0);
            }
          }
        `}</style>

        <div className="flex flex-col bg-white dark:bg-slate-950" style={{ height: '85vh', maxHeight: '85vh' }}>
          {/* Handle Bar */}
          <div className="flex-shrink-0 flex justify-center pt-3 pb-2 bg-white dark:bg-slate-950">
            <div className="w-12 h-1 bg-slate-300 dark:bg-slate-700 rounded-full" />
          </div>

          {/* Header */}
          <div className="flex-shrink-0 px-4 pb-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-lg px-3 py-1.5 shadow-md">
                  <span className="text-white font-bold text-sm">IDS</span>
                </div>
                <div>
                  <h2 className="font-semibold text-base text-slate-900 dark:text-slate-100">Documentation</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Learn IDSedit</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-2"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Back to Editor Button */}
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 mb-3 text-sm rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
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
                className="pl-8 pr-8 h-9 text-sm bg-white dark:bg-slate-900"
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

          {/* Navigation - Scrollable */}
          <div
            className="flex-1 bg-white dark:bg-slate-950 overflow-y-auto"
            style={{
              minHeight: 0,
              WebkitOverflowScrolling: 'touch'
            }}
          >
            <nav className="px-4 py-6 space-y-6">
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
                                "block px-3 py-2.5 text-sm rounded-lg transition-colors",
                                isActive
                                  ? "bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-medium"
                                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700"
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

              {/* Attribution */}
              <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed px-2">
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
            </nav>
          </div>
        </div>
      </div>
    </>
  ) : null;

  return (
    <>
      {/* Menu Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="md:hidden gap-2"
      >
        <Menu className="h-4 w-4" />
        Menu
      </Button>

      {/* Render modal via portal to document.body */}
      {mounted && modalContent && createPortal(modalContent, document.body)}
    </>
  );
}
