"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export function TableOfContents({ content }: TableOfContentsProps) {
  const [headings, setHeadings] = useState<TocItem[]>([]);
  const [activeId, setActiveId] = useState<string>("");

  useEffect(() => {
    // Extract headings from markdown content
    const headingRegex = /^(#{2,4})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(headingRegex));

    const tocItems: TocItem[] = matches.map((match) => {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");

      return { id, text, level };
    });

    setHeadings(tocItems);
  }, [content]);

  useEffect(() => {
    // Track active heading on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-80px 0px -80% 0px" }
    );

    // Observe all headings
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) {
    return null;
  }

  return (
    <aside className="hidden xl:block w-64 border-l border-slate-200 dark:border-slate-800">
      <div className="sticky top-0 h-screen p-6">
        <h3 className="text-sm font-semibold mb-4 text-slate-900 dark:text-slate-100">
          On This Page
        </h3>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <nav>
            <ul className="space-y-2 text-sm">
              {headings.map((heading) => (
                <li
                  key={heading.id}
                  style={{ paddingLeft: `${(heading.level - 2) * 0.75}rem` }}
                >
                  <a
                    href={`#${heading.id}`}
                    className={cn(
                      "block py-1 transition-colors hover:text-slate-900 dark:hover:text-slate-100",
                      activeId === heading.id
                        ? "text-blue-600 dark:text-blue-400 font-medium"
                        : "text-slate-600 dark:text-slate-400"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      document
                        .getElementById(heading.id)
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}
