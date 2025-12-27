import { loadMarkdownFile } from "@/lib/docs-loader";
import { MarkdownContent } from "@/components/docs/markdown-content";
import { TableOfContents } from "@/components/docs/table-of-contents";
import { notFound } from "next/navigation";

export default async function SpecificationsPage() {
  const content = await loadMarkdownFile("specifications.md");

  if (!content) {
    notFound();
  }

  return (
    <div className="flex">
      {/* Main Content */}
      <div className="flex-1 px-8 py-8 max-w-4xl">
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold uppercase tracking-wider bg-purple-100 dark:bg-purple-900/30 text-purple-900 dark:text-purple-100 rounded-full">
            Core Concepts
          </div>
          <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-slate-100">
            Specifications
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Understanding how IDS specifications work
          </p>
        </div>
        <MarkdownContent content={content} />
      </div>

      {/* Table of Contents */}
      <TableOfContents content={content} />
    </div>
  );
}
